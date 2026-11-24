import type { ReactElement } from 'react';
import React from 'react';
import { ListCard } from '../common/list/ListCard';
import type { FeedSurveyCardProps } from './FeedSurveyInner';
import { FeedSurveyInner, feedSurveyCardStyle } from './FeedSurveyInner';

export function FeedSurveyList(props: FeedSurveyCardProps): ReactElement {
  return (
    <ListCard
      data-testid="feedSurveyCard"
      className="p-4"
      style={feedSurveyCardStyle}
    >
      <FeedSurveyInner {...props} />
    </ListCard>
  );
}
