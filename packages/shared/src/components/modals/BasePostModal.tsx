import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import styles from './BasePostModal.module.css';
import PostLoadingSkeleton from '../post/PostLoadingSkeleton';
import type { PostType } from '../../graphql/posts';
import type { Source } from '../../graphql/sources';
import PostNavigation from '../post/PostNavigation';
import type { PostPosition } from '../../hooks/usePostModalNavigation';

interface BasePostModalProps extends ModalProps {
  postType: PostType;
  source?: Source;
  isLoading?: boolean;
  loadingClassName?: string;
  postPosition?: PostPosition;
  onPreviousPost?: () => void;
  onNextPost?: () => void;
}

function BasePostModal({
  className,
  children,
  isLoading,
  postType,
  source,
  loadingClassName,
  postPosition,
  onPreviousPost,
  onNextPost,
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
        'laptop: mx-auto !bg-background-default focus:outline-none tablet:h-full laptop:h-auto laptop:overflow-hidden',
      )}
    >
      {isLoading ? (
        <PostLoadingSkeleton
          hasNavigation
          type={postType}
          className={loadingClassName}
        />
      ) : (
        <>
          <PostNavigation
            className={{
              container: 'px-4',
            }}
            postPosition={postPosition}
            onPreviousPost={onPreviousPost}
            onNextPost={onNextPost}
          />
          {children}
        </>
      )}
    </Modal>
  );
}

export default BasePostModal;
