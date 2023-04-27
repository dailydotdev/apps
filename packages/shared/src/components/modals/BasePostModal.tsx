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
  console.log(className);
  return (
    <Modal
      size={Modal.Size.XLarge}
      kind={Modal.Kind.FlexibleTop}
      portalClassName={styles.postModal}
      id="post-modal"
      {...props}
      overlayClassName="post-modal-overlay bg-overlay-quaternary-onion"
      className={classNames(
        className,
        'mx-auto focus:outline-none bg-theme-bg-primary',
      )}
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
