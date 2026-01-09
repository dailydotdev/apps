import type { ReactElement } from 'react';
import React, { useState, useCallback } from 'react';
import classNames from 'classnames';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import styles from './BasePostModal.module.css';
import PostLoadingSkeleton from '../post/PostLoadingSkeleton';
import type { Post, PostType } from '../../graphql/posts';
import type { Source } from '../../graphql/sources';
import PostNavigation from '../post/PostNavigation';
import type { PostPosition } from '../../hooks/usePostModalNavigation';
import { usePostReferrerContext } from '../../contexts/PostReferrerContext';
import { ActivePostContextProvider } from '../../contexts/ActivePostContext';
import { LogExtraContextProvider } from '../../contexts/LogExtraContext';
import { LogEvent, TargetType } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';
import { useEventListener } from '../../hooks';
import useDebounceFn from '../../hooks/useDebounceFn';

interface BasePostModalProps extends ModalProps {
  postType: PostType;
  source?: Source;
  isLoading?: boolean;
  loadingClassName?: string;
  postPosition?: PostPosition;
  onPreviousPost?: () => void;
  onNextPost?: () => void;
  post: Post;
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
  post,
  ...props
}: BasePostModalProps): ReactElement {
  const { usePostReferrer } = usePostReferrerContext();
  const { logEvent } = useLogContext();
  const [scrollNode, setScrollNode] = useState(null);

  usePostReferrer({ post });

  const onScroll = useCallback(
    (event: Event) => {
      if (!post?.id) {
        return;
      }
      const targetElement = event.target as HTMLElement;
      logEvent({
        event_name: LogEvent.PageScroll,
        target_type: TargetType.Post,
        target_id: post.id,
        extra: JSON.stringify({
          scrollTop: targetElement.scrollTop,
        }),
      });
    },
    [logEvent, post?.id],
  );

  const [debouncedOnScroll] = useDebounceFn(onScroll, 100);
  useEventListener(scrollNode, 'scroll', debouncedOnScroll);

  return (
    <ActivePostContextProvider post={post}>
      <LogExtraContextProvider
        selector={() => {
          return {
            referrer_target_id: post?.id,
            referrer_target_type: post?.id ? TargetType.Post : undefined,
          };
        }}
      >
        <Modal
          size={Modal.Size.XLarge}
          kind={Modal.Kind.FlexibleTop}
          portalClassName={styles.postModal}
          id="post-modal"
          overlayRef={setScrollNode}
          {...props}
          overlayClassName="post-modal-overlay bg-overlay-quaternary-onion"
          className={classNames(
            className,
            'laptop: mx-auto !bg-background-default focus:outline-hidden tablet:h-full laptop:h-auto laptop:overflow-hidden',
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
                onClose={props?.onRequestClose}
              />
              {children}
            </>
          )}
        </Modal>
      </LogExtraContextProvider>
    </ActivePostContextProvider>
  );
}

export default BasePostModal;
