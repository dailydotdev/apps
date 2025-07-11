import React from 'react';
import type { ReactElement } from 'react';
import { useActions } from '../../../../hooks';
import { BriefCard } from './BriefCard';
import { ActionType } from '../../../../graphql/actions';

export const BriefCardFeed = (): ReactElement => {
  const { checkHasCompleted } = useActions();

  if (checkHasCompleted(ActionType.GeneratedBrief)) {
    return null;
  }

  return <BriefCard />;
};
