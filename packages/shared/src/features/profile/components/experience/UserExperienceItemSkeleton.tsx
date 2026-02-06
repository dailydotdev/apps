import type { ReactElement } from 'react';
import React from 'react';
import { ElementPlaceholder } from '../../../../components/ElementPlaceholder';

interface UserExperienceItemSkeletonProps {
  count?: number;
}

export function UserExperienceItemSkeleton({
  count = 2,
}: UserExperienceItemSkeletonProps): ReactElement {
  return (
    <ul className="flex flex-col gap-4" aria-busy="true">
      {Array.from({ length: count }).map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={`skeleton-${index}`} className="flex flex-row gap-2">
          {/* Company logo placeholder */}
          <ElementPlaceholder className="size-8 rounded-full" />

          <div className="flex flex-1 flex-col gap-2">
            {/* Title line */}
            <ElementPlaceholder className="h-4 w-3/5 rounded-8" />
            {/* Company name line */}
            <ElementPlaceholder className="h-3 w-2/5 rounded-8" />
            {/* Date/location line */}
            <ElementPlaceholder className="h-3 w-1/3 rounded-8" />
            {/* Description lines */}
            <div className="flex flex-col gap-1 pt-1">
              <ElementPlaceholder className="h-3 w-full rounded-8" />
              <ElementPlaceholder className="h-3 w-4/5 rounded-8" />
            </div>
            {/* Skills pills */}
            <div className="flex flex-row gap-2 pt-1">
              <ElementPlaceholder className="h-6 w-16 rounded-8" />
              <ElementPlaceholder className="h-6 w-20 rounded-8" />
              <ElementPlaceholder className="h-6 w-14 rounded-8" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
