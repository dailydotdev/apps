import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import classNames from 'classnames';
import { Card as CardV1 } from './v1/Card';
import { Card } from './Card';
import { useFeedLayout } from '../../hooks';
import { StarIcon } from '../icons';
import { IconSize } from '../Icon';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import ConditionalWrapper from '../ConditionalWrapper';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { AnalyticsEvent, TargetId, TargetType } from '../../lib/analytics';
import { updateFeedFeedbackReminder } from '../../graphql/alerts';

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
  const [hovered, setHovered] = useState(0);
  const { shouldUseListFeedLayout } = useFeedLayout();
  const highlighted = hovered || score;
  const CardComponent = shouldUseListFeedLayout ? CardV1 : Card;
  const { trackEvent } = useAnalyticsContext();

  const trackSurveyEvent = (event_name: AnalyticsEvent, extra?) =>
    trackEvent({
      target_type: TargetType.PromotionCard,
      target_id: TargetId.FeedSurvey,
      event_name,
      extra,
    });

  const onStarClick = (value) => {
    setScore(value);
    updateFeedFeedbackReminder();
    trackSurveyEvent(AnalyticsEvent.Click, { value });
  };

  const onHide = () => {
    updateFeedFeedbackReminder();
    trackSurveyEvent(AnalyticsEvent.DismissPromotion);
  };

  useEffect(() => {
    trackSurveyEvent(AnalyticsEvent.Impression);
    // trackEvent is unstable and we only need to track once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CardComponent
      className="relative items-center overflow-hidden pt-20"
      style={{
        background:
          'linear-gradient(180deg, rgba(255, 233, 35, 0.08) 0%, rgba(252, 83, 141, 0.08) 50%, rgba(113, 71, 237, 0.08) 100%)',
      }}
    >
      <h3 className="font-bold typo-title3">{title}</h3>
      <span className="mt-4 flex flex-row">
        {Object.keys([...Array(max)]).map((key, i) => (
          <ConditionalWrapper
            key={key}
            condition={score === 0}
            wrapper={(component) => (
              <button
                key={key}
                type="button"
                onClick={() => onStarClick(i + 1)}
                onMouseOver={() => setHovered(i + 1)}
                onMouseOut={() => setHovered(0)}
                onFocus={() => setHovered(i + 1)}
                onBlur={() => setHovered(0)}
              >
                {component}
              </button>
            )}
          >
            <StarIcon
              size={IconSize.XLarge}
              secondary={i < highlighted}
              className={classNames(
                'mx-0.5',
                i < highlighted
                  ? 'text-accent-cheese-default'
                  : 'text-text-secondary',
                i < highlighted && highlighted > score && 'opacity-[0.8]',
              )}
            />
          </ConditionalWrapper>
        ))}
      </span>
      {score > 0 && (
        <p className="mt-6 text-center text-text-secondary typo-body">
          <span className="font-bold">{postFeedbackMessage}</span>
          {score <= lowScore.value && <p>{lowScore.message}</p>}
          {score <= lowScore.value && lowScore.cta}
        </p>
      )}
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        className="mb-2 mt-auto"
        onClick={onHide}
      >
        Hide
      </Button>
    </CardComponent>
  );
}
