import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';
export const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export const token = () => randomBytes(32).toString('hex');
export const newCode = () => `XKEY-${randomBytes(12).toString('hex').toUpperCase().match(/.{1,4}/g)!.join('-')}`;
function key() {
 const value = process.env.VAULT_ENCRYPTION_KEY || '';
 if (!/^[a-f0-9]{64}$/i.test(value)) throw new Error('VAULT_ENCRYPTION_KEY must be a 32-byte hex key');
 return Buffer.from(value, 'hex');
}
export function encrypt(value: string) {
 const iv=randomBytes(12), cipher=createCipheriv('aes-256-gcm',key(),iv);
 const encrypted=Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);
 return [iv,cipher.getAuthTag(),encrypted].map(x=>x.toString('base64')).join('.');
}
export function decrypt(value: string) {
 const [iv,tag,data]=value.split('.').map(x=>Buffer.from(x,'base64'));
 const cipher=createDecipheriv('aes-256-gcm',key(),iv); cipher.setAuthTag(tag);
 return Buffer.concat([cipher.update(data),cipher.final()]).toString('utf8');
}
