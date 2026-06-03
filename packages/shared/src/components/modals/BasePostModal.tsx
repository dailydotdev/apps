import type { ReactElement, ReactNode } from 'react';
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
import { useEngagementAdsContext } from '../../contexts/EngagementAdsContext';

interface BasePostModalProps extends ModalProps {
  postType: PostType;
  source?: Source;
  isLoading?: boolean;
  loadingClassName?: string;
  postPosition?: PostPosition;
  onPreviousPost?: () => void;
  onNextPost?: () => void;
  navigationLeadingContent?: ReactNode;
  navigationCustomActions?: ReactNode;
  navigationContainerClassName?: string;
  navigationHideSubscribeAction?: boolean;
  loadingChildren?: ReactNode;
  post?: Post;
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
  navigationLeadingContent,
  navigationCustomActions,
  navigationContainerClassName,
  navigationHideSubscribeAction,
  loadingChildren,
  post,
  onRequestClose,
  size = Modal.Size.XLarge,
  ...props
}: BasePostModalProps): ReactElement {
  const usePostReferrer =
    usePostReferrerContext()?.usePostReferrer ?? (() => {});
  const { logEvent } = useLogContext();
  const [scrollNode, setScrollNode] = useState<HTMLDivElement | null>(null);
  const { getCreativeForTags } = useEngagementAdsContext();

  usePostReferrer({ post });

  const onScroll = useCallback(
    (event?: Event) => {
      if (!post?.id || !event) {
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
          const creative = getCreativeForTags(post?.tags || []);
          return {
            referrer_target_id: post?.id,
            referrer_target_type: post?.id ? TargetType.Post : undefined,
            ...(creative && { gen_id: creative.genId }),
          };
        }}
      >
        <Modal
          size={size}
          kind={Modal.Kind.FlexibleTop}
          portalClassName={styles.postModal}
          id="post-modal"
          overlayRef={(node) => setScrollNode(node)}
          onRequestClose={onRequestClose}
          {...props}
          overlayClassName="post-modal-overlay bg-overlay-quaternary-onion"
          className={classNames(
            className,
            'mx-auto !bg-background-default focus:outline-none tablet:h-full laptop:!mt-2 laptop:h-auto laptop:overflow-hidden',
            '!overscroll-y-auto', // TODO: remove when fixing modal scroll issues see https://github.com/dailydotdev/daily/issues/2036
          )}
        >
          {isLoading ? (
            <>
              {loadingChildren}
              <PostLoadingSkeleton
                hasNavigation
                type={postType}
                className={loadingClassName}
              />
            </>
          ) : (
            <>
              <PostNavigation
                className={{
                  container: classNames('px-4', navigationContainerClassName),
                }}
                postPosition={postPosition}
                onPreviousPost={onPreviousPost}
                onNextPost={onNextPost}
                leadingContent={navigationLeadingContent}
                customActions={navigationCustomActions}
                hideSubscribeAction={navigationHideSubscribeAction}
                onClose={onRequestClose}
                post={post}
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
