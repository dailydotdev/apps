import type { ReactElement } from 'react';
import React from 'react';
import ReadingReminderFeedHero from '@dailydotdev/shared/src/components/marketing/banners/ReadingReminderFeedHero';
import { TopHero } from '@dailydotdev/shared/src/components/marketing/banners/HeroBottomBanner';
import { featureReadingReminderHeroCopy } from '@dailydotdev/shared/src/lib/featureManagement';
import { readingReminderPushPromptCopy } from '@dailydotdev/shared/src/hooks/notifications/useReadingReminderPushPrompt';

// Today's hero exactly as Feed.tsx renders it: the same component per
// layout, the same classes and the same props. The reminder copy is the
// reading_reminder_hero_copy default, which is what production serves; the
// paused prompt is the copy useReadingReminderFeedHero swaps in when a saved
// reminder can't reach the reader.

const copy = featureReadingReminderHeroCopy.defaultValue;

export type TodayKind = 'reminder' | 'paused';

const kinds: Record<
  TodayKind,
  { title: string; subtitle: string; ctaLabel?: string }
> = {
  reminder: { title: copy.title, subtitle: copy.subtitle },
  paused: {
    title: readingReminderPushPromptCopy.title,
    subtitle: readingReminderPushPromptCopy.heroSubtitle,
    ctaLabel: readingReminderPushPromptCopy.cta,
  },
};

export const TodayHero = ({
  isLaptop,
  kind = 'reminder',
  onEnable,
  onClose,
}: {
  /** useLaptopLayout: the v2 shell from 1024px up. */
  isLaptop: boolean;
  kind?: TodayKind;
  onEnable?: () => void;
  onClose?: () => void;
}): ReactElement => {
  const { title, subtitle, ctaLabel } = kinds[kind];

  return isLaptop ? (
    <TopHero
      className="order-first"
      title={title}
      subtitle={subtitle}
      ctaLabel={ctaLabel}
      onCtaClick={onEnable}
      onClose={onClose}
    />
  ) : (
    <ReadingReminderFeedHero
      className="pt-2"
      title={title}
      subtitle={subtitle}
      ctaLabel={ctaLabel}
      onCtaClick={onEnable}
      onClose={onClose}
    />
  );
};
