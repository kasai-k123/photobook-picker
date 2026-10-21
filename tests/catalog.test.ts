import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { catalog, compareProducts, sizeClass, smartphoneLabels } from '../src/lib/catalog';
const ids = (f: Parameters<typeof compareProducts>[0]) => compareProducts(f).map(p => p.id);
describe('official catalog', () => {
  it('contains six providers and 16 exact variants', () => {
    expect(catalog.providers).toHaveLength(6); expect(catalog.products).toHaveLength(16);
    for (const p of catalog.products) {
      expect(p.bookPriceJpyTaxIncluded + p.shippingJpyTaxIncluded).toBe(p.exampleTotalJpyTaxIncluded);
      expect(p.comparisonQuantity).toBe(1);
      expect(catalog.providers.some(s => s.id === p.providerId)).toBe(true);
      expect(p.sourceIds.every(id => catalog.sources.some(s => s.id === id))).toBe(true);
    }
  });
  it('preserves the original file byte for byte', () => {
    const bytes = readFileSync('src/data/photobook-official-mvp-2026-10-21.json');
    const expected = readFileSync('docs/data.sha256', 'utf8').trim();
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(expected);
  });
  it('returns Kitamura pocket only at 1600 yen', () => { expect(ids({ budget: 1600 })).toEqual(['kitamura-pocket-square-22']); });
  it('returns BON S for the combined conditions', () => { expect(ids({ pages: '21-40', cover: 'hard', smartphone: true, budget: 3500 })).toEqual(['bon-s-24']); });
  it('returns both short softcover products', () => { expect(ids({ pages: '1-20', cover: 'soft' })).toEqual(['photorevo-soft-a5v-16', 'mybook-art-sc-180-20']); });
  it('does not interpret unconfirmed smartphone editing as supported', () => {
    expect(ids({ smartphone: true })).not.toContain('mybook-art-hc-180-20');
    expect(ids({ smartphone: true })).not.toContain('mybook-art-sc-180-20');
    expect(smartphoneLabels.unknown).toBe('要確認');
    expect(ids({ cover: 'unknown' })).toEqual(['kitamura-pocket-square-22']);
    expect(compareProducts({ cover: 'hard' }).every(p => p.coverCategory === 'hard')).toBe(true);
  });
  it('uses inclusive exact page bands, budget and both sort orders', () => {
    expect(ids({ budget: 1470 })).toEqual(['kitamura-pocket-square-22']); expect(ids({ budget: 1469 })).toEqual([]);
    expect(compareProducts({ pages: '1-20' }).every(p => p.pageCount <= 20)).toBe(true);
    expect(compareProducts({ pages: '21-40' }).every(p => p.pageCount >= 21 && p.pageCount <= 40)).toBe(true);
    for (const sort of ['total', 'body']) {
      const field = sort === 'total' ? 'exampleTotalJpyTaxIncluded' : 'bookPriceJpyTaxIncluded';
      const amounts = compareProducts({ sort }).map(p => p[field]); expect(amounts).toEqual([...amounts].sort((a,b) => a-b));
    }
    expect(ids({ size: 'large' })).toEqual(['fujiphoto-a4-24']);
  });
  it.each([[160,'compact'],[161,'medium'],[230,'medium'],[231,'large']])('classifies the longest side %i', (side, category) => {
    expect(sizeClass({ widthMm: Number(side), heightMm: 90 })).toBe(category);
    expect(sizeClass({ widthMm: 90, heightMm: Number(side) })).toBe(category);
  });
});
