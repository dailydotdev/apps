import React, { ReactElement } from 'react';
import { Modal, ModalProps } from '../common/Modal';
import { InfiniteReadingHistory } from '../../post/infinite';
import { PostItem } from '../../../graphql/posts';
import { usePublicReadingHistory } from '../../../hooks/post/usePublicReadingHistory';
import { ReadingHistoryTitle } from './ReadingHistoryTitle';
import ReadingHistoryPlaceholder from '../../history/ReadingHistoryPlaceholder';

interface ReadingHistoryModalProps extends ModalProps {
  onArticleSelected: (post: PostItem) => void;
  keepOpenAfterSelecting?: boolean;
}

export function ReadingHistoryModal({
  keepOpenAfterSelecting,
  onArticleSelected,
  onRequestClose,
}: ReadingHistoryModalProps): ReactElement {
  const {
    hasData,
    isInitialLoading,
    data,
    isLoading,
    canFetchMore,
    fetchNextPage,
    isFetchingNextPage,
  } = usePublicReadingHistory();
  const noDataAvailable = !hasData && !isInitialLoading;

  const onClick = (e: React.MouseEvent, post: PostItem) => {
    onArticleSelected(post);
    if (!keepOpenAfterSelecting) onRequestClose(e);
  };

  return (
    <Modal
      isOpen
      onRequestClose={onRequestClose}
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
    >
      <Modal.Body>
        <ReadingHistoryTitle hasNoData={noDataAvailable} />
        <InfiniteReadingHistory
          onArticleClick={onClick}
          data={data}
          canFetchMore={canFetchMore}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
        {isLoading && (
          <ReadingHistoryPlaceholder amount={isInitialLoading ? 15 : 1} />
        )}
      </Modal.Body>
    </Modal>
  );
}

export default ReadingHistoryModal;
