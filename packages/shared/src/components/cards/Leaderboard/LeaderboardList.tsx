import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { LeaderboardListContainer } from './LeaderboardListContainer';
import type { LeaderboardListContainerProps } from './common';
import { LeaderboardRowPlaceholder } from './LeaderboardRowPlaceholder';

export interface CommonLeaderboardProps<T extends Iterable<unknown>>
  extends Omit<LeaderboardListProps, 'children'> {
  items: T;
}

export interface LeaderboardListProps {
  containerProps: Omit<
    LeaderboardListContainerProps,
    'children' | 'footer' | 'header' | 'isLoading'
  >;
  isLoading: boolean;
  children: ReactNode;
  concatScore?: boolean;
  footer?: ReactNode;
  header?: ReactNode;
  placeholder?: ReactElement;
}

export function LeaderboardList({
  containerProps,
  isLoading,
  children,
  footer,
  header,
  placeholder = <LeaderboardRowPlaceholder />,
}: LeaderboardListProps): ReactElement {
  return (
    <LeaderboardListContainer
      {...containerProps}
      footer={footer}
      header={header}
      isLoading={isLoading}
    >
      {isLoading &&
        [...Array(10)].map((_, i) =>
          // eslint-disable-next-line react/no-array-index-key
          React.cloneElement(placeholder, { key: i }),
        )}
      {children}
    </LeaderboardListContainer>
  );
}
