import React, { ReactElement, useRef, useState } from 'react';
import { useInfiniteQuery } from 'react-query';
import { UpvoterList } from '../profile/UpvoterList';
import {
  UpvoterListPlaceholder,
  UpvoterListPlaceholderProps,
} from '../profile/UpvoterListPlaceholder';
import { apiUrl } from '../../lib/config';
import { RequestQuery, UpvotesData } from '../../graphql/common';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { Modal, ModalProps } from './common/Modal';

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
  const { requestMethod } = useRequestProtocol();
  const queryResult = useInfiniteQuery<UpvotesData>(
    queryKey,
    ({ pageParam }) =>
      requestMethod(
        `${apiUrl}/graphql`,
        query,
        { ...params, after: pageParam },
        { requestKey: JSON.stringify(queryKey) },
      ),
    {
      ...options,
      getNextPageParam: (lastPage) =>
        lastPage?.upvotes?.pageInfo?.hasNextPage &&
        lastPage?.upvotes?.pageInfo?.endCursor,
    },
  );

  const [page] = queryResult?.data?.pages || [];
  const container = useRef<HTMLElement>();
  const [modalRef, setModalRef] = useState<HTMLElement>();

  return (
    <Modal
      contentRef={(e) => setModalRef(e)}
      onRequestClose={onRequestClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      {...modalProps}
    >
      <Modal.Header title="Upvoted by" />
      <Modal.Body
        className="py-2 px-0"
        data-testid={`List of ${queryKey[0]} with ID ${queryKey[1]}`}
        ref={container}
      >
        {page && page.upvotes.edges.length > 0 ? (
          <UpvoterList
            queryResult={queryResult}
            scrollingContainer={container.current}
            appendTooltipTo={modalRef}
          />
        ) : (
          <UpvoterListPlaceholder {...listPlaceholderProps} />
        )}
      </Modal.Body>
    </Modal>
  );
}

export default UpvotedPopupModal;
