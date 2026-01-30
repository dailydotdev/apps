import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { LeaderboardListContainer } from './LeaderboardListContainer';
import type { LeaderboardListContainerProps } from './common';
import { ElementPlaceholder } from '../../ElementPlaceholder';

export interface CommonLeaderboardProps<T extends Iterable<unknown>>
  extends Omit<LeaderboardListProps, 'children'> {
  items: T;
}

export interface LeaderboardListProps {
  containerProps: Omit<LeaderboardListContainerProps, 'children'>;
  isLoading: boolean;
  children: ReactNode;
  concatScore?: boolean;
}

const LeaderboardPlaceholderItem = (): ReactElement => (
  <li>
    <div className="flex w-full flex-row items-center rounded-8 px-2">
      {/* Score placeholder - matches LeaderboardListItem span (min-w-14) */}
      <ElementPlaceholder className="inline-flex h-4 min-w-14 justify-center rounded-6" />
      {/* Emoji placeholder - matches UserTopList emoji span (min-w-8 pl-1) */}
      <ElementPlaceholder className="h-6 w-6 min-w-8 rounded-6 pl-1" />
      {/* UserHighlight wrapper equivalent (p-2) */}
      <div className="flex min-w-0 flex-shrink flex-row items-center p-2">
        {/* Profile image placeholder */}
        <ElementPlaceholder className="h-8 w-8 rounded-10" />
        {/* Text content placeholder (ml-2) */}
        <div className="ml-2 flex flex-1 flex-col gap-1">
          <ElementPlaceholder className="h-3 w-24 rounded-6" />
          <ElementPlaceholder className="h-2.5 w-16 rounded-6" />
        </div>
      </div>
    </div>
  </li>
);

export function LeaderboardList({
  containerProps,
  isLoading,
  children,
}: LeaderboardListProps): ReactElement {
  return (
    <LeaderboardListContainer {...containerProps}>
      {isLoading &&
        /* eslint-disable-next-line react/no-array-index-key */
        [...Array(10)].map((_, i) => <LeaderboardPlaceholderItem key={i} />)}
      {children}
    </LeaderboardListContainer>
  );
}
