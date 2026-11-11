import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeAppUrl} from '../src/lib/app-url';
import {isSameOrigin} from '../src/lib/origin';
test('deployment URL is normalized and paths, credentials and unsafe schemes are rejected',()=>{
 assert.equal(normalizeAppUrl('https://x-key.example.com/'),'https://x-key.example.com');
 assert.equal(normalizeAppUrl('http://localhost:3000'),'http://localhost:3000');
 for(const value of ['https://example.com/admin','https://user:pass@example.com','javascript:alert(1)','https://example.com?key=1','https://example.com/#hash'])assert.throws(()=>normalizeAppUrl(value));
});
test('configured deployment origin works behind an internal proxy',()=>{
 const headers=new Headers({host:'internal:3000',origin:'https://x-key.example.com'});
 assert.equal(isSameOrigin(headers,'http:','https://x-key.example.com/'),true);
 assert.equal(isSameOrigin(new Headers({host:'internal:3000',origin:'https://other.example'}),'http:','https://x-key.example.com'),false);
});
