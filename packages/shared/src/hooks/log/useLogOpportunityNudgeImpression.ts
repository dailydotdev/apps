import { useEffect, useRef } from 'react';
import { useLogContext } from '../../contexts/LogContext';
import { useAlertsContext } from '../../contexts/AlertContext';
import { LogEvent, TargetId } from '../../lib/log';

export const useLogOpportunityNudgeImpression = (
  targetId: TargetId = TargetId.Navigation,
) => {
  const { logEvent } = useLogContext();
  const { alerts } = useAlertsContext();
  const logRef = useRef<typeof logEvent>();
  const hasLoggedRef = useRef(false);
  const hasOpportunityAlert = !!alerts.opportunityId;

  logRef.current = logEvent;

  const logExtraPayload = JSON.stringify({
    count: hasOpportunityAlert ? 1 : 0, // always 1 for now
  });

  useEffect(() => {
    if (hasLoggedRef.current) {
      return;
    }

    logRef.current({
      event_name: LogEvent.ImpressionOpportunityNudge,
      target_id: targetId,
      extra: logExtraPayload,
    });
    hasLoggedRef.current = true;
  }, [logExtraPayload, targetId]);
};
