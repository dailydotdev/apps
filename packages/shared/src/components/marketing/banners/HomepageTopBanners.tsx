import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { TopHero } from './HeroBottomBanner';
import { CvTopHero } from './CvTopHero';
import ReadingReminderCatLaptop from './ReadingReminderCatLaptop';
import { useReadingReminderFeedHero } from '../../../hooks/notifications/useReadingReminderFeedHero';
import { useCvTopBanner } from '../../../features/profile/hooks/useCvTopBanner';
import { useAuthContext } from '../../../contexts/AuthContext';

const CompactReminderCat = (): ReactElement => (
  <ReadingReminderCatLaptop className="!m-0 h-24 w-28 shrink-0 self-center rounded-12 object-contain tablet:h-28 tablet:w-32" />
);

export interface HomepageTopBannersState {
  hasAny: boolean;
  reminder: ReturnType<typeof useReadingReminderFeedHero>;
  cv: ReturnType<typeof useCvTopBanner>;
}

interface UseHomepageTopBannersProps {
  enabled?: boolean;
  // The CV card belongs to the same feed `FeedContainer` renders its banner
  // on, so the shell passes the feed it is currently showing.
  isMyFeed?: boolean;
}

/**
 * Evaluated once by the shell and handed to `HomepageTopBanners`: both cards
 * log their impression from the condition that renders them, so a second
 * evaluation would double-count them.
 */
export const useHomepageTopBanners = ({
  enabled: isEnabled = true,
  isMyFeed = false,
}: UseHomepageTopBannersProps = {}): HomepageTopBannersState => {
  const { isLoggedIn, isAuthReady } = useAuthContext();
  const enabled = isEnabled && isAuthReady && isLoggedIn;
  const reminder = useReadingReminderFeedHero({ enabled });
  const cv = useCvTopBanner({ enabled: enabled && isMyFeed });

  return {
    hasAny: reminder.shouldShowTopHero || cv.shouldShow,
    reminder,
    cv,
  };
};

interface HomepageTopBannersProps {
  className?: string;
  state: HomepageTopBannersState;
}

export const HomepageTopBanners = ({
  className,
  state,
}: HomepageTopBannersProps): ReactElement | null => {
  const { reminder, cv } = state;
  const cards: ReactElement[] = [];

  if (reminder.shouldShowTopHero) {
    cards.push(
      <TopHero
        key="reminder"
        title={reminder.title}
        subtitle={reminder.subtitle}
        illustration={<CompactReminderCat />}
        onCtaClick={() => {
          reminder.onEnableHero();
        }}
        onClose={() => {
          reminder.onDismissHero();
        }}
      />,
    );
  }

  if (cv.shouldShow) {
    cards.push(
      <CvTopHero
        key="cv"
        subtitle={cv.subtitle}
        onUpload={cv.onUpload}
        onClose={cv.onClose}
      />,
    );
  }

  if (cards.length === 0) {
    return null;
  }

  return (
    <div
      className={classNames(
        'grid grid-cols-1 gap-3',
        cards.length === 2 && 'tablet:grid-cols-2',
        className,
      )}
    >
      {cards}
    </div>
  );
};
