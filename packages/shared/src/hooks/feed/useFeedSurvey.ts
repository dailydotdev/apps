import { useEffect, useState } from 'react';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { AnalyticsEvent, TargetId, TargetType } from '../../lib/analytics';
import { updateFeedFeedbackReminder } from '../../graphql/alerts';

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
  const { trackEvent } = useAnalyticsContext();

  const trackSurveyEvent = (event_name: AnalyticsEvent, extra?) =>
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
    trackSurveyEvent(AnalyticsEvent.Click, { value: score });
  };

  const onHide = () => {
    updateFeedFeedbackReminder();
    trackSurveyEvent(AnalyticsEvent.DismissPromotion);
  };

  useEffect(() => {
    trackSurveyEvent(AnalyticsEvent.Impression);
    // trackEvent is unstable, and we only need to track once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { submitted, onSubmit, onHide };
};
