import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import { Card as CardV1 } from '../v1/Card';
import { Card } from '../Card';
import { useFeedLayout } from '../../../hooks';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { RatingStars } from '../../utilities/RatingStars';
import { useFeedSurvey } from '../../../hooks/feed/useFeedSurvey';
import { FeedSurveyProps } from './common';

export function FeedSurveyCard({
  max,
  title,
  lowScore,
  postFeedbackMessage = 'Thank you for your feedback!',
}: FeedSurveyProps): ReactElement {
  const [score, setScore] = useState(0);
  const { submitted, onSubmit, onHide } = useFeedSurvey({ score });
  const { shouldUseListFeedLayout } = useFeedLayout();
  const CardComponent = shouldUseListFeedLayout ? CardV1 : Card;

  return (
    <div
      className="relative rounded-16 p-px"
      style={{
        backgroundImage:
          'linear-gradient(180deg, rgba(255, 233, 35, 1) 0%, rgba(252, 83, 141, 1) 50%, rgba(113, 71, 237, 1) 100%)',
      }}
    >
      <div className="absolute inset-px rounded-16 bg-background-default" />
      <CardComponent
        className={classNames(
          'relative items-center gap-4 overflow-hidden',
          shouldUseListFeedLayout ? '!py-10' : 'pt-20',
        )}
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
    </div>
  );
}
