import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { FlexCol } from '../utilities';
import type {
  AnonymousUserContext,
  FeedbackClassification,
} from '../../features/opportunity/types';
import {
  FeedbackSentiment,
  FeedbackUrgency,
} from '../../features/opportunity/types';
import { getRecruiterExperienceLevelLabel } from '../../lib/user';

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

const getSentimentBorderColor = (sentiment: FeedbackSentiment): string => {
  switch (sentiment) {
    case FeedbackSentiment.Positive:
      return 'border-l-accent-avocado-default';
    case FeedbackSentiment.Neutral:
      return 'border-l-border-subtlest-tertiary';
    case FeedbackSentiment.Negative:
      return 'border-l-accent-ketchup-default';
    default:
      return 'border-l-border-subtlest-tertiary';
  }
};

const getSentimentBadgeStyles = (sentiment: FeedbackSentiment): string => {
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
      return 'Low priority';
    case FeedbackUrgency.Medium:
      return 'Medium priority';
    case FeedbackUrgency.High:
      return 'High priority';
    case FeedbackUrgency.Critical:
      return 'Critical';
    default:
      return '';
  }
};

const getUrgencyStyles = (urgency: FeedbackUrgency): string => {
  switch (urgency) {
    case FeedbackUrgency.Low:
      return 'text-text-tertiary';
    case FeedbackUrgency.Medium:
      return 'text-accent-onion-default';
    case FeedbackUrgency.High:
      return 'text-accent-bacon-default';
    case FeedbackUrgency.Critical:
      return 'text-accent-ketchup-default';
    default:
      return 'text-text-tertiary';
  }
};

interface UserContextDisplayProps {
  userContext: AnonymousUserContext;
}

const UserContextDisplay = ({
  userContext,
}: UserContextDisplayProps): ReactElement | null => {
  const seniorityLabel = getRecruiterExperienceLevelLabel(
    userContext.seniority ?? undefined,
  );

  const hasAnyData = seniorityLabel || userContext.locationCountry;

  if (!hasAnyData) {
    return null;
  }

  const infoParts: string[] = [];
  if (seniorityLabel) {
    infoParts.push(`${seniorityLabel} experience`);
  }
  if (userContext.locationCountry) {
    infoParts.push(userContext.locationCountry);
  }

  return (
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Secondary}
    >
      {infoParts.join(' · ')}
    </Typography>
  );
};

interface FeedbackCardProps {
  feedback: FeedbackClassification;
}

const FeedbackCard = ({ feedback }: FeedbackCardProps): ReactElement => {
  const showSentiment = feedback.sentiment !== FeedbackSentiment.Unspecified;
  const showUrgency = feedback.urgency !== FeedbackUrgency.Unspecified;
  const hasUserContext = feedback.userContext;

  return (
    <div
      className={classNames(
        'flex flex-col gap-3 rounded-12 border border-l-4 border-border-subtlest-tertiary bg-background-subtle p-4',
        getSentimentBorderColor(feedback.sentiment),
      )}
    >
      {/* Header with sentiment badge and urgency */}
      <div className="flex items-center justify-between">
        {showSentiment && (
          <span
            className={classNames(
              'rounded-8 px-2 py-0.5 font-bold typo-caption1',
              getSentimentBadgeStyles(feedback.sentiment),
            )}
          >
            {getSentimentLabel(feedback.sentiment)}
          </span>
        )}
        {showUrgency && (
          <Typography
            type={TypographyType.Caption1}
            className={getUrgencyStyles(feedback.urgency)}
          >
            {getUrgencyLabel(feedback.urgency)}
          </Typography>
        )}
      </div>

      {/* Feedback quote */}
      {feedback.answer && (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          className="whitespace-pre-wrap break-words"
        >
          &ldquo;{feedback.answer}&rdquo;
        </Typography>
      )}

      {/* User context - seniority and location */}
      {hasUserContext && (
        <UserContextDisplay userContext={feedback.userContext} />
      )}
    </div>
  );
};

export interface FeedbackListProps {
  feedback: FeedbackClassification[];
}

export const FeedbackList = ({ feedback }: FeedbackListProps): ReactElement => {
  return (
    <FlexCol className="gap-3">
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
