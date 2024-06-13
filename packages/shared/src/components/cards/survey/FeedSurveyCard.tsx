import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import { Card } from '../Card';
import { useFeedLayout } from '../../../hooks';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { RatingStars } from '../../utilities/RatingStars';
import { useFeedSurvey } from '../../../hooks/feed/useFeedSurvey';
import { FeedSurveyProps } from './common';
import { feedSurveyBg, feedSurveyBorder } from '../../../styles/custom';
import { ListCard } from '../list/ListCard';

export function FeedSurveyCard({
  max,
  title,
  lowScore,
  postFeedbackMessage = 'Thank you for your feedback!',
}: FeedSurveyProps): ReactElement {
  const [score, setScore] = useState(0);
  const { submitted, onSubmit, onHide } = useFeedSurvey({ score });
  const { isListFeedLayout } = useFeedLayout();
  const CardComponent = isListFeedLayout ? ListCard : Card;

  return (
    <div
      className="relative rounded-16 p-0.5"
      style={{ backgroundImage: feedSurveyBorder }}
    >
      <CardComponent
        className={classNames(
          'relative items-center gap-4 overflow-hidden !rounded-14 border-0 shadow-none',
          isListFeedLayout ? '!py-10' : 'pt-20',
        )}
        style={{ background: feedSurveyBg }}
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
