import { useCallback, useEffect } from 'react';
import { notificationCtaV2Feature } from '../../lib/featureManagement';
import { isDevelopment } from '../../lib/constants';
import { useConditionalFeature } from '../useConditionalFeature';

/**
 * QA preview note:
 * - Enable the flag with GrowthBook using `notification_cta_v2`.
 * - In development, force preview via `?notificationCtaPreview=on`,
 *   `?notificationCtaPreview=top-hero`, `?notificationCtaPreview=in-feed-hero`,
 *   `?notificationCtaPreview=sidebar-prompt`, or clear it with
 *   `?notificationCtaPreview=clear`.
 * - The query param is mirrored into session storage so refreshes keep the same
 *   preview until cleared.
 *
 * Cleanup note:
 * - When the QA mechanism is no longer needed, remove the query/session preview
 *   handling from this file and convert callers to rely only on the permanent
 *   flag behavior.
 */
const NOTIFICATION_CTA_PREVIEW_QUERY_PARAM = 'notificationCtaPreview';
const NOTIFICATION_CTA_PREVIEW_SESSION_KEY = 'notification_cta_preview';

export const NotificationCtaPreviewPlacement = {
  TopHero: 'top-hero',
  InFeedHero: 'in-feed-hero',
  SidebarPrompt: 'sidebar-prompt',
} as const;

export type NotificationCtaPreviewPlacementValue =
  (typeof NotificationCtaPreviewPlacement)[keyof typeof NotificationCtaPreviewPlacement];

type NotificationCtaPreviewValue = NotificationCtaPreviewPlacementValue | 'on';

const clearPreviewValues = new Set(['0', 'clear', 'off']);
const validPreviewValues = new Set<NotificationCtaPreviewValue>([
  'on',
  NotificationCtaPreviewPlacement.TopHero,
  NotificationCtaPreviewPlacement.InFeedHero,
  NotificationCtaPreviewPlacement.SidebarPrompt,
]);

const parsePreviewValue = (
  value: string | null,
): NotificationCtaPreviewValue | null => {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();
  if (clearPreviewValues.has(normalizedValue)) {
    return null;
  }

  if (!validPreviewValues.has(normalizedValue as NotificationCtaPreviewValue)) {
    return null;
  }

  return normalizedValue as NotificationCtaPreviewValue;
};

const getQueryPreviewValue = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return new URLSearchParams(window.location.search).get(
    NOTIFICATION_CTA_PREVIEW_QUERY_PARAM,
  );
};

const getStoredPreviewValue = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage.getItem(NOTIFICATION_CTA_PREVIEW_SESSION_KEY);
};

export interface UseNotificationCtaExperiment {
  isEnabled: boolean;
  isFeatureEnabled: boolean;
  isPreviewActive: boolean;
  forcedPlacement: NotificationCtaPreviewPlacementValue | null;
  isPlacementForced: (
    placement: NotificationCtaPreviewPlacementValue,
  ) => boolean;
  shouldHidePlacement: (
    placement: NotificationCtaPreviewPlacementValue,
  ) => boolean;
}

interface UseNotificationCtaExperimentProps {
  shouldEvaluate?: boolean;
}

export const useNotificationCtaExperiment = ({
  shouldEvaluate = true,
}: UseNotificationCtaExperimentProps = {}): UseNotificationCtaExperiment => {
  const queryPreviewValue = getQueryPreviewValue();
  const previewValue = isDevelopment
    ? parsePreviewValue(queryPreviewValue ?? getStoredPreviewValue())
    : null;
  const forcedPlacement =
    previewValue && previewValue !== 'on' ? previewValue : null;
  const isPreviewActive = !!previewValue;
  const { value: isFeatureEnabled } = useConditionalFeature({
    feature: notificationCtaV2Feature,
    shouldEvaluate,
  });

  useEffect(() => {
    if (!isDevelopment || typeof window === 'undefined' || !queryPreviewValue) {
      return;
    }

    const normalizedValue = queryPreviewValue.trim().toLowerCase();
    if (clearPreviewValues.has(normalizedValue)) {
      window.sessionStorage.removeItem(NOTIFICATION_CTA_PREVIEW_SESSION_KEY);
      return;
    }

    if (
      validPreviewValues.has(normalizedValue as NotificationCtaPreviewValue)
    ) {
      window.sessionStorage.setItem(
        NOTIFICATION_CTA_PREVIEW_SESSION_KEY,
        normalizedValue,
      );
    }
  }, [queryPreviewValue]);

  const isPlacementForced = useCallback(
    (placement: NotificationCtaPreviewPlacementValue) => {
      return forcedPlacement === placement;
    },
    [forcedPlacement],
  );

  const shouldHidePlacement = useCallback(
    (placement: NotificationCtaPreviewPlacementValue) => {
      return !!forcedPlacement && forcedPlacement !== placement;
    },
    [forcedPlacement],
  );

  return {
    isEnabled: Boolean(isFeatureEnabled) || isPreviewActive,
    isFeatureEnabled: Boolean(isFeatureEnabled),
    isPreviewActive,
    forcedPlacement,
    isPlacementForced,
    shouldHidePlacement,
  };
};
