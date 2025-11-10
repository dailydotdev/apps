import type { ReactElement } from 'react';
import React from 'react';
import { VIcon } from '../../icons';
import { SquadEmptyScreen } from './SquadEmptyScreen';
import { ElementPlaceholder } from '../../ElementPlaceholder';

const ModerationItemSkeleton = () => (
  <div className="flex w-full flex-col gap-4 p-6">
    <span className="flex flex-row">
      <ElementPlaceholder className="h-10 w-10 rounded-full" />
      <div className="ml-4 flex flex-col gap-1">
        <ElementPlaceholder className="rounded-12 h-3 w-20" />
        <ElementPlaceholder className="rounded-12 mt-1 h-3 w-32" />
      </div>
    </span>
    <div className="flex flex-row gap-16">
      <div className="flex flex-1 flex-col gap-2">
        <ElementPlaceholder className="rounded-12 h-4 w-full" />
        <ElementPlaceholder className="rounded-12 h-4 w-2/3" />
        <span className="mt-4 flex flex-row flex-wrap gap-4">
          <ElementPlaceholder className="rounded-4 h-6 w-10" />
          <ElementPlaceholder className="rounded-4 h-6 w-10" />
          <ElementPlaceholder className="rounded-4 h-6 w-10" />
          <ElementPlaceholder className="rounded-4 h-6 w-10" />
        </span>
      </div>
      <ElementPlaceholder className="rounded-32 ml-auto h-36 w-60" />
    </div>
    <div className="flex flex-row gap-4">
      <ElementPlaceholder className="rounded-12 h-8 flex-1" />
      <ElementPlaceholder className="rounded-12 h-8 flex-1" />
    </div>
  </div>
);

export const EmptyModerationList = ({
  isFetched,
  isModerator,
}: {
  isModerator: boolean;
  isFetched: boolean;
}): ReactElement => {
  if (!isFetched || !isModerator) {
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
