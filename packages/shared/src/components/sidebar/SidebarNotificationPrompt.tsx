import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import CloseButton from '../CloseButton';
import ReadingReminderCatLaptop from '../banners/ReadingReminderCatLaptop';
import { useReadingReminderHero } from '../../hooks/notifications/useReadingReminderHero';
import {
  NotificationCtaKind,
  NotificationCtaPlacement,
  NotificationPromptSource,
  TargetType,
} from '../../lib/log';
import { webappUrl } from '../../lib/constants';
import {
  NotificationCtaPreviewPlacement,
  useNotificationCtaExperiment,
} from '../../hooks/notifications/useNotificationCtaExperiment';
import {
  useNotificationCtaAnalytics,
  useNotificationCtaImpression,
} from '../../hooks/notifications/useNotificationCtaAnalytics';

type SidebarNotificationPromptProps = {
  sidebarExpanded: boolean;
};

export const SidebarNotificationPrompt = ({
  sidebarExpanded,
}: SidebarNotificationPromptProps): ReactElement | null => {
  const { pathname } = useRouter();
  const {
    shouldShow,
    title,
    subtitle,
    shouldShowDismiss,
    onEnable,
    onDismiss,
  } = useReadingReminderHero({
    requireMobile: false,
  });
  const { isEnabled: isNotificationCtaExperimentEnabled, shouldHidePlacement } =
    useNotificationCtaExperiment({
      shouldEvaluate: pathname === webappUrl && sidebarExpanded && shouldShow,
    });
  const { logClick, logDismiss } = useNotificationCtaAnalytics();

  const shouldHideSideMenuPrompt = shouldHidePlacement(
    NotificationCtaPreviewPlacement.SidebarPrompt,
  );

  const shouldShowSidebarPrompt =
    isNotificationCtaExperimentEnabled &&
    pathname === webappUrl &&
    sidebarExpanded &&
    !shouldHideSideMenuPrompt &&
    shouldShow;

  useNotificationCtaImpression(
    {
      kind: NotificationCtaKind.ReadingReminder,
      targetType: TargetType.ReadingReminder,
      source: NotificationPromptSource.ReadingReminder,
      placement: NotificationCtaPlacement.SidebarPrompt,
    },
    shouldShowSidebarPrompt,
  );

  const onEnableClick = useCallback(async () => {
    logClick({
      kind: NotificationCtaKind.ReadingReminder,
      targetType: TargetType.ReadingReminder,
      source: NotificationPromptSource.ReadingReminder,
      placement: NotificationCtaPlacement.SidebarPrompt,
    });
    await onEnable();
  }, [logClick, onEnable]);

  const onDismissClick = useCallback(async () => {
    logDismiss({
      kind: NotificationCtaKind.ReadingReminder,
      targetType: TargetType.ReadingReminder,
      source: NotificationPromptSource.ReadingReminder,
      placement: NotificationCtaPlacement.SidebarPrompt,
    });
    await onDismiss();
  }, [logDismiss, onDismiss]);

  if (!shouldShowSidebarPrompt) {
    return null;
  }

  return (
    <div className="z-20 pointer-events-none absolute bottom-4 left-2 right-2">
      <div className="pointer-events-auto relative rounded-16 p-px">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-16">
          <div className="sidebar-notification-border absolute -inset-[60%] motion-safe:[animation:sidebar-popover-border-spin_5s_linear_infinite]" />
        </div>
        <div className="pointer-events-none absolute -right-8 top-1/2 h-[0.1875rem] w-10 -translate-y-1/2 bg-gradient-to-r from-white to-transparent blur-[2px] motion-safe:[animation:sidebar-popover-tail_5s_ease-in-out_infinite]" />
        <div className="relative rounded-[0.9375rem] bg-background-popover p-3 text-center shadow-2">
          {shouldShowDismiss && (
            <CloseButton
              size={ButtonSize.XSmall}
              className="absolute right-1 top-1"
              onClick={onDismissClick}
            />
          )}
          <div className="mb-2 flex justify-center pr-6">
            <ReadingReminderCatLaptop className="max-w-none rounded-8" />
          </div>
          <p className="text-text-tertiary typo-caption1">{title}</p>
          <p className="mt-1 text-text-primary typo-footnote">{subtitle}</p>
          <Button
            type="button"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Primary}
            className="mt-3 w-full justify-center"
            onClick={onEnableClick}
          >
            Enable reminder
          </Button>
        </div>
      </div>
    </div>
  );
};
