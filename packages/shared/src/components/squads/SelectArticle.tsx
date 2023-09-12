import React, { ReactElement, useContext } from 'react';
import { Modal } from '../modals/common/Modal';
import { ModalState, SquadStateProps } from './utils';
import ReadingHistoryPlaceholder from '../history/ReadingHistoryPlaceholder';
import { ModalPropsContext } from '../modals/common/types';
import { Button } from '../buttons/Button';
import { SquadForm } from '../../graphql/squads';
import { usePublicReadingHistory } from '../../hooks/post';
import { InfiniteReadingHistory } from '../post/infinite';
import { ReadingHistoryTitle } from '../modals/post';

export function SquadSelectArticle({
  form,
  onNext,
  onRequestClose,
}: SquadStateProps): ReactElement {
  const { activeView } = useContext(ModalPropsContext);
  if (ModalState.SelectArticle !== activeView) {
    return null;
  }

  const {
    hasData,
    isInitialLoading,
    isLoading,
    data,
    canFetchMore,
    fetchNextPage,
    isFetchingNextPage,
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/rules-of-hooks
  } = usePublicReadingHistory();

  const noDataAvailable = !hasData && !isInitialLoading;

  return (
    <>
      <Modal.Body>
        <ReadingHistoryTitle hasNoData={noDataAvailable} />
        <Modal.StepsWrapper>
          {({ nextStep }) => (
            <InfiniteReadingHistory
              onArticleClick={(e, edge) => {
                onNext({ ...(form as SquadForm), preview: edge.post });
                nextStep(e);
              }}
              data={data}
              fetchNextPage={fetchNextPage}
              canFetchMore={canFetchMore}
              isFetchingNextPage={isFetchingNextPage}
            />
          )}
        </Modal.StepsWrapper>
        {isLoading && (
          <ReadingHistoryPlaceholder amount={isInitialLoading ? 15 : 1} />
        )}
      </Modal.Body>
      {noDataAvailable && (
        <Modal.Footer>
          <Button className="btn-secondary" onClick={onRequestClose}>
            Close
          </Button>
        </Modal.Footer>
      )}
    </>
  );
}
