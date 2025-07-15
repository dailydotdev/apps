import React from 'react';
import type { ReactElement } from 'react';
import { useActions } from '../../../../hooks';
import type { BriefCardProps } from './BriefCard';
import { BriefCard } from './BriefCard';
import { ActionType } from '../../../../graphql/actions';

export const BriefCardFeed = (
  props: Pick<BriefCardProps, 'targetId' | 'className'>,
): ReactElement => {
  const { checkHasCompleted, isActionsFetched } = useActions();

  if (!isActionsFetched) {
    return null;
  }

  if (checkHasCompleted(ActionType.GeneratedBrief)) {
    return null;
  }

  return <BriefCard {...props} />;
};

export default BriefCardFeed;
