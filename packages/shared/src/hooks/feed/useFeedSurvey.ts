import { useEffect, useState } from 'react';
import { useLogContext } from '../../contexts/LogContext';
import { LogsEvent, TargetId, TargetType } from '../../lib/logs';
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
  const { trackEvent } = useLogContext();
  const { updateLocalBoot } = useAlertsContext();

  const trackSurveyEvent = (event_name: LogsEvent, extra?) =>
    trackEvent({
      target_type: TargetType.PromotionCard,
      target_id: TargetId.FeedSurvey,
      event_name,
      extra,
    });

  const onSubmit = () => {
    if (submitted) {
      return;
    }

    setSubmitted(true);
    updateFeedFeedbackReminder();
    trackSurveyEvent(LogsEvent.Click, { value: score });
  };

  const onHide = () => {
    updateFeedFeedbackReminder();
    trackSurveyEvent(LogsEvent.DismissPromotion);
    updateLocalBoot({ shouldShowFeedFeedback: false });
  };

  useEffect(() => {
    trackSurveyEvent(LogsEvent.Impression);
    // trackEvent is unstable, and we only need to track once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { submitted, onSubmit, onHide };
};
