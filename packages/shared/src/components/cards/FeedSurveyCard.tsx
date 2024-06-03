import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { Card as CardV1 } from './v1/Card';
import { Card } from './Card';
import { useFeedLayout } from '../../hooks';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { AnalyticsEvent, TargetId, TargetType } from '../../lib/analytics';
import { updateFeedFeedbackReminder } from '../../graphql/alerts';
import { RatingStars } from '../utilities/RatingStars';

interface FeedSurveyCardProps {
  title: string;
  postFeedbackMessage?: string;
  max: number;
  lowScore: {
    value: number;
    message: string;
    cta: ReactNode;
  };
}

export function FeedSurveyCard({
  max,
  title,
  lowScore,
  postFeedbackMessage = 'Thank you for your feedback!',
}: FeedSurveyCardProps): ReactElement {
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const { shouldUseListFeedLayout } = useFeedLayout();
  const CardComponent = shouldUseListFeedLayout ? CardV1 : Card;
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

  return (
    <CardComponent
      className="relative items-center gap-4 overflow-hidden pt-20"
      style={{
        background:
          'linear-gradient(180deg, rgba(255, 233, 35, 0.08) 0%, rgba(252, 83, 141, 0.08) 50%, rgba(113, 71, 237, 0.08) 100%)',
      }}
    >
      <h3 className="font-bold typo-title3">{title}</h3>
      <RatingStars max={max} isDisabled={submitted} onStarClick={setScore} />
      {submitted && (
        <p className="mt-2 text-center text-text-secondary typo-body">
          <span className="font-bold">{postFeedbackMessage}</span>
          {score <= lowScore.value && <p>{lowScore.message}</p>}
          {score <= lowScore.value && lowScore.cta}
        </p>
      )}
      {score > 0 && !submitted && (
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={onSubmit}
        >
          Submit
        </Button>
      )}
      {score === 0 && (
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          className="mb-2 mt-auto"
          onClick={onHide}
        >
          Hide
        </Button>
      )}
    </CardComponent>
  );
}
