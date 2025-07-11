import React from 'react';
import type { ReactElement } from 'react';
import { useActions } from '../../../../hooks';
import type { BriefCardProps } from './BriefCard';
import { BriefCard } from './BriefCard';
import { ActionType } from '../../../../graphql/actions';

export const BriefCardFeed = (
  props: Pick<BriefCardProps, 'targetId'>,
): ReactElement => {
  const { checkHasCompleted } = useActions();

  if (checkHasCompleted(ActionType.GeneratedBrief)) {
    return null;
  }

  return <BriefCard {...props} />;
};
