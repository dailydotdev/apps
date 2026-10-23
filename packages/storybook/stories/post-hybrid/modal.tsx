import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import ArticlePostModal from '@dailydotdev/shared/src/components/modals/ArticlePostModal';
import SharePostModal from '@dailydotdev/shared/src/components/modals/SharePostModal';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { ModalSize } from '@dailydotdev/shared/src/components/modals/common/types';
import styles from '@dailydotdev/shared/src/components/modals/BasePostModal.module.css';
import PostNavigation from '@dailydotdev/shared/src/components/post/PostNavigation';
import { PostPosition } from '@dailydotdev/shared/src/hooks/usePostModalNavigation';
import usePostContent from '@dailydotdev/shared/src/hooks/usePostContent';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { ActivePostContextProvider } from '@dailydotdev/shared/src/contexts/ActivePostContext';
import { ColumnMode, FocusColumn } from './focusColumn';
import { HybridRail } from './rail';
import { InlineAd } from './inlineAd';
import { ShellSidebar } from './page';
import { Viewer } from './providers';
import { Version } from './versions';

const noop = (): void => undefined;

// react-modal hides the app root from screen readers while open, and the
// shared Modal points it at Next's root, which Storybook doesn't have.
if (typeof document !== 'undefined' && !document.getElementById('__next')) {
  const root = document.createElement('div');
  root.id = '__next';
  document.body.appendChild(root);
}

/** The feed the modal opened from, dimmed behind the overlay. */
const FeedBehind = (): ReactElement => (
  <div className="flex min-h-screen w-full bg-background-default">
    <ShellSidebar />
    <div className="grid flex-1 grid-cols-1 gap-6 p-6 tablet:grid-cols-2 laptop:grid-cols-3 laptopL:grid-cols-4">
      {Array.from({ length: 12 }, (_, index) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="flex h-96 flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4"
        >
          <div className="h-8 w-24 rounded-10 bg-surface-float" />
          <div className="h-4 w-full rounded-6 bg-surface-float" />
          <div className="h-4 w-2/3 rounded-6 bg-surface-float" />
          <div className="mt-auto h-40 w-full rounded-12 bg-surface-float" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * BasePostModal's shell with the redesign's two modal fixes: the strip with
 * previous, next and close stays pinned to the top of the modal's scroll
 * area, and the card clips rather than hides its overflow, so the floating
 * action bar can stick.
 */
// Past the card's header row, the strip takes over its actions.
const STRIP_ACTIONS_AFTER_PX = 140;

const ModalShell = ({
  post,
  size,
  stripActions = false,
  children,
}: {
  post: Post;
  size: ModalSize;
  /** Read post, copy link and "…" in the strip once the header scrolls away. */
  stripActions?: boolean;
  children: ReactNode;
}): ReactElement => {
  const [overlay, setOverlay] = useState<HTMLDivElement | null>(null);
  const [hasScrolledPastHeader, setHasScrolledPastHeader] = useState(false);
  const { onReadArticle } = usePostContent({
    origin: Origin.ArticleModal,
    post,
  });

  useEffect(() => {
    if (!overlay || !stripActions) {
      return undefined;
    }
    const onScroll = () =>
      setHasScrolledPastHeader(overlay.scrollTop > STRIP_ACTIONS_AFTER_PX);
    overlay.addEventListener('scroll', onScroll, { passive: true });
    return () => overlay.removeEventListener('scroll', onScroll);
  }, [overlay, stripActions]);

  return (
    <ActivePostContextProvider post={post}>
      <Modal
        isOpen
        size={size}
        kind={Modal.Kind.FlexibleTop}
        portalClassName={styles.postModal}
        id="post-modal"
        onRequestClose={noop}
        overlayRef={setOverlay}
        overlayClassName="post-modal-overlay bg-overlay-quaternary-onion"
        className="mx-auto !overscroll-y-auto !bg-background-default focus:outline-none tablet:h-full tablet:!h-auto laptop:!mt-2 laptop:h-auto laptop:!overflow-clip"
      >
        <PostNavigation
          className={{
            container: 'sticky top-0 z-postNavigation px-4',
            actions: classNames(
              'transition-opacity duration-150',
              !hasScrolledPastHeader && 'invisible opacity-0',
            ),
          }}
          postPosition={PostPosition.Middle}
          onPreviousPost={noop}
          onNextPost={noop}
          onClose={noop}
          {...(stripActions && {
            post,
            onReadArticle,
            inlineActions: true,
            isFixedNavigation: true,
          })}
        />
        {children}
      </Modal>
    </ActivePostContextProvider>
  );
};

/**
 * The hybrid in the post modal: production's 69.25rem modal keeps its
 * sidebar, now beside the redesign's column, split by the same divider the
 * classic modal draws.
 */
const HybridPostModal = ({ post }: { post: Post }): ReactElement => (
  <ModalShell post={post} size={ModalSize.XLarge} stripActions>
    <div className="flex w-full flex-col laptop:flex-row">
      <div className="flex min-w-0 flex-1 flex-col">
        <FocusColumn post={post} isModal />
      </div>
      <aside className="flex w-full flex-col gap-4 border-t border-border-subtlest-tertiary px-4 py-6 tablet:px-6 laptop:w-80 laptop:shrink-0 laptop:border-l laptop:border-t-0 laptop:px-4">
        <HybridRail post={post} />
      </aside>
    </div>
  </ModalShell>
);

/** The redesign's modal as it shipped: 47.875rem, no sidebar. */
const RedesignPostModal = ({
  post,
  viewer,
}: {
  post: Post;
  viewer: Viewer;
}): ReactElement => (
  <ModalShell post={post} size={ModalSize.Large}>
    <FocusColumn
      post={post}
      mode={ColumnMode.Redesign}
      isModal
      inlineAd={
        viewer !== Viewer.Plus && (
          <InlineAd postId={post.id} source={post.source} />
        )
      }
    />
  </ModalShell>
);

/** Production's modal today, exactly as the feed opens it. */
const ClassicPostModal = ({ post }: { post: Post }): ReactElement => {
  const isShare = [PostType.Share, PostType.Freeform].includes(post.type);
  const Component = isShare ? SharePostModal : ArticlePostModal;

  return (
    <Component
      id={post.id}
      isOpen
      post={post}
      onRequestClose={noop}
      onPreviousPost={noop}
      onNextPost={noop}
      postPosition={PostPosition.Middle}
    />
  );
};

export const PostModal = ({
  version,
  post,
  viewer,
}: {
  version: Version;
  post: Post;
  viewer: Viewer;
}): ReactElement => {
  let modal: ReactElement;
  if (version === Version.Classic) {
    modal = <ClassicPostModal post={post} />;
  } else if (version === Version.Redesign) {
    modal = <RedesignPostModal post={post} viewer={viewer} />;
  } else {
    modal = <HybridPostModal post={post} />;
  }

  return (
    <>
      <FeedBehind />
      {modal}
    </>
  );
};
