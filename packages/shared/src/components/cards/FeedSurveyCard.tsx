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
  const [submitted, setSubmitted] = useState(false);
  const [justClicked, setJustClicked] = useState(false);
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

  const onSubmit = () => {
    if (submitted) {
      return;
    }

    setSubmitted(true);
    updateFeedFeedbackReminder();
    trackSurveyEvent(AnalyticsEvent.Click, { value: score });
  };

  const onStarClick = (value) => {
    if (submitted) {
      return;
    }

    setScore(value);
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

  const onOut = () => {
    setHovered(0);
    setJustClicked(false);
  };

  return (
    <CardComponent
      className="relative items-center gap-4 overflow-hidden pt-20"
      style={{
        background:
          'linear-gradient(180deg, rgba(255, 233, 35, 0.08) 0%, rgba(252, 83, 141, 0.08) 50%, rgba(113, 71, 237, 0.08) 100%)',
      }}
    >
      <h3 className="font-bold typo-title3">{title}</h3>
      <span className="flex flex-row">
        {Object.keys([...Array(max)]).map((key, i) => (
          <ConditionalWrapper
            key={key}
            condition={!submitted}
            wrapper={(component) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onStarClick(i + 1);
                  setJustClicked(true);
                }}
                onMouseOver={() => setHovered(i + 1)}
                onFocus={() => setHovered(i + 1)}
                onMouseOut={onOut}
                onBlur={onOut}
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
                i < highlighted && hovered && !justClicked && 'opacity-[0.8]',
              )}
            />
          </ConditionalWrapper>
        ))}
      </span>
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
