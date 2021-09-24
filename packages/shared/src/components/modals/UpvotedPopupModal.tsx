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
import { HasUpvoteConnection, UpvoterList } from '../profile/UpvoterList';
import {
  UpvoterListPlaceholder,
  UpvoterListPlaceholderProps,
} from '../profile/UpvoterListPlaceholder';
import { apiUrl } from '../../lib/config';

export interface RequestQueryParams {
  [key: string]: unknown;
  first: number;
}

export interface RequestQuery<
  T extends HasUpvoteConnection<T, K>,
  K extends keyof T,
> {
  resultKey: K;
  queryKey: QueryKey;
  query: string;
  params?: RequestQueryParams;
  options?: UseInfiniteQueryOptions<T>;
}

export interface UpvotedPopupModalProps<
  T extends HasUpvoteConnection<T, K>,
  K extends keyof T,
> extends ModalProps {
  listPlaceholderProps: UpvoterListPlaceholderProps;
  requestQuery: RequestQuery<T, K>;
}

export function UpvotedPopupModal<
  T extends HasUpvoteConnection<T, K>,
  K extends keyof T,
>({
  listPlaceholderProps,
  onRequestClose,
  requestQuery: { resultKey, queryKey, query, params, options = {} },
  children,
  ...modalProps
}: UpvotedPopupModalProps<T, K>): ReactElement {
  const queryResult = useInfiniteQuery<T>(
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
          maxWidth: '30rem',
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
