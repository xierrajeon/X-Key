// Explicit opt-in smoke test: only creates and removes its own QA records.
import {createClient} from '@supabase/supabase-js';
import {createHash,randomBytes} from 'node:crypto';
import assert from 'node:assert/strict';
const base=process.env.APP_URL;
if(!base||process.env.XKEY_RUN_LIVE_TEST!=='true')throw Error('Set APP_URL and XKEY_RUN_LIVE_TEST=true explicitly.');
const db=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const prefix=`QA-${Date.now()}`,raw=randomBytes(32).toString('hex'),hash=createHash('sha256').update(raw).digest('hex');
const cookie=`xkey_admin=${raw}`,accountIds=[],codeIds=[];
let failures=0;
const ok=(name)=>console.log(`PASS ${name}`);
async function get(cookie='',admin=false){const r=await fetch(`${base}/api/vault?admin=${admin?'1':'0'}`,{headers:{cookie}});assert.equal(r.status,200);return r.json();}
async function post(action,body={},auth=cookie){const r=await fetch(`${base}/api/vault`,{method:'POST',headers:{Origin:base,'Content-Type':'application/json',cookie:auth},body:JSON.stringify({action,...body})});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};}
try{
 const guest=await get();assert.equal(guest.identity,null);assert.equal(guest.demo,false);assert.equal(guest.publicUrl,base);assert.equal(guest.accounts,undefined);ok('Unauthenticated response contains no accounts');
 assert.equal((await post('save-account',{},'')).status,401);ok('Unauthenticated write rejected');
 const external=await fetch(base+'/api/vault',{method:'POST',headers:{Origin:'https://foreign.example','Content-Type':'application/json'},body:'{"action":"logout"}'});assert.equal(external.status,403);ok('Foreign origin rejected');
 const admin=await db.from('xkey_admin').select('must_change').eq('id',1).single().throwOnError();assert.equal(admin.data.must_change,false,'Finish initial admin setup first');
 await db.from('xkey_sessions').insert({token_hash:hash,role:'admin',expires_at:new Date(Date.now()+10*60000).toISOString()}).throwOnError();
 for(const visible of [true,false]){
 const a={category:prefix,name:`${prefix}-${visible?'public':'private'}`,url:'https://example.com',username:'qa@example.invalid',secret:`${prefix}-secret`,kind:visible?'password':'api_key',public:visible,memo:'한글, "메모"\n둘째 줄'};
 const r=await post('save-account',{account:a});assert.equal(r.status,200);
 const record=await db.from('xkey_accounts').select('id,secret').eq('name',a.name).single().throwOnError();accountIds.push(record.data.id);assert.notEqual(record.data.secret,a.secret);assert.equal(record.data.secret.split('.').length,3);
 }
 ok('Public/private account creation and encrypted DB storage');
 const adminList=await get(cookie,true);for(const id of accountIds)assert.ok(adminList.accounts.some(a=>a.id===id&&a.secret===`${prefix}-secret`));ok('Authorized admin decrypts saved values');
 const viewerSessions=[];
 for(const scope of ['public','all']){
 const r=await post('create-code',{label:`${prefix}-${scope}`,scope});assert.equal(r.status,200);assert.ok(r.body.code.startsWith('XKEY-'));
 const code=await db.from('xkey_codes').select('id,expires_at,uses,last_used_at').eq('label',`${prefix}-${scope}`).single().throwOnError();codeIds.push(code.data.id);assert.ok(Math.abs(Date.parse(code.data.expires_at)-Date.now()-7*86400000)<20000);
 const login=await post('unlock',{code:r.body.code},'');assert.equal(login.status,200);assert.ok(login.cookie);viewerSessions.push(login.cookie);
 const list=await get(login.cookie);assert.equal(list.identity.scope,scope);assert.ok(list.accounts.some(a=>a.id===accountIds[0]));assert.equal(list.accounts.some(a=>a.id===accountIds[1]),scope==='all');if(scope==='public')assert.ok(list.accounts.every(a=>a.public));
 assert.equal((await get(login.cookie,true)).identity,null);assert.equal((await post('create-code',{label:'forbidden'},login.cookie)).status,401);
 const usage=await db.from('xkey_codes').select('uses,last_used_at').eq('id',code.data.id).single().throwOnError();assert.equal(usage.data.uses,1);assert.ok(usage.data.last_used_at);
 }
 ok('Public/executive access boundaries, seven-day lifetime, authentication usage');
 const publicAccount=adminList.accounts.find(a=>a.id===accountIds[0]);const updated=await post('save-account',{account:{...publicAccount,memo:'Updated QA memo'}});assert.equal(updated.status,200);assert.equal((await get(cookie,true)).accounts.find(a=>a.id===accountIds[0]).memo,'Updated QA memo');ok('Account editing persists');
 await db.from('xkey_codes').update({expires_at:new Date(Date.now()-60000).toISOString()}).eq('id',codeIds[0]).throwOnError();assert.equal((await get(viewerSessions[0])).identity,null);ok('Expiration invalidates an existing viewer session');
 assert.equal((await post('delete-code',{id:codeIds[1]})).status,200);assert.equal((await get(viewerSessions[1])).identity,null);ok('Code deletion invalidates an existing viewer session');
 for(const id of accountIds)assert.equal((await post('delete-account',{id})).status,200);ok('Account deletion');
 const logout=await post('logout',{admin:true});assert.equal(logout.status,200);assert.equal((await get(cookie,true)).identity,null);ok('Logout invalidates admin test session');
}catch(e){failures++;console.error(`FAIL ${e.message}`);}
finally{
 for(const id of accountIds){const r=await db.from('xkey_accounts').delete().eq('id',id);if(r.error){failures++;console.error('QA account cleanup failed');}}
 for(const id of codeIds){const r=await db.from('xkey_codes').delete().eq('id',id);if(r.error){failures++;console.error('QA code cleanup failed');}}
 const r=await db.from('xkey_sessions').delete().eq('token_hash',hash);if(r.error){failures++;console.error('QA session cleanup failed');}
 console.log(failures?'FAILED (see above)':'PASS QA records and session cleaned up');
 process.exitCode=failures?1:0;
}
