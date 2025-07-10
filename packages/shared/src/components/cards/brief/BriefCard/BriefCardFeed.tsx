import React from 'react';
import type { ReactElement } from 'react';
import { useActions } from '../../../../hooks';
import { useActiveFeedNameContext } from '../../../../contexts';
import { SharedFeedPage } from '../../../utilities';
import { BriefCard } from './BriefCard';
import { ActionType } from '../../../../graphql/actions';
import { useAuthContext } from '../../../../contexts/AuthContext';

export const BriefCardFeed = (): ReactElement => {
  const { checkHasCompleted } = useActions();
  const { feedName } = useActiveFeedNameContext();
  const { user } = useAuthContext();

  if (feedName !== SharedFeedPage.MyFeed) {
    return null;
  }

  if (!user?.isTeamMember && checkHasCompleted(ActionType.GeneratedBrief)) {
    return null;
  }

  return <BriefCard />;
};
