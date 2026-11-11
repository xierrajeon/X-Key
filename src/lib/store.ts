import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { demo } from './demo';
import { decrypt, hash, token } from './crypto';
import type { Account, Identity } from './types';
export const isDemo = () => process.env.NODE_ENV !== 'production' && ((!process.env.SUPABASE_URL && !process.env.SUPABASE_SERVICE_ROLE_KEY) || process.env.X_KEY_DEMO === 'true');
export function db() {
 if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Supabase 환경변수 설정이 필요합니다.');
 return createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
}
export async function session(admin=false): Promise<Identity | null> {
 const value=(await cookies()).get(admin?'xkey_admin':'xkey_viewer')?.value;
 if (!value) return null;
 const s=isDemo()?demo.sessions.get(hash(value)):(await db().from('xkey_sessions').select('*').eq('token_hash',hash(value)).maybeSingle().throwOnError()).data;
 if (!s || new Date(s.expires_at).getTime()<=Date.now() || s.role !== (admin?'admin':'viewer')) return null;
 if (s.role==='admin') {
  const a=isDemo()?demo.admin:(await db().from('xkey_admin').select('username,must_change').eq('id',1).single().throwOnError()).data;
  return {role:'admin',scope:'all',label:a.username,must_change:a.must_change};
 }
 const code=isDemo()?demo.codes.find(c=>c.id===s.code_id):(await db().from('xkey_codes').select('*').eq('id',s.code_id).maybeSingle().throwOnError()).data;
 if (!code || new Date(code.expires_at).getTime()<=Date.now()) return null;
 return {role:'viewer',scope:code.scope,label:code.label};
}
export async function startSession(role:'admin'|'viewer',code_id?:string,expires?:string) {
 const raw=token(), token_hash=hash(raw), expires_at=expires || new Date(Date.now()+8*3600000).toISOString();
 if (isDemo()) demo.sessions.set(token_hash,{role,code_id,expires_at});
 else await db().from('xkey_sessions').insert({token_hash,role,code_id,expires_at}).throwOnError();
 (await cookies()).set(role==='admin'?'xkey_admin':'xkey_viewer',raw,{httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production',path:'/'});
}
export async function accounts(identity:Identity): Promise<Account[]> {
 if(isDemo()) return demo.accounts.filter(a=>identity.scope==='all'||a.public);
 let query=db().from('xkey_accounts').select('*').order('updated_at',{ascending:false});
 if(identity.scope!=='all') query=query.eq('public',true);
 const {data}=await query.throwOnError();
 return (data || []).map(a=>({...a,secret:decrypt(a.secret)}));
}
export async function throttle(bucket:string) {
 if(isDemo()) {let a=demo.attempts.get(bucket);if(!a||Date.now()-a.start>900000){a={count:0,start:Date.now()};demo.attempts.set(bucket,a);}return ++a.count<=10;}
 return (await db().rpc('xkey_throttle',{b:bucket}).throwOnError()).data===true;
}
export async function logout(admin:boolean) {
 const jar=await cookies(), name=admin?'xkey_admin':'xkey_viewer', raw=jar.get(name)?.value;
 if(raw) {if(isDemo()) demo.sessions.delete(hash(raw));else await db().from('xkey_sessions').delete().eq('token_hash',hash(raw)).throwOnError();}
 jar.delete(name);
}
