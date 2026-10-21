import { validateEvent } from '../src/lib/events';

export interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  EVENTS?: { writeDataPoint(point: { indexes: string[]; blobs: string[]; doubles: number[] }): void };
}
export async function handleEvents(request: Request, env: Env): Promise<Response> {
  const headers = { 'Cache-Control': 'no-store' };
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { ...headers, Allow: 'POST' } });
  if (request.headers.get('Origin') !== new URL(request.url).origin) return new Response(null, { status: 403, headers });
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return new Response(null, { status: 415, headers });
  // Limit the actual stream too: Content-Length is not trusted.
  const reader = request.body?.getReader();
  if (!reader) return new Response(null, { status: 400, headers });
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 1024) { await reader.cancel(); return new Response(null, { status: 413, headers }); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  let payload: unknown;
  try { payload = JSON.parse(new TextDecoder().decode(bytes)); } catch { return new Response(null, { status: 400, headers }); }
  const event = validateEvent(payload);
  if (!event) return new Response(null, { status: 400, headers });
  if (!env.EVENTS) return new Response(null, { status: 503, headers });
  try {
    env.EVENTS.writeDataPoint({ indexes: [event.event], blobs: [event.event, event.path, event.target], doubles: [1] });
  } catch { return new Response(null, { status: 503, headers }); }
  return new Response(null, { status: 204, headers });
}
export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/events') return handleEvents(request, env);
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 && !['/404', '/404/', '/404.html'].includes(url.pathname)) return response;
    const page = await env.ASSETS.fetch(new Request(new URL('/404.html', url), { method: 'GET' }));
    return new Response(request.method === 'HEAD' ? null : page.body, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow' } });
  }
};
