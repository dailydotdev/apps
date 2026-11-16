import type { Ad } from '../../graphql/posts';
import type { AdMacroContext } from './adMacros';
import { substituteMacros } from './adMacros';

export type AdSlotVisibilityMilestone =
  /** At least part of the creative is in the focused viewport. */
  | 'visible'
  | 'half-visible'
  /** Any part of the creative stays visible for one continuous second. */
  | 'visible-for-1s';

export type AdSlotMilestone =
  | 'post-fetch'
  | 'pre-render'
  | 'post-render'
  | AdSlotVisibilityMilestone
  /** The creative meets the display viewability ratio for a full second. */
  | 'viewable';

type AdSlotAction =
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

// Ads are cached across card remounts. Query updates can copy an ad while
// retaining its lifecycle configuration, so track delivery on that config.
const delivered = new WeakMap<
  AdSlotLifecycle,
  Map<string, Set<AdSlotMilestone>>
>();

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

  let generations = delivered.get(lifecycle);
  if (!generations) {
    generations = new Map();
    delivered.set(lifecycle, generations);
  }
  const generation = ad.generationId ?? ad.link;
  let milestones = generations.get(generation);
  if (!milestones) {
    milestones = new Set();
    generations.set(generation, milestones);
  }
  if (milestones.has(milestone)) {
    return;
  }
  milestones.add(milestone);

  const events = new Set<string>();
  const pixels = new Set<string>();
  actions.forEach((action) => {
    if (
      action?.type === 'event' &&
      typeof action.name === 'string' &&
      !events.has(action.name)
    ) {
      events.add(action.name);
      onEvent(action.name);
    }
    if (
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
