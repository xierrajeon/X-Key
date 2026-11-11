import { normalizeAppUrl } from './app-url';
/** Compare against the actual HTTP Host, since Next.js may normalize nextUrl to localhost in dev. */
export function isSameOrigin(headers: Headers, protocol: string, configuredUrl?: string): boolean {
 const raw = headers.get('origin');
 const host = headers.get('host');
 if (!raw || !host) return false;
 try {
  const origin = new URL(raw);
  if (configuredUrl?.trim() && origin.origin === normalizeAppUrl(configuredUrl.trim())) return true;
  if (configuredUrl?.trim() && process.env.NODE_ENV === 'production') return false;
  return origin.origin === `${protocol}//${host}` && origin.username === '' && origin.password === '';
 } catch {
  return false;
 }
}
