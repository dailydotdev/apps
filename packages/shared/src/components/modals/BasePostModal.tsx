import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Modal, ModalProps } from './common/Modal';
import styles from './BasePostModal.module.css';
import PostLoadingSkeleton from '../post/PostLoadingSkeleton';
import { PostType } from '../../graphql/posts';

interface BasePostModalProps extends ModalProps {
  postType: PostType;
  isLoading?: boolean;
  loadingClassName?: string;
}

function BasePostModal({
  className,
  children,
  isLoading,
  postType,
  loadingClassName,
  ...props
}: BasePostModalProps): ReactElement {
  return (
    <Modal
      size={Modal.Size.XLarge}
      kind={Modal.Kind.FlexibleTop}
      portalClassName={styles.postModal}
      id="post-modal"
      {...props}
      className={classNames(className, 'post-modal focus:outline-none')}
      overlayClassName="post-modal-overlay bg-overlay-quaternary-onion"
    >
      {isLoading ? (
        <PostLoadingSkeleton
          hasNavigation
          type={postType}
          className={loadingClassName}
        />
      ) : (
        children
      )}
    </Modal>
  );
}

export default BasePostModal;
