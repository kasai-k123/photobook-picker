import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';
import { catalog, publicPaths, yen } from '../src/lib/catalog';

describe('generated HTML', () => {
  it.each(['', 'https://example.test'])('builds correct metadata and exact cards with SITE_URL=%s', origin => {
    const output = `.test-build/${origin ? 'configured' : 'unconfigured'}`;
    const build = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs','build','--outDir',output], {
      encoding:'utf8', env:{...process.env, SITE_URL:origin, ASTRO_TELEMETRY_DISABLED:'1'}, timeout:60000
    });
    expect(build.status, build.stdout + build.stderr).toBe(0);
    const read = (path: string) => readFileSync(join(output,path),'utf8');
    for (const path of [...publicPaths, '/404.html']) {
      const html = read(path === '/404.html' ? '404.html' : `${path.slice(1)}index.html`);
      const doc = new JSDOM(html).window.document;
      const indexed = !!origin && path !== '/404.html';
      expect(doc.querySelector('meta[name=robots]')?.getAttribute('content')).toBe(indexed ? 'index, follow' : 'noindex, nofollow');
      expect(doc.querySelector('link[rel=canonical]')?.getAttribute('href') ?? null).toBe(indexed ? `${origin}${path}` : null);
      expect(doc.querySelector('meta[property="og:url"]')?.getAttribute('content') ?? null).toBe(indexed ? `${origin}${path}` : null);
      expect(doc.body.textContent).not.toMatch(/MVP|unknown|スキーマ/);
      expect(doc.body.textContent).toContain(catalog.asOf);
      expect(doc.querySelector('h1')).not.toBeNull();
    }
    expect(read('robots.txt')).toContain(origin ? `Sitemap: ${origin}/sitemap.xml` : 'Disallow: /');
    expect((read('sitemap.xml').match(/<url>/g) ?? []).length).toBe(origin ? 9 : 0);
    const doc = new JSDOM(read('index.html')).window.document;
    expect(doc.querySelectorAll('[data-product]')).toHaveLength(16);
    for (const p of catalog.products) {
      const card = doc.querySelector(`[data-product="${p.id}"]`)!;
      expect(card.textContent).toContain(`${p.widthMm} × ${p.heightMm} mm`);
      expect(card.textContent).toContain(`${p.pageCount}ページ`);
      expect(card.textContent).toContain(yen(p.exampleTotalJpyTaxIncluded));
      expect(card.textContent).toContain(yen(p.bookPriceJpyTaxIncluded));
      expect(card.textContent).toContain(yen(p.shippingJpyTaxIncluded));
      expect(card.textContent).toContain(p.shippingMethod);
      expect(card.querySelector('a[data-outbound]')?.getAttribute('href')).toBe(p.officialProductUrl);
    }
    for (const p of catalog.providers) {
      const detail = new JSDOM(read(`services/${p.id}/index.html`)).window.document;
      expect(detail.body.dataset.service).toBe(p.id);
      expect(detail.querySelectorAll('[data-product]')).toHaveLength(catalog.products.filter(product=>product.providerId === p.id).length);
    }
  }, 60000);
});
