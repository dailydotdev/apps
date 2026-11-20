import type { Ad } from '../../graphql/posts';
import { AdActions } from '../../lib/ads';
import type { AdMacroContext } from './adMacros';
import { substituteMacros } from './adMacros';

export enum AdLifecycleEvent {
  PostFetch = 'post-fetch',
  PreRender = 'pre-render',
  PostRender = 'post-render',
  Impression = 'impression',
  Visible = 'visible',
  HalfVisible = 'half-visible',
  VisibleFor1s = 'visible-for-1s',
  Viewable = 'viewable',
  Click = 'click',
}

export type AdSlotVisibilityMilestone =
  /** At least part of the creative is in the focused viewport. */
  | 'visible'
  | 'half-visible'
  /** Any part of the creative stays visible for one continuous second. */
  | 'visible-for-1s';

export type AdSlotMilestone = `${AdLifecycleEvent}`;

export type AdSlotAction =
  | { type: 'event'; name: string }
  | { type: 'pixel'; url: string };

export interface AdSlotLifecycle {
  version: 1;
  on: Partial<Record<AdSlotMilestone, AdSlotAction[]>>;
}

export type AdSlotFetchTransition =
  | { type: 'pre-fetch' | 'no-fill' | 'fetch-error' }
  | { type: 'post-fetch'; ad: Ad };

export const getAdSlotLifecycle = (ad: Ad): AdSlotLifecycle | undefined =>
  ad.lifecycle?.version === 1 && ad.lifecycle.on ? ad.lifecycle : undefined;

export const withoutAdSlotLifecycle = <T extends { lifecycle?: unknown }>(
  ad: T,
): T => (ad.lifecycle ? { ...ad, lifecycle: undefined } : ad);

export const getAdSlotImpressionPixels = (actions: AdSlotAction[]): string[] =>
  actions.flatMap((action) =>
    action?.type === 'pixel' && typeof action.url === 'string'
      ? [action.url]
      : [],
  );

const maxTrackedGenerations = 1_000;
const delivered = new Map<string, Set<AdSlotMilestone>>();
const supportedEvents = new Set<string>(Object.values(AdActions));

export const runAdSlotActions = ({
  ad,
  milestone,
  macros,
  onEvent,
}: {
  ad: Ad;
  milestone: AdSlotMilestone;
  macros: AdMacroContext;
  onEvent: (name: string) => void;
}): void => {
  const lifecycle = getAdSlotLifecycle(ad);
  const actions = lifecycle?.on[milestone];
  if (!lifecycle || !Array.isArray(actions) || !actions.length) {
    return;
  }

  const generation = ad.generationId ?? ad.link;
  let milestones = delivered.get(generation);
  if (!milestones) {
    milestones = new Set();
    delivered.set(generation, milestones);
    if (delivered.size > maxTrackedGenerations) {
      const oldest = delivered.keys().next().value;
      if (oldest !== undefined) {
        delivered.delete(oldest);
      }
    }
  }
  if (milestone !== AdLifecycleEvent.Click && milestones.has(milestone)) {
    return;
  }
  milestones.add(milestone);

  const events = new Set<string>();
  const pixels = new Set<string>();
  actions.forEach((action) => {
    if (
      action?.type === 'event' &&
      typeof action.name === 'string' &&
      supportedEvents.has(action.name) &&
      !events.has(action.name)
    ) {
      events.add(action.name);
      onEvent(action.name);
    }
    if (
      milestone !== 'impression' &&
      action?.type === 'pixel' &&
      typeof action.url === 'string' &&
      !pixels.has(action.url)
    ) {
      pixels.add(action.url);
      const url = substituteMacros(action.url, macros);
      try {
        const { protocol, username, password } = new URL(url);
        if (protocol === 'https:' && !username && !password) {
          new Image().src = url;
        }
      } catch {
        // An invalid tracker should not prevent the other actions from firing.
      }
    }
  });
};
