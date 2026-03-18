import { useCallback } from 'react';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import type {
  NotificationCtaKind,
  NotificationCtaPlacement,
  NotificationPromptSource,
} from '../../lib/log';
import useLogEventOnce from '../log/useLogEventOnce';

type NotificationCtaTargetType = string;

interface NotificationCtaAnalyticsParams {
  kind: NotificationCtaKind;
  targetType: NotificationCtaTargetType;
  placement?: NotificationCtaPlacement;
  source?: NotificationPromptSource;
  targetId?: string;
  extra?: Record<string, unknown>;
}

const getNotificationCtaExtra = ({
  kind,
  placement,
  source,
  extra,
}: NotificationCtaAnalyticsParams): string => {
  return JSON.stringify({
    kind,
    ...(placement ? { placement } : {}),
    ...(source ? { origin: source } : {}),
    ...extra,
  });
};

const getBaseNotificationCtaEvent = (
  params: NotificationCtaAnalyticsParams,
) => ({
  target_type: params.targetType,
  ...(params.targetId ? { target_id: params.targetId } : {}),
  extra: getNotificationCtaExtra(params),
});

export const useNotificationCtaImpression = (
  params: NotificationCtaAnalyticsParams,
  condition = true,
): void => {
  useLogEventOnce(
    () => ({
      event_name: LogEvent.Impression,
      ...getBaseNotificationCtaEvent(params),
    }),
    { condition },
  );
};

export const useNotificationCtaAnalytics = () => {
  const { logEvent } = useLogContext();

  const logClick = useCallback(
    (params: NotificationCtaAnalyticsParams) => {
      logEvent({
        event_name: LogEvent.Click,
        ...getBaseNotificationCtaEvent(params),
      });
    },
    [logEvent],
  );

  const logDismiss = useCallback(
    (params: NotificationCtaAnalyticsParams) => {
      logEvent({
        event_name: LogEvent.ClickNotificationDismiss,
        ...getBaseNotificationCtaEvent(params),
      });
    },
    [logEvent],
  );

  const logImpression = useCallback(
    (params: NotificationCtaAnalyticsParams) => {
      logEvent({
        event_name: LogEvent.Impression,
        ...getBaseNotificationCtaEvent(params),
      });
    },
    [logEvent],
  );

  return {
    logClick,
    logDismiss,
    logImpression,
  };
};
