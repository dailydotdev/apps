import type { ReactElement } from 'react';
import React from 'react';
import ReadingReminderFeedHero from '@dailydotdev/shared/src/components/marketing/banners/ReadingReminderFeedHero';
import { TopHero } from '@dailydotdev/shared/src/components/marketing/banners/HeroBottomBanner';
import { featureReadingReminderHeroCopy } from '@dailydotdev/shared/src/lib/featureManagement';

// Today's hero exactly as Feed.tsx renders it: the same component per
// layout, the same classes and the same props. The copy is the
// reading_reminder_hero_copy default, which is what production serves.

const copy = featureReadingReminderHeroCopy.defaultValue;

export const TodayHero = ({
  isLaptop,
  onEnable,
  onClose,
}: {
  /** useLaptopLayout: the v2 shell from 1024px up. */
  isLaptop: boolean;
  onEnable?: () => void;
  onClose?: () => void;
}): ReactElement =>
  isLaptop ? (
    <TopHero
      className="order-first"
      title={copy.title}
      subtitle={copy.subtitle}
      onCtaClick={onEnable}
      onClose={onClose}
    />
  ) : (
    <ReadingReminderFeedHero
      className="pt-2"
      title={copy.title}
      subtitle={copy.subtitle}
      onCtaClick={onEnable}
      onClose={onClose}
    />
  );
