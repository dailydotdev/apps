import React from 'react';
import type { ReactElement } from 'react';
import { ActivityContainer } from '../../../../components/profile/ActivitySection';
import { ElementPlaceholder } from '../../../../components/ElementPlaceholder';

const SquadListItemSkeleton = (): ReactElement => (
  <li className="flex flex-row items-center gap-2">
    <ElementPlaceholder className="size-8 rounded-full" />
    <div className="min-w-0 flex-1">
      <ElementPlaceholder className="mb-1 h-4 w-32 rounded-4" />
      <ElementPlaceholder className="mb-1 h-3 w-20 rounded-4" />
      <ElementPlaceholder className="h-3 w-24 rounded-4" />
    </div>
  </li>
);

export const ActiveOrRecomendedSquadsSkeleton = (): ReactElement => {
  return (
    <ActivityContainer>
      <div className="flex min-h-0 flex-1 flex-col">
        <ElementPlaceholder className="h-5 w-24 rounded-4" />
        <ul className="mt-4 flex flex-col gap-2">
          <SquadListItemSkeleton />
          <SquadListItemSkeleton />
          <SquadListItemSkeleton />
        </ul>
      </div>
    </ActivityContainer>
  );
};

export default ActiveOrRecomendedSquadsSkeleton;
