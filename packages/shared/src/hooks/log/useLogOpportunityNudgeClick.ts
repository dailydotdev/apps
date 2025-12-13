import { useCallback } from 'react';
import { useLogContext } from '../../contexts/LogContext';
import { useAlertsContext } from '../../contexts/AlertContext';
import { LogEvent, TargetId } from '../../lib/log';
import { useActions } from '../useActions';
import { ActionType } from '../../graphql/actions';

export const useLogOpportunityNudgeClick = (
  targetId: TargetId = TargetId.Navigation,
) => {
  const { logEvent } = useLogContext();
  const { alerts } = useAlertsContext();
  const { completeAction } = useActions();
  const hasOpportunityAlert = !!alerts.opportunityId;

  const logOpportunityNudgeClick = useCallback(() => {
    logEvent({
      event_name: LogEvent.ClickOpportunityNudge,
      target_id: targetId,
      extra: JSON.stringify({
        count: hasOpportunityAlert ? 1 : 0, // always 1 for now
      }),
    });
    completeAction(ActionType.ClickedOpportunityNavigation);
  }, [logEvent, targetId, hasOpportunityAlert, completeAction]);

  return logOpportunityNudgeClick;
};
