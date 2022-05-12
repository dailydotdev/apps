import React, { ReactElement, useRef, useState } from 'react';
import { QueryKey, UseInfiniteQueryResult } from 'react-query';
import { ResponsiveModal } from './ResponsiveModal';
import { ModalProps } from './StyledModal';
import { ModalCloseButton } from './ModalCloseButton';
import { UpvoterList } from '../profile/UpvoterList';
import {
  UpvoterListPlaceholder,
  UpvoterListPlaceholderProps,
} from '../profile/UpvoterListPlaceholder';
import { UpvotesData } from '../../graphql/common';

export interface UpvotedPopupModalProps extends ModalProps {
  listPlaceholderProps: UpvoterListPlaceholderProps;
  queryResult: UseInfiniteQueryResult<UpvotesData>;
  queryKey: QueryKey;
}

export function UpvotedPopupModal({
  listPlaceholderProps,
  onRequestClose,
  queryResult,
  children,
  queryKey,
  ...modalProps
}: UpvotedPopupModalProps): ReactElement {
  const [page] = queryResult?.data?.pages || [];
  const container = useRef<HTMLElement>();
  const [modalRef, setModalRef] = useState<HTMLElement>();

  return (
    <ResponsiveModal
      {...modalProps}
      contentRef={(e) => setModalRef(e)}
      onRequestClose={onRequestClose}
      padding={false}
      style={{
        content: {
          maxHeight: '40rem',
          overflow: 'initial',
        },
      }}
    >
      <header className="flex items-center py-4 px-6 w-full border-b border-theme-divider-tertiary">
        <h3 className="font-bold typo-title3">Upvoted by</h3>
        <ModalCloseButton onClick={onRequestClose} />
      </header>
      <section
        className="overflow-auto relative w-full h-full shrink max-h-full"
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
      </section>
    </ResponsiveModal>
  );
}

export default UpvotedPopupModal;
