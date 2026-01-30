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
  <li className="flex flex-row items-center px-2 py-1.5">
    {/* Score placeholder */}
    <ElementPlaceholder className="mr-2 h-4 w-14 rounded-6" />
    {/* Emoji placeholder */}
    <ElementPlaceholder className="ml-1 mr-2 h-6 w-6 rounded-6" />
    {/* Profile image placeholder */}
    <ElementPlaceholder className="h-8 w-8 rounded-10" />
    {/* Text content placeholder */}
    <div className="ml-2 flex flex-1 flex-col gap-1">
      <ElementPlaceholder className="h-3 w-24 rounded-6" />
      <ElementPlaceholder className="h-2.5 w-16 rounded-6" />
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
