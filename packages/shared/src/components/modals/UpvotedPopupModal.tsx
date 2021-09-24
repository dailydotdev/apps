import React, { ReactElement } from 'react';
import request from 'graphql-request';
import {
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from 'react-query';
import { ResponsiveModal } from './ResponsiveModal';
import { ModalProps } from './StyledModal';
import { ModalCloseButton } from './ModalCloseButton';
import { UpvoterList } from '../profile/UpvoterList';
import {
  UpvoterListPlaceholder,
  UpvoterListPlaceholderProps,
} from '../profile/UpvoterListPlaceholder';
import { apiUrl } from '../../lib/config';
import { Connection, HasConnection, Upvote } from '../../graphql/common';

export interface RequestQueryParams {
  [key: string]: unknown;
  first: number;
}

export interface RequestQuery<
  TConnection extends HasConnection<Upvote, TKey>,
  TKey extends keyof Connection<Upvote>,
> {
  resultKey: TKey;
  queryKey: QueryKey;
  query: string;
  params?: RequestQueryParams;
  options?: UseInfiniteQueryOptions<TConnection>;
}

export interface UpvotedPopupModalProps<
  TConnection extends HasConnection<Upvote, TKey>,
  TKey extends keyof Connection<Upvote>,
> extends ModalProps {
  listPlaceholderProps: UpvoterListPlaceholderProps;
  requestQuery: RequestQuery<TConnection, TKey>;
}

export function UpvotedPopupModal<
  TConnection extends HasConnection<Upvote, TKey>,
  TKey extends keyof Connection<Upvote>,
>({
  listPlaceholderProps,
  onRequestClose,
  requestQuery: { resultKey, queryKey, query, params, options = {} },
  children,
  ...modalProps
}: UpvotedPopupModalProps<TConnection, TKey>): ReactElement {
  const queryResult = useInfiniteQuery<TConnection>(
    queryKey,
    ({ pageParam }) =>
      request(`${apiUrl}/graphql`, query, { ...params, after: pageParam }),
    {
      ...options,
      getNextPageParam: (lastPage) =>
        lastPage[resultKey].pageInfo.hasNextPage &&
        lastPage[resultKey].pageInfo.endCursor,
    },
  );

  const [page] = queryResult?.data?.pages || [];

  return (
    <ResponsiveModal
      {...modalProps}
      onRequestClose={onRequestClose}
      style={{
        content: {
          padding: 0,
          maxHeight: '40rem',
          overflow: 'hidden',
        },
      }}
    >
      <header className="w-full py-4 px-6 border-b border-theme-divider-tertiary">
        <h3 className="font-bold typo-title3">Upvoted by</h3>
        <ModalCloseButton onClick={onRequestClose} />
      </header>
      <section className="w-full relative flex-shrink h-full max-h-full overflow-auto">
        {page && page[resultKey].edges.length > 0 ? (
          <UpvoterList objectKey={resultKey} queryResult={queryResult} />
        ) : (
          <UpvoterListPlaceholder {...listPlaceholderProps} />
        )}
      </section>
    </ResponsiveModal>
  );
}

export default UpvotedPopupModal;
