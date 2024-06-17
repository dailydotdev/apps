import { useEffect, useState } from 'react';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetId, TargetType } from '../../lib/log';
import { updateFeedFeedbackReminder } from '../../graphql/alerts';
import { useAlertsContext } from '../../contexts/AlertContext';

interface UseFeedSurvey {
  submitted: boolean;
  onSubmit: () => void;
  onHide: () => void;
}

interface UseFeedSurveyProps {
  score: number;
}

export const useFeedSurvey = ({ score }: UseFeedSurveyProps): UseFeedSurvey => {
  const [submitted, setSubmitted] = useState(false);
  const { logEvent } = useLogContext();
  const { updateLocalBoot } = useAlertsContext();

  const logSurveyEvent = (event_name: LogEvent, extra?) =>
    logEvent({
      target_type: TargetType.PromotionCard,
      target_id: TargetId.FeedSurvey,
      event_name,
      ...(extra && { extra: JSON.stringify(extra) }),
    });

  const onSubmit = () => {
    if (submitted) {
      return;
    }

    setSubmitted(true);
    updateFeedFeedbackReminder();
    logSurveyEvent(LogEvent.Click, { value: score });
  };

  const onHide = () => {
    updateFeedFeedbackReminder();
    logSurveyEvent(LogEvent.DismissPromotion);
    updateLocalBoot({ shouldShowFeedFeedback: false });
  };

  useEffect(() => {
    logSurveyEvent(LogEvent.Impression);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { submitted, onSubmit, onHide };
};
