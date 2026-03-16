import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import CloseButton from '../CloseButton';
import ReadingReminderCatLaptop from '../banners/ReadingReminderCatLaptop';
import { useEnableNotification } from '../../hooks/notifications';
import { NotificationPromptSource } from '../../lib/log';

type SidebarNotificationPromptProps = {
  sidebarExpanded: boolean;
};

export const SidebarNotificationPrompt = ({
  sidebarExpanded,
}: SidebarNotificationPromptProps): ReactElement | null => {
  const forceSideMenuPromptFromUrl =
    globalThis?.location?.search?.includes('forceSideMenuPrompt=1') ?? false;
  const forceInFeedHeroFromUrl =
    globalThis?.location?.search?.includes('forceInFeedHero=1') ?? false;
  const forceBottomHeroFromUrl =
    globalThis?.location?.search?.includes('forceBottomHero=1') ?? false;
  const forceTopHeroFromUrl =
    globalThis?.location?.search?.includes('forceTopHero=1') ?? false;
  const forcePopupNotificationCtaFromUrl =
    globalThis?.location?.search?.includes('forcePopupNotificationCta=1') ??
    false;
  const forceNotificationCtaFromUrl =
    globalThis?.location?.search?.includes('forceNotificationCta=1') ?? false;
  const { shouldShowCta, onEnable, onDismiss } = useEnableNotification({
    source: NotificationPromptSource.NotificationsPage,
  });

  const shouldHideSideMenuPrompt =
    forceInFeedHeroFromUrl ||
    forceBottomHeroFromUrl ||
    forceTopHeroFromUrl ||
    forcePopupNotificationCtaFromUrl ||
    forceNotificationCtaFromUrl;

  if (
    !sidebarExpanded ||
    shouldHideSideMenuPrompt ||
    (!forceSideMenuPromptFromUrl && !shouldShowCta)
  ) {
    return null;
  }

  return (
    <div className="z-20 pointer-events-none absolute bottom-4 left-2 right-2">
      <div className="pointer-events-auto relative rounded-16 p-[1px]">
        <style>
          {`
            @keyframes sidebar-popover-border-spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }

            @keyframes sidebar-popover-tail {
              0%, 100% {
                opacity: 0.35;
                transform: translateX(0);
              }
              50% {
                opacity: 0.95;
                transform: translateX(0.25rem);
              }
            }
          `}
        </style>
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-16">
          <div className="absolute -inset-[60%] bg-[conic-gradient(from_0deg,rgba(255,255,255,0.06),rgba(255,255,255,0.9),rgba(255,255,255,0.08),rgba(255,255,255,0.95),rgba(255,255,255,0.06))] motion-safe:[animation:sidebar-popover-border-spin_5s_linear_infinite]" />
        </div>
        <div className="pointer-events-none absolute -right-8 top-1/2 h-[0.1875rem] w-10 -translate-y-1/2 bg-gradient-to-r from-white to-transparent blur-[2px] motion-safe:[animation:sidebar-popover-tail_5s_ease-in-out_infinite]" />
        <div className="relative rounded-[0.9375rem] bg-background-popover p-3 text-center shadow-2">
          <CloseButton
            size={ButtonSize.XSmall}
            className="absolute right-1 top-1"
            onClick={onDismiss}
          />
          <div className="mb-2 flex justify-center pr-6">
            <ReadingReminderCatLaptop className="max-w-none rounded-8" />
          </div>
          <p className="text-text-tertiary typo-caption1">
            Never miss a learning day.
          </p>
          <p className="mt-1 text-text-primary typo-footnote">
            Turn on your daily reading reminder and keep your routine.
          </p>
          <Button
            type="button"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Primary}
            className="mt-3 w-full justify-center"
            onClick={onEnable}
          >
            Enable reminder
          </Button>
        </div>
      </div>
    </div>
  );
};
