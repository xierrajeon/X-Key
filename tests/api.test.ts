import {test} from 'node:test';
import assert from 'node:assert/strict';
const base=process.env.XKEY_TEST_URL;
test('access boundaries, setup guard, code revocation and seven-day lifetime', {skip:!base},async()=>{
 const origin=base!;
 async function post(action:string,body:Record<string,unknown>={},cookie=''){
 const r=await fetch(`${origin}/api/vault`,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',cookie},body:JSON.stringify({action,...body})});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]||''};}
 async function get(admin:boolean,cookie=''){const r=await fetch(`${origin}/api/vault?admin=${admin?'1':'0'}`,{headers:{cookie}});return r.json();}
 const initial=await get(false);assert.equal(initial.demo,true,'API tests may only run against the disposable demo server');assert.equal(initial.identity,null);
 assert.equal((await post('unlock',{code:'bad'})).status,401);
 const viewer=await post('unlock',{code:'XKEY-TEAM-DEMO'});assert.equal(viewer.status,200);
 const publicData=await get(false,viewer.cookie);assert.ok(publicData.accounts.length);assert.ok(publicData.accounts.every((a:{public:boolean})=>a.public));assert.equal(publicData.codes.length,0);
 assert.equal((await get(true,viewer.cookie)).identity,null);
 assert.equal((await post('create-code',{label:'unauthorized'},viewer.cookie)).status,401);
 const admin=await post('login',{username:'admin',password:'admin'});assert.equal(admin.status,200);
 assert.equal((await get(true,admin.cookie)).identity.must_change,true);
 assert.equal((await post('create-code',{label:'blocked'},admin.cookie)).status,403);
 const changed=await post('change-admin',{username:'admin',current:'admin',password:'test-password-2026'},admin.cookie);assert.equal(changed.status,200);
 assert.equal((await get(true,admin.cookie)).identity,null);
 const full=await get(true,changed.cookie);assert.ok(full.accounts.some((a:{public:boolean})=>!a.public));
 const code=await post('create-code',{label:'Boundary test',scope:'public'},changed.cookie);assert.equal(code.status,200);
 const list=await get(true,changed.cookie),created=list.codes.find((c:{label:string})=>c.label==='Boundary test');assert.ok(created);assert.ok(Math.abs(Date.parse(created.expires_at)-Date.now()-7*86400000)<10000);
 assert.ok(!JSON.stringify(list.codes).includes(code.data.code));assert.ok(!JSON.stringify(list.codes).includes('code_hash'));
 const authenticated=await post('unlock',{code:code.data.code});assert.equal(authenticated.status,200);
 await post('delete-code',{id:created.id},changed.cookie);
 assert.equal((await get(false,authenticated.cookie)).identity,null);
 assert.equal((await post('unlock',{code:code.data.code})).status,401);
 const r=await fetch(`${origin}/api/vault`,{method:'POST',headers:{Origin:'https://other.example','Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});assert.equal(r.status,403);
});
