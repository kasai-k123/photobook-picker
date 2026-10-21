import { compareProducts, type Filters } from './catalog';
import type { EventName } from './events';

export function track(event: EventName, target = '') {
  const path = document.body.dataset.page ?? '/404/';
  const body = JSON.stringify({ event, path, target });
  // keepalive keeps navigation clicks measurable without delaying the link.
  void fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
}
export function initPage() {
  track('page_view');
  const service = document.body.dataset.service;
  if (service) track('service_detail_view', service);
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[data-outbound]') : null;
    if (target) track('outbound_click', target.dataset.outbound);
  });
  document.addEventListener('auxclick', event => {
    const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[data-outbound]') : null;
    if (event.button === 1 && target) track('outbound_click', target.dataset.outbound);
  });
  const form = document.querySelector<HTMLFormElement>('#filters');
  const grid = document.querySelector<HTMLElement>('#products');
  if (!form || !grid) return;
  const cards = new Map(Array.from(grid.querySelectorAll<HTMLElement>('[data-product]')).map(el => [el.dataset.product, el]));
  function update() {
    const values = new FormData(form!);
    const budget = String(values.get('budget') ?? '').trim();
    const filters: Filters = {
      size: String(values.get('size')), pages: String(values.get('pages')), cover: String(values.get('cover')),
      smartphone: values.get('smartphone') === 'on', budget: budget === '' ? null : Number(budget), sort: String(values.get('sort'))
    };
    const selected = compareProducts(filters);
    cards.forEach(card => { card.hidden = true; });
    selected.forEach(product => { const card = cards.get(product.id)!; card.hidden = false; grid!.append(card); });
    document.querySelector('#result-count')!.textContent = `${selected.length}件`;
    document.querySelector<HTMLElement>('#empty')!.hidden = selected.length !== 0;
  }
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', update);
  form.addEventListener('change', event => {
    update();
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) track('comparison_interaction', event.target.name);
  });
  form.addEventListener('reset', () => { queueMicrotask(update); track('comparison_interaction', 'reset'); });
  update();
}
