import type { ReactNode } from 'react';
import { useViewSizeClient, ViewSize } from '../../../hooks/useViewSize';

/**
 * Below laptop the post page stacks its rail (source and creator cards, the
 * direct ad widget, plugins, LFG) under the main column. The post page feed
 * (`post_page_feed`) ends the main column with For you, which pages forever,
 * so a rail stacked under it is never reached: the direct ad still mounted
 * and logged its impression, but on phones it stopped being seen or clicked.
 *
 * With a feed in the `belowComments` slot and a viewport below laptop, the
 * rail goes between the comments and the feed instead. Until the viewport is
 * known (server and first client render) the rail stays where it always was,
 * so hydration matches and laptops never move it.
 */
export const useRailAboveFeed = (belowComments?: ReactNode): boolean => {
  const isLaptop = useViewSizeClient(ViewSize.Laptop);

  return !!belowComments && isLaptop === false;
};

/** The rail's classes while it sits in the main column, above the feed. */
export const railAboveFeedClassName =
  '-mx-4 mt-6 !gap-2 border-t border-border-subtlest-tertiary pb-2 pt-6 tablet:-mx-6';
