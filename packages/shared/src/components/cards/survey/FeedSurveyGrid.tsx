import type { ReactElement } from 'react';
import React from 'react';
import { Card } from '../common/Card';
import type { FeedSurveyCardProps } from './FeedSurveyInner';
import { FeedSurveyInner } from './FeedSurveyInner';

export function FeedSurveyGrid(props: FeedSurveyCardProps): ReactElement {
  return (
    <Card data-testid="feedSurveyCard" className="p-4">
      <FeedSurveyInner {...props} />
    </Card>
  );
}
