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
  MiniCloseIcon,
  OpenLinkIcon,
  TerminalIcon,
  TimerIcon,
} from '../../../components/icons';
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
import type { AgentContentTarget } from '../AgentContext';
import { contentTargetId, useAgent } from '../AgentContext';
import { useNarrowContainer } from '../hooks/useNarrowContainer';
import { AgentActivitySection } from './AgentActivitySection';

const noop = () => undefined;

// Every tab reads on the post page's own gutters, so switching between an
// article, a feed and the debug dump doesn't shift the text sideways.
const postPageGutter = 'px-4 tablet:px-6 laptop:px-8';
// `PostContent` brings its own: the article column on the ramp above, the
// widgets column on a narrower one. They sit side by side on the post page but
// stack in a panel this narrow, so both are pinned to the article column's.
const postPageGutterChildren =
  '[&_aside]:!px-4 [&_main]:!px-4 tablet:[&_aside]:!px-6 tablet:[&_main]:!px-6 laptop:[&_aside]:!px-8 laptop:[&_main]:!px-8';

const tabIcon: Record<AgentContentTarget['type'], ReactElement> = {
  post: <DocsIcon size={IconSize.Size16} />,
  feed: <BulletListIcon size={IconSize.Size16} />,
  activity: <TimerIcon size={IconSize.Size16} />,
  debug: <TerminalIcon size={IconSize.Size16} />,
};

const tabLabel = (target: AgentContentTarget): string => {
  if (target.type === 'post') {
    return target.post.title ?? 'Post';
  }

  if (target.type === 'feed') {
    return target.label;
  }

  return target.type === 'activity' ? 'Activity' : 'Debug';
};

// Always the list card, at every width. The panel is a scanning surface: grid
// cards give each post a cover image and a card's worth of height, which turns
// nine findings into a long scroll of artwork.
//
// Edge to edge, with no gutters and no gaps: the cards carry their own padding
// and their own top rule, so this reads as one continuous list the way the feed
// does on a phone, rather than a column of cards floating in a narrow trough.
const FeedView = ({
  posts,
  onOpenPost,
}: {
  posts: Post[];
  onOpenPost: (post: Post) => void;
}): ReactElement => {
  // The card's own share affordance, wired to the app's share modal rather than
  // left as a no-op the way the other feed callbacks are here.
  const { openSharePost } = useSharePost(Origin.Agent);
  // The panel is a column the reader drags, so the cards ask it how wide it is
  // rather than asking the window — which is a desktop even when this is 320px.
  const { ref, isNarrow } = useNarrowContainer<HTMLDivElement>();

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

export const AgentContentPane = ({
  width,
  onWidthChange,
  onWidthCommit,
  debugPanel,
}: {
  width: number;
  /** Clamps the value and returns what it settled on. */
  onWidthChange: (width: number) => number;
  onWidthCommit: (width: number) => void;
  debugPanel: ReactNode;
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
  // A drag holds two global listeners and two properties on `document.body`.
  // Only the pointer coming up used to take them back, so a panel that went
  // away mid-drag — a route change, Escape closing the last tab — left the whole
  // app unselectable under a col-resize cursor until the next full reload.
  const releaseDragRef = useRef<() => void>();

  useEffect(() => () => releaseDragRef.current?.(), []);
  useKeyboardNavigation(globalThis?.window, [
    // While a run is in flight Escape belongs to the stop control in the
    // workspace; closing a tab on the same keypress would double its meaning.
    [
      'Escape',
      () => !isWorking && activeContentId && closeContent(activeContentId),
    ],
  ]);

  const onResizeStart = (event: React.PointerEvent) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = width;
    // The drag keeps its own last number. Everything React knows is a render
    // behind by the time the pointer comes up, and this listener closes over
    // the props it was born with.
    let latest = startWidth;

    const onMove = (moveEvent: PointerEvent) => {
      latest = onWidthChange(startWidth - (moveEvent.clientX - startX));
    };

    // One signal takes both listeners off, whether the pointer came up or the
    // panel went away underneath the drag.
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
    // Handed to the unmount cleanup above, so the drag cannot outlive the panel.
    releaseDragRef.current = release;
  };

  // On a phone the panel is a page in its own right, so it arrives like one:
  // in from the right over the conversation, out the same way. `closeAllContent`
  // runs at the end of the slide rather than the start of it, which is the only
  // way the exit is ever seen.
  const onCloseAll = () =>
    isLaptop ? closeAllContent() : drawerRef.current?.onClose();

  const card = (
    <>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel"
        onPointerDown={onResizeStart}
        className="group absolute inset-y-0 -left-1.5 z-1 hidden w-3 cursor-col-resize items-center justify-center laptop:flex"
      >
        <span className="h-10 w-1 rounded-6 bg-transparent transition-colors group-hover:bg-text-quaternary" />
      </div>

      <FlexCol className="agent-panel-surface agent-window-shadow min-h-0 flex-1 overflow-hidden laptop:rounded-16 laptop:border laptop:border-border-subtlest-tertiary">
        {/* 8px all the way round the chips: the row is 48 tall and they are
          32, so the sides match the space above and below them. With the
          card's own 8px inset that lands the strip on the same 16px margin
          the conversation's header uses. */}
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
                    // Subtle for the ones you are not on, float for the one
                    // you are: an outline against a filled chip separates them
                    // by two properties rather than by a shade of grey.
                    isActive
                      ? 'bg-surface-float'
                      : 'border border-border-subtlest-tertiary hover:bg-surface-hover',
                  )}
                >
                  <button
                    type="button"
                    role="tab"
                    aria-label={tabLabel(target)}
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
                      {tabLabel(target)}
                    </Typography>
                  </button>
                  <button
                    type="button"
                    aria-label={`Close ${tabLabel(target)}`}
                    onClick={() => closeContent(targetId)}
                    // Every tab carries its close, on or off: one that appears
                    // only under the pointer is one you have to go looking for.
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
          // page through it; the card owns its edges here.
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
      // A window rather than a wall: a card floating in the workspace, inset on
      // every side, so the conversation stays the room and this is a thing set
      // down in it.
      className="relative flex h-full shrink-0 flex-col p-2 pl-0"
      style={{ width }}
      aria-label="Agent content panel"
    >
      {card}
    </aside>
  );
};
