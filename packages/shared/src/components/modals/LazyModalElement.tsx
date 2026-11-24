import type { ReactElement } from 'react';
import React from 'react';
import { useFeedbackModal, useLazyModal } from '../../hooks/useLazyModal';
import type { LazyPropTypes } from './common';
import { modals } from './common';
import { LazyModal } from './common/types';

export function LazyModalElement(): ReactElement | null {
  const { modal, closeModal } = useLazyModal();
  const { modal: feedbackModal, closeModal: closeFeedbackModal } =
    useFeedbackModal();

  if (!modal && !feedbackModal) {
    return null;
  }

  const ActiveModal = modal
    ? (modals[modal.type] as React.FC<LazyPropTypes>)
    : null;
  const FeedbackModal = modals[LazyModal.Feedback];

  return (
    <>
      {ActiveModal && (
        <ActiveModal isOpen onRequestClose={closeModal} {...modal.props} />
      )}
      {feedbackModal && (
        <FeedbackModal
          isOpen
          onRequestClose={closeFeedbackModal}
          {...feedbackModal.props}
        />
      )}
    </>
  );
}
