import React, { ReactElement, useMemo } from 'react';
import { Button } from '../../buttons/Button';
import { ButtonVariant, ButtonSize } from '../../buttons/common';
import { VIcon } from '../../icons';
import { useSourceModerationList } from '../../../hooks/squads/useSourceModerationList';
import { useSquadPendingPosts } from '../../../hooks/squads/useSquadPendingPosts';
import { SquadModerationItem } from './SquadModerationItem';
import { SourcePermissions, Squad } from '../../../graphql/sources';
import InfiniteScrolling from '../../containers/InfiniteScrolling';
import { verifyPermission } from '../../../graphql/squads';
import { EmptyModerationList } from './SquadModerationEmptyScreen';

interface SquadModerationListProps {
  squad: Squad;
}

export function SquadModerationList({
  squad,
}: SquadModerationListProps): ReactElement {
  const moderate = useSourceModerationList({
    squad,
  });
  const { data, isFetched, fetchNextPage, hasNextPage, isPending } =
    useSquadPendingPosts(squad?.id);
  const isModerator = verifyPermission(squad, SourcePermissions.ModeratePost);

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
              moderate.onApprove(
                list.map((request) => request.id),
                squad.id,
              )
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
            onReject={() => moderate.onReject(item.id, squad.id)}
            onApprove={() => moderate.onApprove([item.id], squad.id)}
          />
        ))}
      </InfiniteScrolling>
    </div>
  );
}
