import type { Account, AccessCode } from './types';
import { hash } from './crypto';
const now = new Date().toISOString();
export const demo = {
 admin: { username:'admin', password:'admin', must_change:true },
 accounts: [
 ['클라우드 인프라','AWS 운영 계정','https://console.aws.amazon.com','ops@example.com','demo-password',true],
 ['클라우드 인프라','Vercel 팀 워크스페이스','https://vercel.com','dev@example.com','demo-vercel',true],
 ['클라우드 인프라','Supabase 프로젝트 API 키','https://supabase.com/dashboard','production','demo-api-key',false],
 ['SaaS 구독','Notion 팀 워크스페이스','https://notion.so','team@example.com','demo-notion',true],
 ['SaaS 구독','Slack 워크스페이스','https://slack.com','admin@example.com','demo-slack',true],
 ['디자인 · 콘텐츠','Figma 팀 플랜','https://figma.com','design@example.com','demo-figma',true],
 ['사내 시스템','사내 그룹웨어','https://example.com','office-admin','demo-office',true],
 ['결제 · 정산','결제 관리자','https://example.com','billing@example.com','demo-billing',false],
 ].map((a,i)=>({id:String(i+1),category:a[0],name:a[1],url:a[2],username:a[3],secret:a[4],public:a[5],kind:i===2?'api_key':'password',memo:'화면 확인용 가상 계정입니다.',updated_at:now})) as Account[],
 codes: [
 {id:'public',label:'전체 구성원 공용 코드',scope:'public',code_hash:hash('XKEY-TEAM-DEMO'),expires_at:new Date(Date.now()+7*86400000).toISOString(),last_used_at:null,uses:0,created_at:now},
 {id:'all',label:'경영진 · 비공개 포함',scope:'all',code_hash:hash('XKEY-EXEC-DEMO'),expires_at:new Date(Date.now()+7*86400000).toISOString(),last_used_at:null,uses:0,created_at:now},
 ] as (AccessCode & {code_hash:string})[],
 sessions: new Map<string,{role:'admin'|'viewer';code_id?:string;expires_at:string}>(),
 attempts: new Map<string,{count:number;start:number}>(),
};
