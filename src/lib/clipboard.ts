/** Clipboard API needs HTTPS; retain a synchronous copy path for HTTP LAN development. */
export async function copyText(value: string): Promise<void> {
 if (window.isSecureContext && navigator.clipboard?.writeText) {
  try { await navigator.clipboard.writeText(value); return; } catch { /* Try selection-based copy. */ }
 }
 const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
 const selection = window.getSelection();
 const ranges = selection ? Array.from({length:selection.rangeCount},(_,i)=>selection.getRangeAt(i).cloneRange()) : [];
 const field = document.createElement('textarea');
 field.value=value;
 field.readOnly=true;
 field.setAttribute('aria-label','복사할 값');
 Object.assign(field.style,{position:'fixed',left:'0',top:'0',width:'1px',height:'1px',opacity:'0',fontSize:'16px'});
 document.body.appendChild(field);
 try {
  field.focus({preventScroll:true});field.select();field.setSelectionRange(0,value.length);
  if (!document.execCommand('copy')) throw new Error('Clipboard copy unavailable');
 } finally {
  field.remove();
  active?.focus({preventScroll:true});
  if(selection){selection.removeAllRanges();for(const range of ranges)selection.addRange(range);}
 }
}
