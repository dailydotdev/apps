import type { ReactElement } from 'react';
import React from 'react';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import type { LazyModalCommonProps } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { ModalClose } from '@dailydotdev/shared/src/components/modals/common/ModalClose';
import type { WhyRecommendedContentProps } from './WhyRecommendedContent';
import { WhyRecommendedContent } from './WhyRecommendedContent';

export type WhyRecommendedModalProps = LazyModalCommonProps &
  Omit<WhyRecommendedContentProps, 'onClose' | 'className'>;

function WhyRecommendedModal({
  post,
  feedName,
  customFeedId,
  explanation,
  onShowFewer,
  ...props
}: WhyRecommendedModalProps): ReactElement {
  const { onRequestClose } = props;

  return (
    <Modal
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      isDrawerOnMobile
      drawerProps={{
        displayCloseButton: false,
        className: { wrapper: '!px-0 !pt-0' },
      }}
      {...props}
    >
      <ModalClose top="2" right="2" onClick={onRequestClose} />
      <Modal.Body className="!p-0">
        <WhyRecommendedContent
          post={post}
          feedName={feedName}
          customFeedId={customFeedId}
          explanation={explanation}
          onShowFewer={onShowFewer}
          onClose={onRequestClose}
        />
      </Modal.Body>
    </Modal>
  );
}

export default WhyRecommendedModal;
