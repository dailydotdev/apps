import React, { ReactElement } from 'react';
import request from 'graphql-request';
import { useInfiniteQuery } from 'react-query';
import { ResponsiveModal } from './ResponsiveModal';
import { ModalProps } from './StyledModal';
import { ModalCloseButton } from './ModalCloseButton';
import { UpvoterList } from '../profile/UpvoterList';
import {
  UpvoterListPlaceholder,
  UpvoterListPlaceholderProps,
} from '../profile/UpvoterListPlaceholder';
import { apiUrl } from '../../lib/config';
import { RequestQuery, UpvotesData } from '../../graphql/common';

export interface UpvotedPopupModalProps extends ModalProps {
  listPlaceholderProps: UpvoterListPlaceholderProps;
  requestQuery: RequestQuery<UpvotesData>;
}

export function UpvotedPopupModal({
  listPlaceholderProps,
  onRequestClose,
  requestQuery: { queryKey, query, params, options = {} },
  children,
  ...modalProps
}: UpvotedPopupModalProps): ReactElement {
  const queryResult = useInfiniteQuery<UpvotesData>(
    queryKey,
    ({ pageParam }) =>
      request(`${apiUrl}/graphql`, query, { ...params, after: pageParam }),
    {
      ...options,
      getNextPageParam: (lastPage) =>
        lastPage.upvotes.pageInfo.hasNextPage &&
        lastPage.upvotes.pageInfo.endCursor,
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
      <header className="py-4 px-6 w-full border-b border-theme-divider-tertiary">
        <h3 className="font-bold typo-title3">Upvoted by</h3>
        <ModalCloseButton onClick={onRequestClose} />
      </header>
      <section
        className="overflow-auto relative flex-shrink w-full h-full max-h-full"
        data-testid={`List of ${queryKey[0]} with ID ${queryKey[1]}`}
      >
        {page && page.upvotes.edges.length > 0 ? (
          <UpvoterList queryResult={queryResult} />
        ) : (
          <UpvoterListPlaceholder {...listPlaceholderProps} />
        )}
      </section>
    </ResponsiveModal>
  );
}

export default UpvotedPopupModal;
