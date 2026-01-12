import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { FlexCol, FlexRow } from '../utilities';
import type { FeedbackClassification } from '../../features/opportunity/types';
import {
  FeedbackSentiment,
  FeedbackUrgency,
} from '../../features/opportunity/types';

const getSentimentLabel = (sentiment: FeedbackSentiment): string => {
  switch (sentiment) {
    case FeedbackSentiment.Positive:
      return 'Positive';
    case FeedbackSentiment.Neutral:
      return 'Neutral';
    case FeedbackSentiment.Negative:
      return 'Negative';
    default:
      return 'Unknown';
  }
};

const getSentimentStyles = (sentiment: FeedbackSentiment): string => {
  switch (sentiment) {
    case FeedbackSentiment.Positive:
      return 'bg-action-upvote-float text-action-upvote-default';
    case FeedbackSentiment.Neutral:
      return 'bg-surface-tertiary text-text-secondary';
    case FeedbackSentiment.Negative:
      return 'bg-action-downvote-float text-action-downvote-default';
    default:
      return 'bg-surface-tertiary text-text-secondary';
  }
};

const getUrgencyLabel = (urgency: FeedbackUrgency): string => {
  switch (urgency) {
    case FeedbackUrgency.Low:
      return 'Low';
    case FeedbackUrgency.Medium:
      return 'Medium';
    case FeedbackUrgency.High:
      return 'High';
    case FeedbackUrgency.Critical:
      return 'Critical';
    default:
      return 'Unknown';
  }
};

const getUrgencyStyles = (urgency: FeedbackUrgency): string => {
  switch (urgency) {
    case FeedbackUrgency.Low:
      return 'bg-action-upvote-float text-action-upvote-default';
    case FeedbackUrgency.Medium:
      return 'bg-overlay-quaternary-onion text-accent-onion-default';
    case FeedbackUrgency.High:
      return 'bg-overlay-quaternary-bacon text-accent-bacon-default';
    case FeedbackUrgency.Critical:
      return 'bg-action-downvote-float text-action-downvote-default';
    default:
      return 'bg-surface-tertiary text-text-secondary';
  }
};

interface FeedbackCardProps {
  feedback: FeedbackClassification;
}

const FeedbackCard = ({ feedback }: FeedbackCardProps): ReactElement => {
  const showSentiment = feedback.sentiment !== FeedbackSentiment.Unspecified;
  const showUrgency = feedback.urgency !== FeedbackUrgency.Unspecified;

  return (
    <FlexCol className="gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
      {(showSentiment || showUrgency) && (
        <FlexRow className="flex-wrap items-center gap-2">
          {showSentiment && (
            <span
              className={classNames(
                'rounded-8 px-2 py-1 typo-footnote',
                getSentimentStyles(feedback.sentiment),
              )}
            >
              {getSentimentLabel(feedback.sentiment)}
            </span>
          )}
          {showUrgency && (
            <span
              className={classNames(
                'rounded-8 px-2 py-1 typo-footnote',
                getUrgencyStyles(feedback.urgency),
              )}
            >
              {getUrgencyLabel(feedback.urgency)} urgency
            </span>
          )}
        </FlexRow>
      )}

      {feedback.answer && (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="whitespace-pre-wrap break-words"
        >
          &ldquo;{feedback.answer}&rdquo;
        </Typography>
      )}
    </FlexCol>
  );
};

export interface FeedbackListProps {
  feedback: FeedbackClassification[];
}

export const FeedbackList = ({ feedback }: FeedbackListProps): ReactElement => {
  return (
    <FlexCol className="gap-4">
      {feedback.length > 0 ? (
        feedback.map((item, index) => (
          <FeedbackCard key={item.answer ?? index} feedback={item} />
        ))
      ) : (
        <FlexCol className="items-center justify-center gap-2 py-8">
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
          >
            No feedback available yet
          </Typography>
        </FlexCol>
      )}
    </FlexCol>
  );
};
