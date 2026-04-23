import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import MyFeedHeading from '@dailydotdev/shared/src/components/filters/MyFeedHeading';
import { AchievementTrackerButton } from '@dailydotdev/shared/src/components/filters/AchievementTrackerButton';
import { ToggleClickbaitShield } from '@dailydotdev/shared/src/components/buttons/ToggleClickbaitShield';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import {
  dateFormatInTimezone,
  DEFAULT_TIMEZONE,
} from '@dailydotdev/shared/src/lib/timezones';
import type { ExploreCategoryId } from './exploreCategories';
import { getExploreCategoryById } from './exploreCategories';

export function ExploreTopNewsHeader({
  activeTabId,
}: {
  activeTabId: ExploreCategoryId;
}): ReactElement {
  const { user } = useAuthContext();
  const timezone = user?.timezone ?? DEFAULT_TIMEZONE;
  const category = getExploreCategoryById(activeTabId);
  const title = category?.label ?? 'Explore';
  const todayLabel = dateFormatInTimezone(
    new Date(),
    'EEEE, MMMM d, yyyy',
    timezone,
  );
  const showDate = activeTabId === 'explore';

  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.Title1}
          color={TypographyColor.Primary}
          bold
        >
          {title}
        </Typography>
        {showDate && (
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
            className="mt-1"
          >
            {todayLabel}
          </Typography>
        )}
      </div>
      <div className="hidden shrink-0 items-center gap-2 tablet:flex">
        <MyFeedHeading
          size={ButtonSize.Small}
          variant={ButtonVariant.Subtle}
          showLabel={false}
        />
        <ToggleClickbaitShield
          origin={Origin.ExplorePage}
          buttonProps={{ size: ButtonSize.Small, variant: ButtonVariant.Subtle }}
        />
        <AchievementTrackerButton
          size={ButtonSize.Small}
          variant={ButtonVariant.Subtle}
        />
      </div>
    </div>
  );
}
