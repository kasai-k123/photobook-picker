import { describe, it, expect, vi } from 'vitest';
import worker, { handleEvents, type Env } from '../worker/index';
const origin = 'https://example.test';
const request = (data: unknown, headers = {}) => new Request(`${origin}/api/events`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(data) });
function env() { return { ASSETS: { fetch: vi.fn(async () => new Response('missing', { status: 404 })) }, EVENTS: { writeDataPoint: vi.fn() } }; }
describe('event ingestion', () => {
  it.each([
    ['page_view','/',''], ['comparison_interaction','/','budget'], ['service_detail_view','/services/bon/','bon'], ['outbound_click','/','bon-s-24'], ['outbound_click','/methodology/','B1']
  ])('writes %s with fixed fields only', async (event, path, target) => {
    const bindings = env();
    expect((await handleEvents(request({event,path,target,email:'not-stored@example.test',budget:1600}), bindings)).status).toBe(204);
    expect(bindings.EVENTS.writeDataPoint).toHaveBeenCalledWith({indexes:[event],blobs:[event,path,target],doubles:[1]});
  });
  it.each([
    {event:'other',path:'/',target:''}, {event:'page_view',path:'/?email=test',target:''},
    {event:'outbound_click',path:'/',target:'https://external.test'}, {event:'comparison_interaction',path:'/',target:'1600'},
    {event:'service_detail_view',path:'/',target:'bon'}, {event:'page_view',path:'/',target:'someone'}
  ])('rejects unknown identifiers', async data => {
    const bindings = env(); expect((await handleEvents(request(data), bindings)).status).toBe(400); expect(bindings.EVENTS.writeDataPoint).not.toHaveBeenCalled();
  });
  it('rejects cross-origin requests, invalid content types, oversized bodies and malformed JSON', async () => {
    const bindings = env();
    expect((await handleEvents(request({}, { Origin:'https://other.test' }), bindings)).status).toBe(403);
    expect((await handleEvents(request({}, { 'Content-Type':'text/plain' }), bindings)).status).toBe(415);
    expect((await handleEvents(request({payload:'x'.repeat(1025)}), bindings)).status).toBe(413);
    expect((await handleEvents(new Request(`${origin}/api/events`), bindings)).status).toBe(405);
    expect((await handleEvents(new Request(`${origin}/api/events`, {method:'POST', headers:{Origin:origin,'Content-Type':'application/json'}, body:'{' }), bindings)).status).toBe(400);
    expect(bindings.EVENTS.writeDataPoint).not.toHaveBeenCalled();
  });
  it('works without a local dataset and handles ingestion failures', async () => {
    const bindings: Env = env(); delete bindings.EVENTS;
    expect((await handleEvents(request({event:'page_view',path:'/',target:''}), bindings)).status).toBe(204);
    bindings.EVENTS = {writeDataPoint(){throw new Error('offline');}};
    expect((await handleEvents(request({event:'page_view',path:'/',target:''}), bindings)).status).toBe(503);
  });
  it('serves real missing pages as 404 with noindex, including HEAD', async () => {
    const bindings = env();
    bindings.ASSETS.fetch.mockResolvedValueOnce(new Response('missing',{status:404})).mockResolvedValueOnce(new Response('<h1>見つかりません</h1>'));
    const response = await worker.fetch(new Request(`${origin}/nonexistent`), bindings);
    expect(response.status).toBe(404); expect(response.headers.get('X-Robots-Tag')).toContain('noindex'); expect(await response.text()).toContain('見つかりません');
    const head = await worker.fetch(new Request(`${origin}/404.html`,{method:'HEAD'}), env());
    expect(head.status).toBe(404); expect(await head.text()).toBe('');
  });
  it('routes analytics through the worker and preserves asset responses', async () => {
    const bindings = env();
    expect((await worker.fetch(request({event:'page_view',path:'/',target:''}),bindings)).status).toBe(204);
    bindings.ASSETS.fetch.mockResolvedValueOnce(new Response('page',{status:200}));
    expect(await (await worker.fetch(new Request(origin),bindings)).text()).toBe('page');
  });
});
