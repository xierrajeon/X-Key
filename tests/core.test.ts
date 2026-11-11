import {test} from 'node:test';
import assert from 'node:assert/strict';
import {encrypt,decrypt,hash,newCode} from '../src/lib/crypto';
import {csv} from '../src/lib/csv';
import type {Account} from '../src/lib/types';
test('encrypted values roundtrip; tampering and wrong keys fail',()=>{
 process.env.VAULT_ENCRYPTION_KEY='ab'.repeat(32);
 const encoded=encrypt('비밀번호🔑');assert.equal(decrypt(encoded),'비밀번호🔑');assert.ok(!encoded.includes('비밀번호'));
 const parts=encoded.split('.');parts[1]=Buffer.alloc(16).toString('base64');assert.throws(()=>decrypt(parts.join('.')));
 process.env.VAULT_ENCRYPTION_KEY='cd'.repeat(32);assert.throws(()=>decrypt(encoded));
});
test('random access codes and stable hashes',()=>{const a=newCode(),b=newCode();assert.notEqual(a,b);assert.equal(hash(a),hash(a));assert.match(a,/^XKEY-(?:[A-F0-9]{4}-){5}[A-F0-9]{4}$/);});
test('CSV includes BOM, escapes multiline notes, neutralizes formulas',()=>{
 const row={category:'한글',name:'=SUM(A1)',url:'https://example.com',username:'user',secret:'secret',kind:'password',public:true,memo:'쉼표, "인용"\n다음 줄',updated_at:'2026-11-11'} as Account;
 const value=csv([row]);assert.equal(value[0],'\uFEFF');assert.ok(value.includes('"\'=SUM(A1)"'));assert.ok(value.includes('"쉼표, ""인용""\n다음 줄"'));assert.ok(value.includes('"공개"'));
});
