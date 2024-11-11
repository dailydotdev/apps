import React, { ReactElement, useMemo } from 'react';
import { Button } from '../../buttons/Button';
import { ButtonVariant, ButtonSize } from '../../buttons/common';
import { VIcon } from '../../icons';
import { useSquadPostModeration } from '../../../hooks/squads/useSquadPostModeration';
import { useSquadPendingPosts } from '../../../hooks/squads/useSquadPendingPosts';
import { SquadModerationItem } from './SquadModerationItem';
import {
  SourceMemberRole,
  SourcePermissions,
  Squad,
} from '../../../graphql/sources';
import { SquadEmptyScreen } from './SquadEmptyScreen';
import { ElementPlaceholder } from '../../ElementPlaceholder';
import InfiniteScrolling from '../../containers/InfiniteScrolling';
import { verifyPermission } from '../../../graphql/squads';

const placeholder = (
  <div className="flex w-full flex-col gap-4 p-6">
    <span className="flex flex-row">
      <ElementPlaceholder className="h-10 w-10 rounded-full" />
      <div className="ml-4 flex flex-col gap-1">
        <ElementPlaceholder className="h-3 w-20 rounded-12" />
        <ElementPlaceholder className="mt-1 h-3 w-32 rounded-12" />
      </div>
    </span>
    <div className="flex flex-row gap-16">
      <div className="flex flex-1 flex-col gap-2">
        <ElementPlaceholder className="h-4 w-full rounded-12" />
        <ElementPlaceholder className="h-4 w-2/3 rounded-12" />
        <span className="mt-4 flex flex-row flex-wrap gap-4">
          <ElementPlaceholder className="h-6 w-10 rounded-4" />
          <ElementPlaceholder className="h-6 w-10 rounded-4" />
          <ElementPlaceholder className="h-6 w-10 rounded-4" />
          <ElementPlaceholder className="h-6 w-10 rounded-4" />
        </span>
      </div>
      <ElementPlaceholder className="ml-auto h-36 w-60 rounded-32" />
    </div>
    <div className="flex flex-row gap-4">
      <ElementPlaceholder className="h-8 flex-1 rounded-12" />
      <ElementPlaceholder className="h-8 flex-1 rounded-12" />
    </div>
  </div>
);

interface SquadModerationListProps {
  squad: Squad;
}

const EmptyModerationList = ({
  squad,
  isFetched,
}: {
  squad: Squad;
  isFetched: boolean;
}) => {
  if (!isFetched || !squad) {
    return (
      <div className="flex flex-col gap-4">
        {placeholder}
        {placeholder}
      </div>
    );
  }

  if (squad.currentMember.role === SourceMemberRole.Member) {
    return (
      <SquadEmptyScreen
        Icon={VIcon}
        title="All done!"
        description="All caught up! No posts are pending" // TODO:: MI-597 - check with product what to show here
      />
    );
  }

  return (
    <SquadEmptyScreen
      Icon={VIcon}
      title="All done!"
      description="All caught up! There are no posts waiting for your review right now."
    />
  );
};

export function SquadModerationList({
  squad,
}: SquadModerationListProps): ReactElement {
  const moderate = useSquadPostModeration({
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

  if (!data?.pages.length) {
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
