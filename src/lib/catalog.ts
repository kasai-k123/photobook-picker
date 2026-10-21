import data from '../data/photobook-official-mvp-2026-10-21.json';

export const catalog = data;
export type Product = (typeof data.products)[number];
export const covers: Record<string, string> = { hard: 'ハード', soft: 'ソフト', flat_pasted: '合紙フラット', unknown: '不明' };
export const smartphoneLabels: Record<string, string> = { yes: '対応', no: '非対応', unknown: '要確認' };
export const yen = (value: number) => `${value.toLocaleString('ja-JP')}円`;
export function sizeClass(product: Pick<Product, 'widthMm' | 'heightMm'>) {
  const side = Math.max(product.widthMm, product.heightMm);
  return side <= 160 ? 'compact' : side <= 230 ? 'medium' : 'large';
}
export interface Filters {
  size: string;
  pages: string;
  cover: string;
  smartphone: boolean;
  budget: number | null;
  sort: string;
}
export const defaults: Filters = { size: 'any', pages: 'any', cover: 'any', smartphone: false, budget: null, sort: 'total' };
export function compareProducts(filters: Partial<Filters> = {}, products: Product[] = data.products) {
  const f = { ...defaults, ...filters };
  return products.filter(p =>
    (f.size === 'any' || sizeClass(p) === f.size) &&
    (f.pages === 'any' || (f.pages === '1-20' ? p.pageCount >= 1 && p.pageCount <= 20 : p.pageCount >= 21 && p.pageCount <= 40)) &&
    (f.cover === 'any' || p.coverCategory === f.cover) &&
    (!f.smartphone || p.smartphoneEditing === 'yes') &&
    (f.budget === null || p.exampleTotalJpyTaxIncluded <= f.budget)
  ).sort((a, b) => f.sort === 'body'
    ? a.bookPriceJpyTaxIncluded - b.bookPriceJpyTaxIncluded
    : a.exampleTotalJpyTaxIncluded - b.exampleTotalJpyTaxIncluded);
}
export const publicPaths = ['/', ...data.providers.map(p => `/services/${p.id}/`), '/methodology/', '/privacy/'];
