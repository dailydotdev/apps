import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import type { TaboolaPlacement } from '../../../features/monetization/taboola';
import { pushTaboolaPlacement } from '../../../features/monetization/taboola';
import { useReadTaboola } from './useReadAdSlots';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';

export interface ReadTaboolaSlotProps {
  placement: TaboolaPlacement;
  className?: string;
  /**
   * Skips the widget below the tablet breakpoint, where the rail stacks under
   * the article. Not rendered rather than hidden, so Taboola never fills a
   * container nobody can see.
   */
  hideOnPhone?: boolean;
}

/**
 * A Taboola widget on the /read template. Renders only while the template
 * serves Taboola (see useReadTaboola).
 */
export function ReadTaboolaSlot({
  placement,
  className,
  hideOnPhone,
}: ReadTaboolaSlotProps): ReactElement | null {
  const taboola = useReadTaboola();
  const isTablet = useViewSize(ViewSize.Tablet);
  const isLive = taboola && (!hideOnPhone || isTablet);

  useEffect(() => {
    if (isLive) {
      pushTaboolaPlacement(placement);
    }
  }, [isLive, placement]);

  if (!isLive) {
    return null;
  }

  return (
    <div
      id={placement.container}
      className={classNames('taboola-slot w-full', className)}
      data-testid="taboola-slot"
    />
  );
}
