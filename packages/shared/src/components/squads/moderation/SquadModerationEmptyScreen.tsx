import type { ReactElement } from 'react';
import React from 'react';
import { ElementPlaceholder } from '../../ElementPlaceholder';
import { cloudinaryCharmReadLater } from '../../../lib/image';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '../../charm/CharmEmptyState';

const ModerationItemSkeleton = () => (
  <div className="flex w-full flex-col gap-3 border-b border-border-subtlest-tertiary px-4 py-4 tablet:px-6">
    <span className="flex flex-row items-center gap-3">
      <ElementPlaceholder className="size-10 rounded-12" />
      <div className="flex flex-col gap-2">
        <ElementPlaceholder className="h-3 w-32 rounded-12" />
        <ElementPlaceholder className="h-3 w-48 rounded-12" />
      </div>
    </span>
    <ElementPlaceholder className="h-4 w-2/3 rounded-12" />
    <ElementPlaceholder className="h-16 w-full rounded-12" />
    <div className="flex flex-row gap-2 tablet:justify-end">
      <ElementPlaceholder className="h-8 flex-1 rounded-10 tablet:w-24 tablet:flex-none" />
      <ElementPlaceholder className="h-8 flex-1 rounded-10 tablet:w-24 tablet:flex-none" />
    </div>
  </div>
);

interface EmptyModerationListProps {
  isModerator: boolean;
  isFetched: boolean;
  /** A filtered queue explains what would show up in it. */
  title?: string;
  description?: string;
}

export const EmptyModerationList = ({
  isFetched,
  isModerator,
  title = 'All caught up',
  description,
}: EmptyModerationListProps): ReactElement => {
  if (!isFetched) {
    return (
      <div className="flex flex-col">
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
      title={title}
      description={
        description ??
        (isModerator
          ? 'No posts are waiting for your review right now.'
          : 'None of your posts are waiting for review.')
      }
    />
  );
};
