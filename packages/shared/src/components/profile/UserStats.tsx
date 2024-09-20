import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { largeNumberFormat } from '../../lib/numberFormat';
import classed from '../../lib/classed';
import { LazyModal } from '../modals/common/types';
import { useLazyModal } from '../../hooks/useLazyModal';
import { ContentPreferenceType } from '../../graphql/contentPreference';

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
  <ItemWrapper {...props} data-testid={stat?.title}>
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

  const defaultModalProps = {
    props: {
      queryProps: {
        id: userId,
        entity: ContentPreferenceType.User,
      },
    },
  };

  return (
    <div className="flex flex-wrap items-center text-text-tertiary typo-footnote">
      <div className="flex flex-col gap-3">
        <div className="flex flex-row gap-2">
          <Item
            stat={{ title: 'Followers', amount: stats.numFollowers }}
            className={classNames(stats.numFollowers && 'cursor-pointer')}
            onClick={() => {
              if (!stats.numFollowers) {
                return;
              }

              openModal({
                type: LazyModal.UserFollowersModal,
                ...defaultModalProps,
              });
            }}
          />
          <Item
            stat={{ title: 'Following', amount: stats.numFollowing }}
            className={classNames(stats.numFollowing && 'cursor-pointer')}
            onClick={() => {
              if (!stats.numFollowing) {
                return;
              }

              openModal({
                type: LazyModal.UserFollowingModal,
                ...defaultModalProps,
              });
            }}
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
