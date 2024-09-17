import React, { ReactElement } from 'react';
import { largeNumberFormat } from '../../lib/numberFormat';
import classed from '../../lib/classed';
import { LazyModal } from '../modals/common/types';
import { useLazyModal } from '../../hooks/useLazyModal';
import {
  ContentPreferenceType,
  USER_FOLLOWERS_QUERY,
  USER_FOLLOWING_QUERY,
} from '../../graphql/contentPreference';
import { RequestKey } from '../../lib/query';

const DEFAULT_USERS_PER_PAGE = 50;

export interface UserStatsProps {
  stats: {
    reputation: number;
    views: number;
    upvotes: number;
    numFollowers: number;
    numFollowing: number;
  };
  userId: string;
}

const ItemWrapper = classed('div', 'flex items-center gap-1');
const Item = ({
  stat,
  ...props
}: {
  stat: { title: string; amount: number };
  onClick?: () => void;
  className?: string;
}) => (
  <ItemWrapper {...props}>
    <b className="text-text-primary typo-subhead">
      {largeNumberFormat(stat?.amount || 0)}
    </b>
    <span className="capitalize">{stat?.title}</span>
  </ItemWrapper>
);

export function UserStats({ stats, userId }: UserStatsProps): ReactElement {
  const { openModal } = useLazyModal<
    LazyModal.UserFollowersModal | LazyModal.UserFollowingModal
  >();

  const defaultModalParams = {
    params: {
      userId,
      entity: ContentPreferenceType.User,
      first: DEFAULT_USERS_PER_PAGE,
    },
  };

  return (
    <div className="flex flex-wrap items-center text-text-tertiary typo-footnote">
      <div className="flex flex-col gap-3">
        <div className="flex flex-row gap-2">
          <Item
            stat={{ title: 'Followers', amount: stats.numFollowers }}
            className="cursor-pointer"
            onClick={() =>
              openModal({
                type: LazyModal.UserFollowersModal,
                props: {
                  requestQuery: {
                    queryKey: [RequestKey.UserFollowers, userId],
                    query: USER_FOLLOWERS_QUERY,
                    ...defaultModalParams,
                  },
                },
              })
            }
          />
          <Item
            stat={{ title: 'Following', amount: stats.numFollowing }}
            className="cursor-pointer"
            onClick={() =>
              openModal({
                type: LazyModal.UserFollowingModal,
                props: {
                  requestQuery: {
                    queryKey: [RequestKey.UserFollowing, userId],
                    query: USER_FOLLOWING_QUERY,
                    ...defaultModalParams,
                  },
                },
              })
            }
          />
        </div>
        <div className="flex flex-row gap-2">
          <Item stat={{ title: 'Reputation', amount: stats.reputation }} />
          <Item stat={{ title: 'Views', amount: stats.views }} />
          <Item stat={{ title: 'Upvotes', amount: stats.upvotes }} />
        </div>
      </div>
    </div>
  );
}
