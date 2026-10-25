import type { ReactElement, ReactNode } from 'react';
import React, { useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import styles from './BasePostModal.module.css';
import PostLoadingSkeleton from '../post/PostLoadingSkeleton';
import type { Post } from '../../graphql/posts';
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
import { getEngagementLogExtra } from '../../lib/engagementAds';
import { isSourceAdFree } from '../../lib/ads';
import { usePostById } from '../../hooks/usePostById';

/**
 * The fixed navigation sits inside the modal card, which is a centered flex
 * column with a 1px border, yet it is as wide as the whole card. Its
 * horizontal position is the static one, and browsers place a box that
 * overflows a centered column differently: Chromium centers it over the
 * border, Firefox starts it inside the border, 1px to the right. Pin it to the
 * start and pull it over the left border so it lines up everywhere.
 */
// Past the hybrid card's header row, the strip takes over its actions.
const HYBRID_STRIP_ACTIONS_AFTER_PX = 140;

export const postModalFixedNavigationClassName =
  'tablet:-ml-px tablet:self-start';

interface BasePostModalProps extends ModalProps {
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
   * The classic content layouts render their own action group (menu, boost,
   * collection subscribe) from laptop up, next to the source line. Set this so
   * the top strip drops its copy at that breakpoint rather than stacking a
   * second, identical set right above it. Below laptop the content hides its
   * group, so the strip stays the only home for these actions.
   */
  navigationContentOwnsActions?: boolean;
  /**
   * The post_page_hybrid modal: the strip stays pinned to the top of the
   * modal's scroll area and, once the card's header scrolls away, takes over
   * its actions (Read post, copy link and "…").
   */
  isHybrid?: boolean;
  onReadArticle?: () => void;
  loadingChildren?: ReactNode;
  post?: Post;
}

function BasePostModal({
  className,
  children,
  isLoading,
  source,
  loadingClassName,
  postPosition,
  onPreviousPost,
  onNextPost,
  navigationLeadingContent,
  navigationCustomActions,
  navigationContainerClassName,
  navigationHideSubscribeAction,
  navigationContentOwnsActions,
  isHybrid = false,
  onReadArticle,
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
  const { post: loadedPost } = usePostById({ id: post?.id ?? '' });
  const activePost = useMemo(
    () =>
      post && loadedPost?.source
        ? { ...post, source: loadedPost.source }
        : post,
    [post, loadedPost?.source],
  );

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

  const [hasScrolledPastHeader, setHasScrolledPastHeader] = useState(false);
  useEventListener(isHybrid ? scrollNode : null, 'scroll', () =>
    setHasScrolledPastHeader(
      (scrollNode?.scrollTop ?? 0) > HYBRID_STRIP_ACTIONS_AFTER_PX,
    ),
  );

  return (
    <ActivePostContextProvider post={activePost}>
      <LogExtraContextProvider
        selector={() => {
          const creative = isSourceAdFree(activePost?.source)
            ? null
            : getCreativeForTags(post?.tags || []);
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
            'mx-auto !bg-background-default focus:outline-none tablet:h-full laptop:!mt-2 laptop:h-auto',
            // A sticky strip can only travel within this box, so the hybrid
            // grows with its content and clips rather than scrolls.
            isHybrid
              ? 'tablet:!h-auto laptop:!overflow-clip'
              : 'laptop:overflow-hidden',
            '!overscroll-y-auto', // TODO: remove when fixing modal scroll issues see https://github.com/dailydotdev/daily/issues/2036
          )}
        >
          {isLoading ? (
            <>
              {loadingChildren}
              <PostLoadingSkeleton hasNavigation className={loadingClassName} />
            </>
          ) : (
            <>
              <PostNavigation
                className={{
                  container: classNames(
                    'px-4',
                    isHybrid && 'sticky top-0 z-postNavigation',
                    navigationContainerClassName,
                  ),
                  actions: classNames(
                    navigationContentOwnsActions && 'laptop:hidden',
                    isHybrid && 'transition-opacity duration-150',
                    isHybrid && !hasScrolledPastHeader && 'invisible opacity-0',
                  ),
                }}
                postPosition={postPosition}
                onPreviousPost={onPreviousPost}
                onNextPost={onNextPost}
                leadingContent={navigationLeadingContent}
                customActions={navigationCustomActions}
                hideSubscribeAction={navigationHideSubscribeAction}
                onClose={onRequestClose}
                post={post}
                {...(isHybrid && {
                  onReadArticle,
                  inlineActions: true,
                  isFixedNavigation: true,
                })}
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
