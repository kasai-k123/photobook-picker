import { catalog, publicPaths } from './catalog';

export const eventNames = ['page_view', 'comparison_interaction', 'service_detail_view', 'outbound_click'] as const;
export type EventName = typeof eventNames[number];
export interface EventData { event: EventName; path: string; target: string }
const interactions = ['size', 'pages', 'cover', 'smartphone', 'budget', 'sort', 'reset'];
export function validateEvent(value: unknown): EventData | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if (!eventNames.includes(v.event as EventName) || typeof v.path !== 'string' || ![...publicPaths, '/404/'].includes(v.path) || typeof v.target !== 'string') return null;
  const event = v.event as EventName;
  const valid = event === 'page_view' ? v.target === ''
    : event === 'comparison_interaction' ? v.path === '/' && interactions.includes(v.target)
    : event === 'service_detail_view' ? catalog.providers.some(p => p.id === v.target && v.path === `/services/${p.id}/`)
    : catalog.products.some(p => p.id === v.target) || catalog.providers.some(p => p.id === v.target) || catalog.sources.some(s => s.id === v.target);
  // Only these fixed catalog identifiers are retained. Never forward arbitrary fields.
  return valid ? { event, path: v.path, target: v.target } : null;
}
