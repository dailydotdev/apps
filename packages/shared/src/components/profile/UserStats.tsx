import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { largeNumberFormat } from '../../lib/numberFormat';
import classed from '../../lib/classed';
import { LazyModal } from '../modals/common/types';
import { useLazyModal } from '../../hooks/useLazyModal';
import { ContentPreferenceType } from '../../graphql/contentPreference';
import { ReputationIcon } from '../icons';
import { IconSize } from '../Icon';

export interface UserStatsProps {
  stats: {
    reputation: number;
    upvotes: number;
    numFollowers: number;
    numFollowing: number;
  };
  userId: string;
  className?: string;
}

// On a phone the row reads like a squad's stats: the numbers at callout
// size in a wrapping line; wider screens keep the two-column grid.
const ItemWrapper = classed('div', 'flex items-baseline gap-1');
const Item = ({
  stat,
  ...props
}: {
  stat: { title: string; amount: number };
  onClick?: () => void;
  className?: string;
}) => (
  <ItemWrapper {...props} data-testid={stat?.title}>
    <b className="tabular-nums text-text-primary typo-callout tablet:typo-subhead">
      {largeNumberFormat(stat?.amount || 0)}
    </b>
    <span className="capitalize">{stat?.title}</span>
  </ItemWrapper>
);

export function UserStats({
  stats,
  userId,
  className,
}: UserStatsProps): ReactElement {
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
    <div
      className={classNames(
        'flex flex-wrap items-center gap-x-3 gap-y-2 text-text-tertiary typo-footnote tablet:-ml-1 tablet:grid tablet:grid-cols-[auto_auto] tablet:gap-x-2 tablet:gap-y-1',
        className,
      )}
    >
      <div className="flex items-center">
        <ReputationIcon
          className="text-accent-onion-default"
          size={IconSize.Small}
        />
        <Item stat={{ title: 'Reputation', amount: stats.reputation }} />
      </div>
      <Item stat={{ title: 'Upvotes', amount: stats.upvotes }} />
      <Item
        stat={{ title: 'Followers', amount: stats.numFollowers }}
        className={classNames(
          'tablet:pl-6',
          stats.numFollowers && 'cursor-pointer',
        )}
        onClick={() => {
          if (!stats.numFollowers) {
            return;
          }

          openModal({
            type: LazyModal.UserFollowersModal,
            ...defaultModalProps,
            props: {
              ...defaultModalProps.props,
              placeholderAmount: stats.numFollowers,
            },
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
            props: {
              ...defaultModalProps.props,
              placeholderAmount: stats.numFollowing,
            },
          });
        }}
      />
    </div>
  );
}
