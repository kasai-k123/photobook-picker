import { sitemap } from '../lib/seo';
export function GET() { return new Response(sitemap(import.meta.env.SITE_URL), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }); }
