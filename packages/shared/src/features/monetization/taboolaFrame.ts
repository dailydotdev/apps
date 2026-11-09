import { webappUrl } from '../../lib/constants';
import type { TaboolaResult } from './taboola';
import { isTaboolaPlacement, taboolaSimDomainParam } from './taboola';

/**
 * postMessage contract between a Taboola slot in the extension (parent) and the
 * Taboola embed page, which renders the placement on the webapp origin because
 * extension pages can't load Taboola's remote script. The parent passes the
 * placement, layout and theme in the URL, and the theme again when it changes;
 * the frame reports `ready` once the page runs, then the placement's result,
 * its content height and clicks.
 */

export const taboolaFramePath = 'embed/taboola';

export const taboolaFrameSource = 'dd-taboola-frame';

export type TaboolaVariant = 'grid' | 'fitted' | 'list' | 'compact' | 'hero';

export const taboolaVariants: TaboolaVariant[] = [
  'grid',
  'fitted',
  'list',
  'compact',
  'hero',
];

export interface TaboolaFrameParams {
  placement: number;
  variant: TaboolaVariant;
  /** The parent's theme class on `<html>`, none for dark. */
  theme?: string;
  /** AdGrid's shorter cover, next to posts showing their TLDR. */
  isShortCover?: boolean;
  /** The parent's `taboola_sim_domain`, which Taboola reads off the frame. */
  simDomain?: string;
}

export const getTaboolaFrameUrl = ({
  placement,
  variant,
  theme,
  isShortCover,
  simDomain,
}: TaboolaFrameParams): string =>
  `${webappUrl}${taboolaFramePath}?${new URLSearchParams({
    placement: placement.toString(),
    variant,
    ...(theme && { theme }),
    ...(isShortCover && { cover: 'short' }),
    ...(simDomain && { [taboolaSimDomainParam]: simDomain }),
  })}`;

export const parseTaboolaFrameUrl = (
  search: string,
): TaboolaFrameParams | undefined => {
  const params = new URLSearchParams(search);
  const placement = Number(params.get('placement'));
  const variant = params.get('variant') as TaboolaVariant;

  if (!isTaboolaPlacement(placement) || !taboolaVariants.includes(variant)) {
    return undefined;
  }

  return {
    placement,
    variant,
    theme: params.get('theme') ?? undefined,
    isShortCover: params.get('cover') === 'short',
    simDomain: params.get(taboolaSimDomainParam) ?? undefined,
  };
};

export type TaboolaFrameMessage =
  | { source: typeof taboolaFrameSource; type: 'ready' }
  | { source: typeof taboolaFrameSource; type: 'result'; result: TaboolaResult }
  | { source: typeof taboolaFrameSource; type: 'height'; height: number }
  | { source: typeof taboolaFrameSource; type: 'click' };

/** The parent's theme, when the reader switches it with the frame open. */
export interface TaboolaThemeMessage {
  source: typeof taboolaFrameSource;
  type: 'theme';
  theme: string;
}

export const isTaboolaThemeMessage = (
  data: unknown,
): data is TaboolaThemeMessage =>
  !!data &&
  typeof data === 'object' &&
  (data as TaboolaThemeMessage).source === taboolaFrameSource &&
  (data as TaboolaThemeMessage).type === 'theme';

export const isTaboolaFrameMessage = (
  data: unknown,
): data is TaboolaFrameMessage =>
  !!data &&
  typeof data === 'object' &&
  (data as TaboolaFrameMessage).source === taboolaFrameSource &&
  ['ready', 'result', 'height', 'click'].includes(
    (data as TaboolaFrameMessage).type,
  );
