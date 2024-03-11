import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Modal, ModalProps } from './common/Modal';
import styles from './BasePostModal.module.css';
import PostLoadingSkeleton from '../post/PostLoadingSkeleton';
import { PostType } from '../../graphql/posts';
import { Source } from '../../graphql/sources';

interface BasePostModalProps extends ModalProps {
  postType: PostType;
  source?: Source;
  isLoading?: boolean;
  loadingClassName?: string;
}

function BasePostModal({
  className,
  children,
  isLoading,
  postType,
  source,
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
      overlayClassName="post-modal-overlay bg-overlay-quaternary-onion"
      className={classNames(
        className,
        'mx-auto !bg-background-default focus:outline-none',
      )}
    >
      {isLoading ? (
        <PostLoadingSkeleton
          hasNavigation
          type={postType}
          source={source}
          className={loadingClassName}
        />
      ) : (
        children
      )}
    </Modal>
  );
}

export default BasePostModal;
