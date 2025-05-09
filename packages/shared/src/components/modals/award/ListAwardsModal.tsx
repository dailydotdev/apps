import type { ReactElement } from 'react';
import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { ModalProps } from '../common/Modal';
import { checkFetchMore } from '../../containers/InfiniteScrolling';
import UserListModal from '../UserListModal';

import { FlexCentered } from '../../utilities';
import { Origin } from '../../../lib/log';
import { listAwardsInfiniteQueryOptions } from '../../../graphql/njord';
import type { PropsParameters } from '../../../types';

export interface ListAwardsModalProps extends ModalProps {
  queryProps: PropsParameters<typeof listAwardsInfiniteQueryOptions>;
}

export const ListAwardsModal = ({
  queryProps,
  children,
  ...props
}: ListAwardsModalProps): ReactElement => {
  const queryResult = useInfiniteQuery(
    listAwardsInfiniteQueryOptions(queryProps),
  );
  const { data, isFetchingNextPage, fetchNextPage } = queryResult;

  return (
    <UserListModal
      {...props}
      title="Awards"
      scrollingProps={{
        isFetchingNextPage,
        canFetchMore: checkFetchMore(queryResult),
        fetchNextPage,
      }}
      users={data?.pages.reduce((acc, p) => {
        p?.edges.forEach(({ node }) => {
          acc.push({
            ...node.user,
            award: node.award,
          });
        });

        return acc;
      }, [])}
      userListProps={{
        emptyPlaceholder: (
          <FlexCentered className="p-10 text-text-tertiary typo-callout">
            No awards found
          </FlexCentered>
        ),
      }}
      origin={Origin.AwardsList}
      showFollow={false}
      showAward
    />
  );
};
