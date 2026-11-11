import { NextRequest, NextResponse } from 'next/server';
import { accounts, db, isDemo, logout, session, startSession, throttle } from '@/lib/store';
import { demo } from '@/lib/demo';
import { encrypt, hash, newCode } from '@/lib/crypto';
import type { Account } from '@/lib/types';
import { isSameOrigin } from '@/lib/origin';
import { appUrl } from '@/lib/app-url';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const json=(value:unknown,status=200)=>NextResponse.json(value,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(req:NextRequest) {
 try {
 const publicUrl=appUrl(req.nextUrl.origin);
 const admin=req.nextUrl.searchParams.get('admin')==='1', identity=await session(admin);
 if(!identity) return json({identity:null,demo:isDemo(),publicUrl});
 if(identity.must_change) return json({identity,demo:isDemo(),publicUrl,accounts:[],codes:[]});
 const list=await accounts(identity);
 const codes=admin?(isDemo()?demo.codes:(await db().from('xkey_codes').select('id,label,scope,expires_at,last_used_at,uses,created_at').order('created_at',{ascending:false}).throwOnError()).data):[];
 return json({identity,publicUrl,accounts:list,codes:codes.map(({...c})=>({id:c.id,label:c.label,scope:c.scope,expires_at:c.expires_at,last_used_at:c.last_used_at,uses:c.uses,created_at:c.created_at})),demo:isDemo()});
 } catch {return json({error:'데이터를 불러오지 못했습니다. 서버의 APP_URL·Supabase 설정과 마이그레이션을 확인하세요.'},503);}
}
export async function POST(req:NextRequest) {
 if(!isSameOrigin(req.headers, req.nextUrl.protocol, process.env.APP_URL)) return json({error:'허용되지 않은 요청입니다.'},403);
 try {
 const body=await req.json(), {action}=body;
 if(action==='login'||action==='unlock') {
 // One global bucket per entry point avoids trusting spoofable forwarding headers.
 if(!await throttle(action)) return json({error:'시도가 너무 많습니다. 15분 후 다시 시도해 주세요.'},429);
 if(action==='login') {
 const u=String(body.username||''),p=String(body.password||'');
 const valid=isDemo()?u===demo.admin.username&&p===demo.admin.password:(await db().rpc('xkey_verify_admin',{u,p}).throwOnError()).data;
 if(!valid) return json({error:'아이디 또는 비밀번호를 확인해 주세요.'},401);
 await startSession('admin');return json({ok:true});
 }
 const codeHash=hash(String(body.code||'').trim().toUpperCase());
 const code=isDemo()?demo.codes.find(c=>c.code_hash===codeHash):(await db().from('xkey_codes').select('*').eq('code_hash',codeHash).maybeSingle().throwOnError()).data;
 if(!code || Date.parse(code.expires_at)<=Date.now())return json({error:'유효하지 않거나 만료된 접근 코드입니다.'},401);
 if(isDemo()){code.uses++;code.last_used_at=new Date().toISOString();}else await db().rpc('xkey_record_use',{code:code.id}).throwOnError();
 await startSession('viewer',code.id,code.expires_at);return json({ok:true});
 }
 if(action==='logout'){await logout(body.admin===true);return json({ok:true});}
 const identity=await session(true);
 if(!identity) return json({error:'관리자 로그인이 필요합니다.'},401);
 if(action==='change-admin') {
 const u=String(body.username||'').trim(),p=String(body.newPassword??body.password??''),current=String(body.currentPassword??body.current??'');
 if(!u||u.length>80||p.length<8||p.length>72) return json({error:'아이디와 8~72자의 새 비밀번호를 입력해 주세요.'},400);
 if(!await throttle('change-admin'))return json({error:'잠시 후 다시 시도해 주세요.'},429);
 const valid=isDemo()?current===demo.admin.password:(await db().rpc('xkey_verify_admin',{u:identity.label,p:current}).throwOnError()).data;
 if(!valid)return json({error:'현재 비밀번호가 일치하지 않습니다.'},400);
 if(isDemo()){demo.admin={username:u,password:p,must_change:false};for(const [key,s]of demo.sessions)if(s.role==='admin')demo.sessions.delete(key);}
 else {await db().rpc('xkey_change_admin',{u,p}).throwOnError();await db().from('xkey_sessions').delete().eq('role','admin').throwOnError();}
 await startSession('admin');return json({ok:true});
 }
 if(identity.must_change)return json({error:'먼저 관리자 비밀번호를 변경해 주세요.'},403);
 if(action==='save-account') {
 const input=body.account||{};
 const a={category:String(input.category||'').trim(),name:String(input.name||'').trim(),url:String(input.url||'').trim(),username:String(input.username||''),secret:String(input.secret||''),kind:input.kind==='api_key'?'api_key':'password',public:input.public===true,memo:String(input.memo||''),updated_at:new Date().toISOString()};
 if(!a.name||!a.category||!a.secret||Object.values(a).some(v=>typeof v==='string'&&v.length>20000))return json({error:'분류, 이름, 비밀번호/API 키를 확인해 주세요.'},400);
 if(a.url&&!/^https?:\/\//i.test(a.url))return json({error:'URL은 https:// 또는 http://로 시작해야 합니다.'},400);
 if(isDemo()){if(input.id&&!demo.accounts.some(x=>x.id===input.id))return json({error:'계정을 찾을 수 없습니다.'},404);const row={...a,id:input.id||crypto.randomUUID()} as Account;demo.accounts=demo.accounts.filter(x=>x.id!==row.id).concat(row);}
 else {const row={...a,secret:encrypt(a.secret)};if(input.id)await db().from('xkey_accounts').update(row).eq('id',input.id).throwOnError();else await db().from('xkey_accounts').insert(row).throwOnError();}
 return json({ok:true});
 }
 if(action==='delete-account') {if(isDemo())demo.accounts=demo.accounts.filter(a=>a.id!==body.id);else await db().from('xkey_accounts').delete().eq('id',body.id).throwOnError();return json({ok:true});}
 if(action==='create-code') {
 const label=String(body.label||'').trim();if(!label||label.length>120)return json({error:'사용 목적을 입력해 주세요.'},400);
 const code=newCode(), row={id:crypto.randomUUID(),label,scope:body.scope==='all'?'all' as const:'public' as const,code_hash:hash(code),expires_at:new Date(Date.now()+7*86400000).toISOString(),created_at:new Date().toISOString(),last_used_at:null,uses:0};
 if(isDemo())demo.codes.unshift(row);else await db().from('xkey_codes').insert(row).throwOnError();
 return json({ok:true,code});
 }
 if(action==='delete-code') {if(isDemo())demo.codes=demo.codes.filter(c=>c.id!==body.id);else await db().from('xkey_codes').delete().eq('id',body.id).throwOnError();return json({ok:true});}
 return json({error:'알 수 없는 요청입니다.'},400);
 }catch{return json({error:'요청을 처리하지 못했습니다. 서버 설정을 확인해 주세요.'},500);}
}
