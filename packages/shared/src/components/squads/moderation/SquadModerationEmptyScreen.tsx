import type { ReactElement } from 'react';
import React from 'react';
import { VIcon } from '../../icons';
import type { Squad } from '../../../graphql/sources';
import { SourcePermissions } from '../../../graphql/sources';
import { SquadEmptyScreen } from './SquadEmptyScreen';
import { ElementPlaceholder } from '../../ElementPlaceholder';
import { verifyPermission } from '../../../graphql/squads';

const ModerationItemSkeleton = () => (
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

export const EmptyModerationList = ({
  squad,
  isFetched,
}: {
  squad: Squad;
  isFetched: boolean;
}): ReactElement => {
  const isModerator = verifyPermission(squad, SourcePermissions.ModeratePost);

  if (!isFetched || !squad) {
    return (
      <div className="flex flex-col gap-4">
        <ModerationItemSkeleton />
        <ModerationItemSkeleton />
      </div>
    );
  }

  return (
    <SquadEmptyScreen
      Icon={VIcon}
      title="All done!"
      description={
        isModerator
          ? 'All caught up! There are no posts waiting for your review right now.'
          : 'All caught up! No posts are pending'
      }
    />
  );
};
