import React from 'react';
import type { ReactElement } from 'react';
import { useActions } from '../../../../hooks';
import { BriefCard } from './BriefCard';
import { ActionType } from '../../../../graphql/actions';
import { useAuthContext } from '../../../../contexts/AuthContext';

export const BriefCardFeed = (): ReactElement => {
  const { checkHasCompleted } = useActions();
  const { user } = useAuthContext();

  if (!user?.isTeamMember && checkHasCompleted(ActionType.GeneratedBrief)) {
    return null;
  }

  return <BriefCard />;
};
