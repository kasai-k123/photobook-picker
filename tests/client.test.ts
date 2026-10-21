// @vitest-environment jsdom
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { catalog } from '../src/lib/catalog';
import { initPage } from '../src/lib/client';
const sent = () => vi.mocked(fetch).mock.calls.map(call => JSON.parse(call[1]!.body as string));
describe('comparison UI and telemetry', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null,{status:204})));
    document.body.dataset.page = '/';
    document.body.innerHTML = `<form id="filters"><select name="size"><option value="any">all</option></select><select name="pages"><option value="any">all</option><option value="21-40">21-40</option></select><select name="cover"><option value="any">all</option><option value="hard">hard</option></select><input name="smartphone" type="checkbox"><input name="budget" type="number"><select name="sort"><option value="total">total</option><option value="body">body</option></select></form><span id="result-count"></span><p id="empty" hidden></p><section id="products">${catalog.products.map(p=>`<article data-product="${p.id}"></article>`).join('')}</section><a href="https://bon-book.jp/photobook/howtouse/" data-outbound="bon-s-24">公式</a>`;
  });
  afterEach(() => { vi.unstubAllGlobals(); delete document.body.dataset.service; });
  it('updates cards, count, empty state, sorting, reset and tracks actions without budget values', async () => {
    initPage();
    const input = document.querySelector<HTMLInputElement>('[name=budget]')!;
    input.value='1600'; input.dispatchEvent(new Event('input',{bubbles:true})); input.dispatchEvent(new Event('change',{bubbles:true}));
    expect(document.querySelectorAll('[data-product]:not([hidden])')).toHaveLength(1);
    expect(document.querySelector('[data-product]:not([hidden])')?.getAttribute('data-product')).toBe('kitamura-pocket-square-22');
    expect(sent()).toContainEqual({event:'comparison_interaction',path:'/',target:'budget'});
    expect(JSON.stringify(sent())).not.toContain('1600');
    input.value='0'; input.dispatchEvent(new Event('input',{bubbles:true})); expect(document.querySelector<HTMLElement>('#empty')!.hidden).toBe(false);
    document.querySelector('form')!.reset(); await Promise.resolve();
    expect(document.querySelector('#result-count')!.textContent).toBe('16件');
    const sort = document.querySelector<HTMLSelectElement>('[name=sort]')!; sort.value='body'; sort.dispatchEvent(new Event('change',{bubbles:true}));
    expect(document.querySelector('#products')!.firstElementChild!.getAttribute('data-product')).toBe('photorevo-soft-a5v-16');
    document.querySelector('a')!.addEventListener('click', event => event.preventDefault());
    document.querySelector('a')!.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
    expect(sent()).toContainEqual({event:'outbound_click',path:'/',target:'bon-s-24'});
    expect(vi.mocked(fetch).mock.calls.every(call=>call[1]?.keepalive)).toBe(true);
  });
  it('emits service view on detail pages', () => {
    document.body.dataset.page='/services/bon/'; document.body.dataset.service='bon'; initPage();
    expect(sent()).toContainEqual({event:'page_view',path:'/services/bon/',target:''});
    expect(sent()).toContainEqual({event:'service_detail_view',path:'/services/bon/',target:'bon'});
  });
});
