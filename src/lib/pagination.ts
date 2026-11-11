export function paginate<T>(items: T[], requestedPage: number, pageSize: number) {
 if (!Number.isInteger(pageSize) || pageSize < 1) throw new Error('Invalid page size');
 const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
 const page = Math.min(Math.max(1, Math.trunc(requestedPage) || 1), pageCount);
 const offset = (page - 1) * pageSize;
 const startPage = Math.max(1, Math.min(page - 2, pageCount - 4));
 return {
  page, pageCount,
  items: items.slice(offset, offset + pageSize),
  from: items.length ? offset + 1 : 0,
  to: Math.min(offset + pageSize, items.length),
  pages: Array.from({length: Math.min(5, pageCount)}, (_, i) => startPage + i),
 };
}
