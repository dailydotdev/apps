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

export function SquadSelectArticle({
  form,
  onNext,
}: SquadStateProps): ReactElement {
  const { activeView } = useContext(ModalPropsContext);
  if (ModalState.SelectArticle !== activeView) return null;
  const { user } = useContext(AuthContext);
  const key = ['readHistory', user?.id];
  const queryProps = {
    key,
    query: READING_HISTORY_QUERY,
  };
  const { hasData, data, isInitialLoading, isLoading } =
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
    <Modal.Body>
      <SquadTitle>
        Select one <SquadTitleColor>article.</SquadTitleColor>
      </SquadTitle>
      <p className="py-4 text-center">
        {!hasData
          ? 'Please read at least one article by clicking on a post to start sharing with your squad'
          : 'Make your squad aware of your reading history by sharing one article with them'}
      </p>
      <Modal.StepsWrapper>
        {({ nextStep }) => (
          <div>
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
          </div>
        )}
      </Modal.StepsWrapper>
      {isLoading && (
        <ReadingHistoryPlaceholder amount={isInitialLoading ? 15 : 1} />
      )}
    </Modal.Body>
  );
}
