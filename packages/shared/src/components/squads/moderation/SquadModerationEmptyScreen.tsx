import type { ReactElement } from 'react';
import React from 'react';
import { ElementPlaceholder } from '../../ElementPlaceholder';
import { cloudinaryCharmReadLater } from '../../../lib/image';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '../../charm/CharmEmptyState';

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
  isFetched,
  isModerator,
}: {
  isModerator: boolean;
  isFetched: boolean;
}): ReactElement => {
  if (!isFetched) {
    return (
      <div className="flex flex-col gap-4">
        <ModerationItemSkeleton />
        <ModerationItemSkeleton />
      </div>
    );
  }

  return (
    <CharmEmptyState
      placement={CharmEmptyStatePlacement.Page}
      image={cloudinaryCharmReadLater}
      imageAlt="daily.dev charm kicking back with nothing to review"
      title="All caught up"
      description={
        isModerator
          ? 'No posts are waiting for your review right now.'
          : 'None of your posts are waiting for review.'
      }
    />
  );
};
