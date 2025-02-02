import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { Button } from '../../buttons/Button';
import { ButtonVariant, ButtonSize } from '../../buttons/common';
import { VIcon } from '../../icons';
import { useSourceModerationList } from '../../../hooks/squads/useSourceModerationList';
import { useSquadPendingPosts } from '../../../hooks/squads/useSquadPendingPosts';
import { SquadModerationItem } from './SquadModerationItem';
import type { Squad } from '../../../graphql/sources';
import { SourcePostModerationStatus } from '../../../graphql/squads';
import { EmptyModerationList } from './SquadModerationEmptyScreen';
import InfiniteScrolling from '../../containers/InfiniteScrolling';

interface SquadModerationListProps {
  squad: Squad;
  isModerator: boolean;
}

export function SquadModerationList({
  squad,
  isModerator,
}: SquadModerationListProps): ReactElement {
  const moderate = useSourceModerationList({
    squad,
  });

  const { data, isFetched, fetchNextPage, hasNextPage, isPending } =
    useSquadPendingPosts({
      squadId: squad?.id,
      status: isModerator
        ? [SourcePostModerationStatus.Pending]
        : [
            SourcePostModerationStatus.Pending,
            SourcePostModerationStatus.Rejected,
          ],
    });

  const list = useMemo(
    () =>
      data?.pages.flatMap((page) => page.edges).flatMap(({ node }) => node) ??
      [],
    [data],
  );

  if (!list.length) {
    return <EmptyModerationList squad={squad} isFetched={isFetched} />;
  }

  return (
    <div className="flex flex-col">
      {list.length > 1 && isModerator && (
        <span className="flex w-full flex-row justify-end border-b border-border-subtlest-tertiary px-4 py-3">
          <Button
            icon={<VIcon secondary />}
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            onClick={() =>
              moderate.onApprove(list.map((request) => request.id))
            }
          >
            Approve all {list.length} posts
          </Button>
        </span>
      )}
      <InfiniteScrolling
        canFetchMore={hasNextPage}
        isFetchingNextPage={isPending}
        fetchNextPage={fetchNextPage}
      >
        {list?.map((item) => (
          <SquadModerationItem
            key={item.id}
            squad={squad}
            data={item}
            isPending={isPending}
            onReject={() => moderate.onReject(item.id, item.source.id)}
            onApprove={() => moderate.onApprove([item.id], item.source.id)}
          />
        ))}
      </InfiniteScrolling>
    </div>
  );
}
