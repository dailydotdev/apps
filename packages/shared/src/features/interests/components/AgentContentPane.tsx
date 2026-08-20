import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import {
  BulletListIcon,
  DocsIcon,
  FeatherIcon,
  MiniCloseIcon,
  OpenLinkIcon,
  TerminalIcon,
  TimerIcon,
} from '../../../components/icons';
import Markdown from '../../../components/Markdown';
import { DateFormat } from '../../../components/utilities/DateFormat';
import { TimeFormatType } from '../../../lib/dateFormat';
import { transcriptProse } from '../prose';
import { IconSize } from '../../../components/Icon';
import type { DrawerRef } from '../../../components/drawers/Drawer';
import { Drawer, DrawerPosition } from '../../../components/drawers/Drawer';
import { PostContent } from '../../../components/post/PostContent';
import { ArticleList } from '../../../components/cards/article/ArticleList';
import { Origin } from '../../../lib/log';
import { useSharePost } from '../../../hooks/useSharePost';
import type { Post } from '../../../graphql/posts';
import { useKeyboardNavigation } from '../../../hooks/useKeyboardNavigation';
import { useViewSize, ViewSize } from '../../../hooks';
import type { AgentContentTarget, AgentSummaryPost } from '../AgentContext';
import { contentTargetId, useAgent } from '../AgentContext';
import { useNarrowContainer } from '../hooks/useNarrowContainer';
import { AgentActivitySection } from './AgentActivitySection';

const noop = () => undefined;

const keyResizeStep = 24;

const postPageGutter = 'px-4 tablet:px-6 laptop:px-8';
// `PostContent`'s article and widgets columns sit side by side on the post page
// but stack in a panel this narrow, so both are pinned to the article gutter.
const postPageGutterChildren =
  '[&_aside]:!px-4 [&_main]:!px-4 tablet:[&_aside]:!px-6 tablet:[&_main]:!px-6 laptop:[&_aside]:!px-8 laptop:[&_main]:!px-8';

const tabIcon: Record<AgentContentTarget['type'], ReactElement> = {
  post: <DocsIcon size={IconSize.Size16} />,
  feed: <BulletListIcon size={IconSize.Size16} />,
  posts: <FeatherIcon size={IconSize.Size16} />,
  activity: <TimerIcon size={IconSize.Size16} />,
  debug: <TerminalIcon size={IconSize.Size16} />,
};

const tabLabels: Partial<Record<AgentContentTarget['type'], string>> = {
  posts: 'Posts',
  activity: 'Activity',
  debug: 'Debug',
};

const tabLabel = (target: AgentContentTarget): string => {
  if (target.type === 'post') {
    return target.post.title ?? 'Post';
  }

  if (target.type === 'feed') {
    return target.label;
  }

  return tabLabels[target.type] ?? target.type;
};

const FeedView = ({
  posts,
  onOpenPost,
}: {
  posts: Post[];
  onOpenPost: (post: Post) => void;
}): ReactElement => {
  const { openSharePost } = useSharePost(Origin.Agent);
  // Measured off the container, not the viewport: the window is a desktop even
  // when the reader has dragged this panel down to 320px.
  const { ref, isNarrow } = useNarrowContainer<HTMLDivElement>();

  if (!posts.length) {
    return (
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className={classNames('py-4', postPageGutter)}
      >
        Nothing in the feed yet. Findings land here as the agent hunts.
      </Typography>
    );
  }

  return (
    <FlexCol className="agent-media-ring" ref={ref}>
      {posts.map((post) => (
        <ArticleList
          key={post.id}
          post={post}
          isNarrow={isNarrow}
          onPostClick={(clicked, event) => {
            event?.preventDefault();
            onOpenPost(clicked);
          }}
          onPostAuxClick={noop}
          onUpvoteClick={noop}
          onDownvoteClick={noop}
          onCommentClick={noop}
          onBookmarkClick={noop}
          onCopyLinkClick={noop}
          onShare={(shared) => openSharePost({ post: shared })}
        />
      ))}
    </FlexCol>
  );
};

const PostsView = ({
  posts,
  focusedPostId,
  onOpenPost,
}: {
  posts: AgentSummaryPost[];
  focusedPostId?: string;
  onOpenPost: (postId: string) => void;
}): ReactElement => {
  const shown = focusedPostId
    ? posts.filter((post) => post.id === focusedPostId)
    : posts;

  if (!shown.length) {
    return (
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        {focusedPostId
          ? 'This post is no longer available.'
          : 'No posts written yet. The agent writes one when a run finds enough worth summarizing.'}
      </Typography>
    );
  }

  return (
    <FlexCol className="gap-8">
      {shown.map((post) => (
        <FlexCol
          key={post.id}
          className="gap-2 border-b border-border-subtlest-quaternary pb-8 last:border-b-0"
        >
          {focusedPostId ? (
            <Typography type={TypographyType.Title3} bold>
              {post.title}
            </Typography>
          ) : (
            <button
              type="button"
              onClick={() => onOpenPost(post.id)}
              className="text-left"
            >
              <Typography
                type={TypographyType.Title3}
                bold
                className="hover:underline"
              >
                {post.title}
              </Typography>
            </button>
          )}
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Quaternary}
          >
            <DateFormat date={post.createdAt} type={TimeFormatType.Post} />
          </Typography>
          <Markdown
            className={transcriptProse}
            content={post.contentHtml ?? ''}
          />
        </FlexCol>
      ))}
    </FlexCol>
  );
};

export const AgentContentPane = ({
  width,
  minWidth,
  maxWidth,
  onWidthChange,
  onWidthCommit,
  debugPanel,
  summaryPosts,
}: {
  width: number;
  minWidth: number;
  maxWidth: number;
  /** Clamps the value and returns what it settled on. */
  onWidthChange: (width: number) => number;
  onWidthCommit: (width: number) => void;
  debugPanel: ReactNode;
  summaryPosts: AgentSummaryPost[];
}): ReactElement => {
  const {
    openContent,
    activeContent,
    activeContentId,
    openContentTarget,
    focusContent,
    closeContent,
    closeAllContent,
    isWorking,
  } = useAgent();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const drawerRef = useRef<DrawerRef>(null);
  const labelFor = (target: AgentContentTarget): string => {
    if (target.type === 'posts' && target.postId) {
      return (
        summaryPosts.find((post) => post.id === target.postId)?.title ?? 'Post'
      );
    }
    return tabLabel(target);
  };
  // A panel that goes away mid-drag otherwise leaves the whole app unselectable
  // under a col-resize cursor until the next full reload.
  const releaseDragRef = useRef<() => void>();

  useEffect(() => () => releaseDragRef.current?.(), []);
  useKeyboardNavigation(globalThis?.window, [
    // While a run is in flight Escape belongs to the workspace's stop control.
    [
      'Escape',
      () => !isWorking && activeContentId && closeContent(activeContentId),
    ],
  ]);

  const onResizeStart = (event: React.PointerEvent) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = width;
    // This listener closes over the props it was born with, and React is a
    // render behind by the time the pointer comes up.
    let latest = startWidth;

    const onMove = (moveEvent: PointerEvent) => {
      latest = onWidthChange(startWidth - (moveEvent.clientX - startX));
    };

    const controller = new AbortController();
    const release = () => {
      controller.abort();
      document.body.style.removeProperty('user-select');
      document.body.style.removeProperty('cursor');
      releaseDragRef.current = undefined;
    };

    const onUp = () => {
      release();
      onWidthCommit(latest);
    };

    document.body.style.setProperty('user-select', 'none');
    document.body.style.setProperty('cursor', 'col-resize');
    globalThis.addEventListener('pointermove', onMove, {
      signal: controller.signal,
    });
    globalThis.addEventListener('pointerup', onUp, {
      signal: controller.signal,
    });
    // An OS gesture takeover ends a touch drag with pointercancel and no
    // pointerup, which would leave the body unselectable under a resize cursor.
    globalThis.addEventListener('pointercancel', onUp, {
      signal: controller.signal,
    });
    releaseDragRef.current = release;
  };

  // Left widens, because left is the direction this edge moves to widen the
  // panel it belongs to.
  const onResizeKey = (event: React.KeyboardEvent) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    event.preventDefault();
    const delta = event.key === 'ArrowLeft' ? keyResizeStep : -keyResizeStep;

    onWidthCommit(onWidthChange(width + delta));
  };

  // On a phone `closeAllContent` has to run at the end of the drawer's slide,
  // not the start, or the exit animation is never seen.
  const onCloseAll = () =>
    isLaptop ? closeAllContent() : drawerRef.current?.onClose();

  const card = (
    <>
      {/* jsx-a11y models every `separator` as static, so it reads the tab stop
          and the key handler of a window splitter as mistakes. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel"
        aria-valuenow={width}
        aria-valuemin={minWidth}
        aria-valuemax={maxWidth}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        onPointerDown={onResizeStart}
        onKeyDown={onResizeKey}
        className="group absolute inset-y-0 -left-1.5 z-1 hidden w-3 cursor-col-resize items-center justify-center outline-none laptop:flex"
      >
        <span className="h-10 w-1 rounded-6 bg-transparent transition-colors group-hover:bg-text-quaternary group-focus-visible:bg-text-primary" />
      </div>

      <FlexCol className="agent-panel-surface agent-window-shadow min-h-0 flex-1 overflow-hidden laptop:rounded-16 laptop:border laptop:border-border-subtlest-tertiary">
        <FlexRow className="h-12 shrink-0 items-center gap-1 border-b border-border-subtlest-tertiary px-2">
          <FlexRow
            role="tablist"
            className="no-scrollbar min-w-0 flex-1 items-center gap-1 overflow-x-auto py-1"
          >
            {openContent.map((target) => {
              const targetId = contentTargetId(target);
              const isActive = targetId === activeContentId;

              return (
                <span
                  key={targetId}
                  className={classNames(
                    'agent-press group flex h-8 w-fit max-w-[13rem] shrink-0 items-center gap-1.5 rounded-8 pl-2 pr-1 transition-colors',
                    isActive
                      ? 'bg-surface-float'
                      : 'border border-border-subtlest-tertiary hover:bg-surface-hover',
                  )}
                >
                  <button
                    type="button"
                    role="tab"
                    aria-label={labelFor(target)}
                    aria-selected={isActive}
                    onClick={() => focusContent(targetId)}
                    className={classNames(
                      'flex h-full min-w-0 flex-1 items-center gap-1.5',
                      isActive ? 'text-text-primary' : 'text-text-tertiary',
                    )}
                  >
                    {tabIcon[target.type]}
                    <Typography
                      type={TypographyType.Caption1}
                      bold={isActive}
                      color={
                        isActive
                          ? TypographyColor.Primary
                          : TypographyColor.Tertiary
                      }
                      className="min-w-0 flex-1 truncate"
                    >
                      {labelFor(target)}
                    </Typography>
                  </button>
                  <button
                    type="button"
                    aria-label={`Close ${labelFor(target)}`}
                    onClick={() => closeContent(targetId)}
                    className="flex size-5 shrink-0 items-center justify-center rounded-6 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
                  >
                    <MiniCloseIcon size={IconSize.Size16} />
                  </button>
                </span>
              );
            })}
          </FlexRow>
          {activeContent?.type === 'post' && (
            <Tooltip content="Open original">
              <Button
                tag="a"
                href={
                  activeContent.post.commentsPermalink ??
                  activeContent.post.permalink
                }
                target="_blank"
                rel="noopener"
                size={ButtonSize.Small}
                variant={ButtonVariant.Tertiary}
                icon={<OpenLinkIcon size={IconSize.XSmall} />}
                aria-label="Open original"
              />
            </Tooltip>
          )}
          <Tooltip content="Close panel">
            <Button
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
              icon={<MiniCloseIcon size={IconSize.XSmall} />}
              aria-label="Close panel"
              onClick={onCloseAll}
            />
          </Tooltip>
        </FlexRow>

        <FlexCol
          className={classNames(
            'agent-scroll min-h-0 w-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden',
            postPageGutterChildren,
            '[&_aside]:!w-full [&_aside]:!max-w-full [&_aside]:!border-l-0 [&_main]:!border-r-0',
          )}
        >
          {activeContent?.type === 'post' && (
            <PostContent
              key={activeContent.post.id}
              post={activeContent.post}
              origin={Origin.ArticleModal}
              position="relative"
              inlineActions
              className={{
                // PageBodyContainer draws its own laptop:border-x, which would
                // double up against the pane's border.
                container: 'w-full !max-w-none !flex-col !border-x-0',
                navigation: { actions: 'ml-auto' },
              }}
            />
          )}
          {activeContent?.type === 'feed' && (
            <FeedView
              posts={activeContent.posts}
              onOpenPost={(post) => openContentTarget({ type: 'post', post })}
            />
          )}
          {activeContent?.type === 'posts' && (
            <div className={classNames('py-4', postPageGutter)}>
              <PostsView
                posts={summaryPosts}
                focusedPostId={activeContent.postId}
                onOpenPost={(postId) =>
                  openContentTarget({ type: 'posts', postId })
                }
              />
            </div>
          )}
          {activeContent?.type === 'activity' && (
            <div className={classNames('py-4', postPageGutter)}>
              <AgentActivitySection />
            </div>
          )}
          {activeContent?.type === 'debug' && (
            <div className={classNames('py-4', postPageGutter)}>
              {debugPanel}
            </div>
          )}
        </FlexCol>
      </FlexCol>
    </>
  );

  if (!isLaptop) {
    return (
      <Drawer
        isOpen
        ref={drawerRef}
        position={DrawerPosition.Right}
        isFullScreen
        appendOnRoot
        closeOnOutsideClick={false}
        onClose={closeAllContent}
        className={{
          // The drawer's own padding would sit outside the card and show the
          // page through it.
          wrapper: '!p-0',
          drawer: 'p-0',
        }}
        aria-label="Agent content panel"
      >
        {card}
      </Drawer>
    );
  }

  return (
    <aside
      className="relative flex h-full shrink-0 flex-col p-2 pl-0"
      style={{ width }}
      aria-label="Agent content panel"
    >
      {card}
    </aside>
  );
};
