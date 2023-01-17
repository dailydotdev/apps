import React, { MouseEventHandler, ReactElement, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import { READING_HISTORY_QUERY } from '../../graphql/users';
import useInfiniteReadingHistory from '../../hooks/useInfiniteReadingHistory';
import { Modal } from '../modals/common/Modal';
import PostItemCard from '../post/PostItemCard';
import {
  ModalState,
  SquadForm,
  SquadStateProps,
  SquadTitle,
  SquadTitleColor,
} from './utils';
import ReadingHistoryPlaceholder from '../history/ReadingHistoryPlaceholder';
import { ModalPropsContext } from '../modals/common/types';
import { PostItem } from '../../graphql/posts';
import { Button } from '../buttons/Button';
import InfiniteScrolling, {
  checkFetchMore,
} from '../containers/InfiniteScrolling';

export function SquadSelectArticle({
  form,
  onNext,
  onRequestClose,
}: SquadStateProps): ReactElement {
  const { activeView } = useContext(ModalPropsContext);
  if (ModalState.SelectArticle !== activeView) return null;
  const { user } = useContext(AuthContext);
  const key = ['readHistory', user?.id];
  const queryProps = {
    key,
    query: READING_HISTORY_QUERY,
  };
  const { hasData, data, isInitialLoading, isLoading, queryResult } =
    useInfiniteReadingHistory(queryProps);
  const goNext = (
    post: PostItem,
    nextStep: MouseEventHandler,
  ): MouseEventHandler => {
    return (e) => {
      onNext({ ...(form as SquadForm), post });
      nextStep(e);
    };
  };
  return (
    <>
      <Modal.Body>
        <SquadTitle>
          {!hasData ? 'Read an' : 'Share the first'}{' '}
          <SquadTitleColor>article</SquadTitleColor>
        </SquadTitle>
        <p className="py-4 text-center">
          {!hasData
            ? 'Your reading history is empty! Please read at least one article by clicking on a post to start sharing with your Squad.'
            : 'Pick the first article that you would like to discuss with the members of your Squad.'}
        </p>
        <Modal.StepsWrapper>
          {({ nextStep }) => (
            <InfiniteScrolling
              canFetchMore={checkFetchMore(queryResult)}
              fetchNextPage={queryResult.fetchNextPage}
              isFetchingNextPage={queryResult.isFetchingNextPage}
            >
              {data?.pages.map((page) =>
                page.readHistory.edges.map((edge) => (
                  <button
                    key={edge.node.post.id}
                    type="button"
                    className="-mx-6 hover:bg-theme-hover cursor-pointer"
                    onClick={goNext(edge.node, nextStep)}
                  >
                    <PostItemCard
                      postItem={edge.node}
                      showButtons={false}
                      clickable={false}
                    />
                  </button>
                )),
              )}
            </InfiniteScrolling>
          )}
        </Modal.StepsWrapper>
        {isLoading && (
          <ReadingHistoryPlaceholder amount={isInitialLoading ? 15 : 1} />
        )}
      </Modal.Body>
      {!hasData && (
        <Modal.Footer>
          <Button className="btn-secondary" onClick={onRequestClose}>
            Close
          </Button>
        </Modal.Footer>
      )}
    </>
  );
}
