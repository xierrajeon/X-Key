/** The application is hosted at a domain root; subpath installations are not supported. */
export function normalizeAppUrl(value: string): string {
 const url = new URL(value);
 if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
  throw new Error('APP_URL에는 경로 없이 http(s)://호스트 주소만 입력해 주세요.');
 }
 return url.origin;
}
export function appUrl(fallback: string): string {
 const configured = process.env.APP_URL?.trim();
 if (configured) return normalizeAppUrl(configured);
 if (process.env.NODE_ENV === 'production') throw new Error('APP_URL 설정이 필요합니다.');
 return normalizeAppUrl(fallback);
}
