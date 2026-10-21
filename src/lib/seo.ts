import { publicPaths } from './catalog';

export function siteOrigin(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  try {
    const url = new URL(raw.trim());
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) return null;
    return url.origin;
  } catch { return null; }
}
export function seo(raw: string | undefined, path: string, noindex = false) {
  const origin = siteOrigin(raw);
  return { canonical: origin && !noindex ? new URL(path, origin).href : null, robots: origin && !noindex ? 'index, follow' : 'noindex, nofollow' };
}
export function robots(raw: string | undefined) {
  const origin = siteOrigin(raw);
  return origin ? `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n';
}
export function sitemap(raw: string | undefined) {
  const origin = siteOrigin(raw);
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${origin ? publicPaths.map(path => `<url><loc>${new URL(path, origin).href.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;')}</loc></url>`).join('') : ''}</urlset>`;
}
