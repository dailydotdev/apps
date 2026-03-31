import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { LeaderboardListContainer } from './LeaderboardListContainer';
import type { LeaderboardListContainerProps } from './common';
import classed from '../../../lib/classed';
import { ElementPlaceholder } from '../../ElementPlaceholder';

export interface CommonLeaderboardProps<T extends Iterable<unknown>>
  extends Omit<LeaderboardListProps, 'children'> {
  items: T;
}

export interface LeaderboardListProps {
  containerProps: Omit<
    LeaderboardListContainerProps,
    'children' | 'footer' | 'header'
  >;
  isLoading: boolean;
  children: ReactNode;
  concatScore?: boolean;
  footer?: ReactNode;
  header?: ReactNode;
}

const PlaceholderList = classed(
  ElementPlaceholder,
  'h-[1.6875rem] my-1.5 rounded-12',
);

export function LeaderboardList({
  containerProps,
  isLoading,
  children,
  footer,
  header,
}: LeaderboardListProps): ReactElement {
  return (
    <LeaderboardListContainer
      {...containerProps}
      footer={footer}
      header={header}
    >
      {/* eslint-disable-next-line react/no-array-index-key */}
      {isLoading && [...Array(10)].map((_, i) => <PlaceholderList key={i} />)}
      {children}
    </LeaderboardListContainer>
  );
}
