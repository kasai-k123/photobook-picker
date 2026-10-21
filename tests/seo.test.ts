import { describe, it, expect } from 'vitest';
import { seo, robots, sitemap, siteOrigin } from '../src/lib/seo';
import { publicPaths } from '../src/lib/catalog';
describe('SEO', () => {
  it.each([undefined, '', ' ', 'invalid', 'javascript:alert(1)', 'https://example.test/subpath', 'https://user:pass@example.test'])('fails closed for %s', raw => {
    expect(siteOrigin(raw)).toBeNull(); expect(robots(raw)).toBe('User-agent: *\nDisallow: /\n');
    expect(sitemap(raw)).not.toContain('<url>');
    for (const path of publicPaths) expect(seo(raw, path)).toEqual({canonical: null, robots: 'noindex, nofollow'});
  });
  it('uses the configured origin for every canonical, robots and sitemap', () => {
    for (const path of publicPaths) expect(seo('https://example.test/', path).canonical).toBe(`https://example.test${path}`);
    expect(robots('https://example.test')).toContain('Sitemap: https://example.test/sitemap.xml');
    expect(sitemap('https://example.test').match(/<url>/g)).toHaveLength(9);
    expect(sitemap('https://example.test')).not.toContain('/404');
    expect(seo('https://example.test', '/404/', true)).toEqual({canonical: null, robots: 'noindex, nofollow'});
  });
});
