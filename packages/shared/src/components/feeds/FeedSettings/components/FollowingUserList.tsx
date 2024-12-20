import React, { type ReactElement, useMemo } from 'react';
import Link from 'next/link';
import { useFeedSettingsEditContext } from '../FeedSettingsEditContext';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useFollowingQuery } from '../../../../hooks/contentPreference/useFollowingQuery';
import { ContentPreferenceType } from '../../../../graphql/contentPreference';
import UserList from '../../../profile/UserList';
import { FlexCentered } from '../../../utilities';
import { AddUserIcon } from '../../../icons';
import { IconSize } from '../../../Icon';
import { checkFetchMore } from '../../../containers/InfiniteScrolling';
import { Origin } from '../../../../lib/log';
import { CopyType } from '../../../sources/SourceActions/SourceActionsFollow';
import { anchorDefaultRel } from '../../../../lib/strings';

export const FollowingUserList = (): ReactElement => {
  const { user } = useAuthContext();
  const { feed } = useFeedSettingsEditContext();

  const queryResult = useFollowingQuery({
    id: user.id,
    entity: ContentPreferenceType.User,
    feedId: feed.id,
  });

  const { data, isFetchingNextPage, fetchNextPage } = queryResult;
  const users = useMemo(() => {
    return data?.pages.reduce((acc, p) => {
      p?.edges.forEach(({ node }) => {
        acc.push(node.referenceUser);
      });

      return acc;
    }, []);
  }, [data]);

  if (queryResult.isPending) {
    return null;
  }

  return (
    <UserList
      users={users}
      emptyPlaceholder={
        <FlexCentered className="flex-col gap-4 px-6 py-10 text-center text-text-tertiary typo-callout">
          <AddUserIcon size={IconSize.XXXLarge} />
          <p>
            You haven&apos;t follow any User yet.
            <br /> Explore our{' '}
            <Link
              href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}users`}
              passHref
              className="text-text-link"
            >
              Leaderboards
            </Link>{' '}
            to find and follow inspiring users!
          </p>
        </FlexCentered>
      }
      scrollingProps={{
        isFetchingNextPage,
        canFetchMore: checkFetchMore(queryResult),
        fetchNextPage,
      }}
      userInfoProps={{
        origin: Origin.FollowFilter,
        showFollow: true,
        showSubscribe: false,
        copyType: CopyType.Custom,
        feedId: feed.id,
        rel: anchorDefaultRel,
        target: '_blank',
      }}
    />
  );
};
