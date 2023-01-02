import React, { ReactElement, useContext } from 'react';
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

export function SquadSelectArticle({
  form,
  modalState,
  onNext,
}: SquadStateProps): ReactElement {
  if (ModalState.SelectArticle !== modalState) return null;
  const { user } = useContext(AuthContext);
  const key = ['readHistory', user?.id];
  const queryProps = {
    key,
    query: READING_HISTORY_QUERY,
  };
  const { data, isInitialLoading, isLoading } =
    useInfiniteReadingHistory(queryProps);

  return (
    <Modal.Body>
      <SquadTitle>
        Select one <SquadTitleColor>article.</SquadTitleColor>
      </SquadTitle>
      <p className="py-4 text-center">
        Make your squad aware of your reading history by sharing one article
        with them
      </p>

      {data?.pages.map((page) =>
        page.readHistory.edges.map((edge) => (
          <button
            key={edge.node.post.id}
            type="button"
            className="-mx-6 hover:bg-theme-hover cursor-pointer"
            onClick={() => onNext({ ...(form as SquadForm), post: edge.node })}
          >
            <PostItemCard
              postItem={edge.node}
              showButtons={false}
              clickable={false}
            />
          </button>
        )),
      )}
      {isLoading && (
        <ReadingHistoryPlaceholder amount={isInitialLoading ? 15 : 1} />
      )}
    </Modal.Body>
  );
}
