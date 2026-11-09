import type { ComponentProps, ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import {
  DayStreak as ProductionDayStreak,
  freezeTooltipCopy,
  Streak,
} from '@dailydotdev/shared/src/components/streak/popup/DayStreak';
import { TriangleArrowIcon } from '@dailydotdev/shared/src/components/icons';
import {
  IconSize,
  iconSizeToClassName,
} from '@dailydotdev/shared/src/components/Icon';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { dateFormatInTimezone } from '@dailydotdev/shared/src/lib/timezones';
import { useConditionalFeature } from '../../../mock/hooks/useConditionalFeature';
import {
  getGtaViLabel,
  GtaViDisc,
  GtaViTooltip,
  gtaViFreezeDayFeature,
  isGtaViReleaseDay,
} from '../gtaViParts';

/*
 * Storybook stands this in for production's DayStreak, the day in the streak
 * button popup's strip (see the resolver in .storybook/main.ts). Every day
 * but release day, and every day with gta_vi_freeze_day off, is production's
 * DayStreak untouched. Release day keeps DayStreak's own layout: today's
 * arrow, the disc at the strip's size, and the weekday letter under it.
 */

export { freezeTooltipCopy, Streak };

type DayStreakProps = ComponentProps<typeof ProductionDayStreak>;

export function DayStreak(props: DayStreakProps): ReactElement {
  const { user } = useAuthContext();
  const timezone = user?.timezone ?? 'UTC';
  const { value: isGtaViEnabled } = useConditionalFeature({
    feature: gtaViFreezeDayFeature,
  });
  const { date, size = IconSize.Medium, shouldShowArrow } = props;
  // The streak popover is a tippy layer (z-index 9999) above Radix tooltips
  // (1000), so the tooltip portals into the popover's own layer.
  const [layer, setLayer] = useState<Element>();
  const triggerRef = useCallback((node: HTMLButtonElement | null) => {
    setLayer(node?.closest('[data-tippy-root]') ?? undefined);
  }, []);

  if (!isGtaViEnabled || !isGtaViReleaseDay(date, timezone)) {
    return <ProductionDayStreak {...props} />;
  }

  return (
    <GtaViTooltip today={new Date()} timezone={timezone} appendTo={layer}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={getGtaViLabel(
          date,
          timezone,
          props.streak === Streak.Completed,
        )}
        className="relative flex flex-col items-center gap-1"
      >
        {shouldShowArrow && (
          <TriangleArrowIcon
            className="absolute -top-4 text-accent-bacon-default"
            size={IconSize.XXSmall}
          />
        )}
        <GtaViDisc className={classNames(iconSizeToClassName[size])} />
        {dateFormatInTimezone(date, 'iiiii', timezone)}
      </button>
    </GtaViTooltip>
  );
}
