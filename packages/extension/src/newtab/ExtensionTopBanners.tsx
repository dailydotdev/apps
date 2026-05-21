import type { ReactElement } from 'react';
import React from 'react';
import { TopHero } from '@dailydotdev/shared/src/components/marketing/banners/HeroBottomBanner';
import { useReadingReminderHero } from '@dailydotdev/shared/src/hooks/notifications/useReadingReminderHero';

export const ExtensionTopBanners = (): ReactElement | null => {
  // The extension's top hero row is the only place this card appears
  // on the new tab, so we evaluate the reminder regardless of viewport
  // (the webapp-only `requireMobile` heuristic would hide it on desktop
  // new tabs, which is where the extension lives).
  const reminder = useReadingReminderHero({ requireMobile: false });

  if (!reminder.shouldShow) {
    return null;
  }

  return (
    <div className="mx-4 mb-3 grid grid-cols-1 gap-3 laptop:mx-0">
      <TopHero
        title={reminder.title}
        subtitle={reminder.subtitle}
        onCtaClick={() => {
          reminder.onEnable();
        }}
        onClose={() => {
          reminder.onDismiss();
        }}
      />
    </div>
  );
};
