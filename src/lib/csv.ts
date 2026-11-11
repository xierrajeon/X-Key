import type { Account } from './types';
export function csv(accounts:Account[]) {
 const cell=(value:unknown)=>{let text=String(value??'');if(/^[\s]*[=+@-]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';};
 const rows=[['분류','이름','접속 URL','아이디','비밀번호/API 키','값 종류','공개 여부','메모','수정일'],...accounts.map(a=>[a.category,a.name,a.url,a.username,a.secret,a.kind==='api_key'?'API 키':'비밀번호',a.public?'공개':'비공개',a.memo,a.updated_at])];
 return '\uFEFF'+rows.map(r=>r.map(cell).join(',')).join('\r\n');
}
export function exportCSV(accounts:Account[]) {
 const blob=new Blob([csv(accounts)],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download=`vaultkey-accounts-${new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date()).replaceAll('-','')}.csv`;link.click();URL.revokeObjectURL(url);
}
