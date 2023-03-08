import React, { MouseEventHandler, ReactElement, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import { READING_HISTORY_QUERY } from '../../graphql/users';
import useInfiniteReadingHistory from '../../hooks/useInfiniteReadingHistory';
import { Modal } from '../modals/common/Modal';
import PostItemCard from '../post/PostItemCard';
import {
  ModalState,
  SquadStateProps,
  SquadTitle,
  SquadTitleColor,
} from './utils';
import ReadingHistoryPlaceholder from '../history/ReadingHistoryPlaceholder';
import { ModalPropsContext } from '../modals/common/types';
import { PostItem } from '../../graphql/posts';
import { Button } from '../buttons/Button';
import { SquadForm } from '../../graphql/squads';
import InfiniteScrolling, {
  checkFetchMore,
} from '../containers/InfiniteScrolling';
import ArrowIcon from '../icons/Arrow';
import { IconSize } from '../Icon';

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
    variables: {
      isPublic: true,
    },
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

  const noDataAvailable = !hasData && !isInitialLoading;

  return (
    <>
      <Modal.Body>
        <SquadTitle>
          {noDataAvailable ? 'Read' : 'Share'}{' '}
          <SquadTitleColor>a post</SquadTitleColor>
        </SquadTitle>
        <p className="py-4 text-center">
          {noDataAvailable
            ? 'Your reading history is empty! Please read at least one post by clicking on a post to start sharing with your Squad.'
            : 'Pick a post that you would like to discuss with your Squad members.'}
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
                    className="group relative -mx-6 hover:bg-theme-hover cursor-pointer"
                    onClick={goNext(edge.node, nextStep)}
                  >
                    <PostItemCard
                      postItem={edge.node}
                      showButtons={false}
                      clickable={false}
                    />
                    <ArrowIcon
                      size={IconSize.Medium}
                      className="hidden group-hover:flex absolute top-1/2 right-3 rotate-90 -translate-y-1/2"
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
