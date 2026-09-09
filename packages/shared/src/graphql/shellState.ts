import { gql } from 'graphql-request';
import type { Action } from './actions';
import { USER_ACTION_FRAGMENT } from './actions';
import type { Connection } from './common';
import type { Feed, TagChipSeedStrategy } from './feed';
import { FEED_LIST_CONNECTION_FRAGMENT } from './feed';
import { USER_STREAK_FRAGMENT } from './fragments';
import type { UserStreak } from './users';

export type ShellStateVariables = {
  includeTagChipFeeds: boolean;
  tagChipSeedStrategy?: TagChipSeedStrategy;
};

export type ShellStateData = {
  actions: Action[];
  userStreak: UserStreak;
  feedList: Connection<Feed>;
};

export const SHELL_STATE_QUERY = gql`
  query ShellState(
    $includeTagChipFeeds: Boolean
    $tagChipSeedStrategy: TagChipSeedStrategy
  ) {
    actions {
      ...UserAction
    }
    userStreak {
      ...UserStreakFragment
    }
    feedList(
      includeTagChipFeeds: $includeTagChipFeeds
      tagChipSeedStrategy: $tagChipSeedStrategy
    ) {
      ...FeedListConnection
    }
  }
  ${USER_ACTION_FRAGMENT}
  ${USER_STREAK_FRAGMENT}
  ${FEED_LIST_CONNECTION_FRAGMENT}
`;
