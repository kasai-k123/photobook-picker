import { robots } from '../lib/seo';
export function GET() { return new Response(robots(import.meta.env.SITE_URL), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }); }
