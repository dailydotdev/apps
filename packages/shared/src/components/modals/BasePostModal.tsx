import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useState, useCallback } from 'react';
import classNames from 'classnames';
import type { ModalProps } from './common/Modal';
import { Modal, modalSizeToClassName } from './common/Modal';
import styles from './BasePostModal.module.css';
import PostLoadingSkeleton from '../post/PostLoadingSkeleton';
import type { Post, PostType } from '../../graphql/posts';
import type { Source } from '../../graphql/sources';
import PostNavigation from '../post/PostNavigation';
import FixedPostNavigation from '../post/FixedPostNavigation';
import type { PostPosition } from '../../hooks/usePostModalNavigation';
import { usePostReferrerContext } from '../../contexts/PostReferrerContext';
import { ActivePostContextProvider } from '../../contexts/ActivePostContext';
import { LogExtraContextProvider } from '../../contexts/LogExtraContext';
import { LogEvent, TargetType } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';
import { useEventListener, useViewSize, ViewSize } from '../../hooks';
import useDebounceFn from '../../hooks/useDebounceFn';
import { useEngagementAdsContext } from '../../contexts/EngagementAdsContext';
import { getEngagementLogExtra } from '../../lib/engagementAds';

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
  /**
   * Redesign top-bar behavior: hide the top strip's "…" menu (it lives in the
   * focus-card header) and, once scrolled, float a fixed bar with the post
   * stats + "…" menu + close.
   */
  navigationRedesign?: boolean;
  /**
   * Scroll state from `usePostNavigationPosition`. The classic layout feeds
   * this to `PostContent`; the redesign card has no equivalent, so the modal
   * floats the fixed bar itself once it turns `fixed`.
   */
  navigationPosition?: CSSProperties['position'];
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
  navigationRedesign,
  navigationPosition,
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

  // The redesign card renders no navigation of its own, so the strip above it
  // scrolls away with the header and takes the close button with it. Float the
  // same fixed bar the classic layout uses once scrolled past the offset.
  // Matches `PostContentContainer`, which also skips it below MobileL.
  const isMobile = useViewSize(ViewSize.MobileL);
  const showFixedNavigation =
    navigationRedesign && navigationPosition === 'fixed' && !isMobile;

  return (
    <ActivePostContextProvider post={post}>
      <LogExtraContextProvider
        selector={() => {
          const creative = getCreativeForTags(post?.tags || []);
          return {
            referrer_target_id: post?.id,
            referrer_target_type: post?.id ? TargetType.Post : undefined,
            ...(creative && getEngagementLogExtra(creative)),
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
              {showFixedNavigation && (
                <FixedPostNavigation
                  postPosition={postPosition}
                  onPreviousPost={onPreviousPost}
                  onNextPost={onNextPost}
                  hideOptions
                  onClose={onRequestClose}
                  post={post}
                  className={{
                    container: modalSizeToClassName[size],
                    actions: 'ml-auto',
                  }}
                />
              )}
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
                hideOptions={navigationRedesign}
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
