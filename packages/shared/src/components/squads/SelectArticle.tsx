import React, { ReactElement } from 'react';
import { Modal } from '../modals/common/Modal';
import PostItemCard from '../post/PostItemCard';
import {
  ModalState,
  SquadStateProps,
  SquadTitle,
  SquadTitleColor,
} from './utils';

export function SquadSelectArticle({
  modalState,
  onNext,
}: SquadStateProps): ReactElement {
  if (ModalState.SelectArticle !== modalState) return null;
  return (
    <Modal.Body>
      <SquadTitle>
        Select one <SquadTitleColor>article.</SquadTitleColor>
      </SquadTitle>
      <p className="py-4 text-center">
        Make your squad aware of your reading history by sharing one article
        with them
      </p>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      <div onClick={() => onNext()}>
        <PostItemCard
          className="-mx-6"
          postItem={{
            post: { image: '', title: 'title', commentsPermalink: '', id: '' },
          }}
          showButtons={false}
        />
      </div>
    </Modal.Body>
  );
}
