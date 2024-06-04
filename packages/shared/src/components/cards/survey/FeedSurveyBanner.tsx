import React, { ReactElement, useState } from 'react';
import { RatingStars } from '../../utilities/RatingStars';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { useFeedSurvey } from '../../../hooks/feed/useFeedSurvey';
import { FeedSurveyProps } from './common';
import { feedSurveyBg, feedSurveyBorder } from '../../../styles/custom';

export function FeedSurveyBanner({
  max,
  title,
  lowScore,
  postFeedbackMessage = 'Thank you for your feedback!',
}: FeedSurveyProps): ReactElement {
  const [score, setScore] = useState(0);
  const { submitted, onSubmit, onHide } = useFeedSurvey({ score });

  return (
    <div
      className="relative mb-4 flex flex-col px-4 py-6 tablet:px-6"
      style={{ background: feedSurveyBg }}
    >
      <div
        className="absolute left-0 right-0 top-0 h-px"
        style={{ background: feedSurveyBorder }}
      />
      <div className="flex flex-row items-start tablet:items-center">
        <div className="flex flex-1 flex-col items-start justify-between tablet:flex-row tablet:items-center">
          <h3 className="font-bold typo-title3">{title}</h3>
          <RatingStars max={max} onStarClick={setScore} />
        </div>
        <Button
          variant={score > 0 ? ButtonVariant.Primary : ButtonVariant.Float}
          size={ButtonSize.Small}
          onClick={score > 0 ? onSubmit : onHide}
          className="ml-2 w-24"
          disabled={submitted}
        >
          {score > 0 ? 'Submit' : 'Hide'}
        </Button>
      </div>
      {submitted && (
        <div className="mt-6 flex flex-col tablet:flex-row">
          <p className="shrink text-text-secondary typo-body">
            <strong className="mr-1">{postFeedbackMessage}</strong>
            {score <= lowScore.value ? lowScore.message : null}
          </p>
          {score <= lowScore.value && lowScore.cta}
        </div>
      )}
    </div>
  );
}
