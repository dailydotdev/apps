import { useCallback } from 'react';
import { useLogContext } from '../../contexts/LogContext';
import type { StartCampaignProps } from '../../graphql/campaigns';
import { CampaignType } from '../../graphql/campaigns';
import type { ApiErrorResult } from '../../graphql/common';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { getLogErrorDetails } from '../../lib/errors';
import { LogEvent, Origin, TargetType } from '../../lib/log';

type BoostLogSettings = Pick<StartCampaignProps, 'budget' | 'duration'>;

interface UseBoostLoggingProps {
  type: CampaignType;
  referenceId?: string;
  origin?: Origin;
}

interface UseBoostLogging {
  logBoostEvent: (
    eventName: LogEvent,
    settings: BoostLogSettings,
    extra?: Record<string, unknown>,
  ) => void;
  logBuyCores: () => void;
}

export const getBoostErrorExtra = (
  error: ApiErrorResult,
): Record<string, unknown> => {
  const apiError = error?.response?.errors?.[0];

  return {
    error_code: apiError?.extensions?.code,
    error: apiError?.message ?? getLogErrorDetails(error)?.message,
  };
};

export const useBoostLogging = ({
  type,
  referenceId,
  origin,
}: UseBoostLoggingProps): UseBoostLogging => {
  const { logEvent } = useLogContext();
  const isPost = type === CampaignType.Post;
  const targetType = isPost ? TargetType.Post : TargetType.Source;

  useLogEventOnce(() => ({
    event_name: LogEvent.OpenBoost,
    target_type: targetType,
    target_id: referenceId,
    extra: JSON.stringify({ origin }),
  }));

  const logBoostEvent = useCallback<UseBoostLogging['logBoostEvent']>(
    (eventName, { budget, duration }, extra) =>
      logEvent({
        event_name: eventName,
        target_type: targetType,
        target_id: referenceId,
        extra: JSON.stringify({
          origin,
          budget,
          duration,
          total_cores: budget * duration,
          ...extra,
        }),
      }),
    [logEvent, origin, referenceId, targetType],
  );

  const logBuyCores = useCallback(
    () =>
      logEvent({
        event_name: LogEvent.StartBuyingCredits,
        target_type: targetType,
        target_id: referenceId,
        extra: JSON.stringify({
          origin: isPost ? Origin.BoostPost : Origin.SquadBoost,
          boost_origin: origin,
        }),
      }),
    [isPost, logEvent, origin, referenceId, targetType],
  );

  return { logBoostEvent, logBuyCores };
};
