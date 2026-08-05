import type { ReactElement, ReactNode } from 'react';
import React from 'react';
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
import { PostContent } from '../../../components/post/PostContent';
import { ArticleList } from '../../../components/cards/article/ArticleList';
import { ArticleGrid } from '../../../components/cards/article/ArticleGrid';
import { useNarrowContainer } from '../hooks/useNarrowContainer';
import { Origin } from '../../../lib/log';
import type { Post } from '../../../graphql/posts';
import { useKeyboardNavigation } from '../../../hooks/useKeyboardNavigation';
import { useViewSize, ViewSize } from '../../../hooks';
import type { AgentContentTarget } from '../AgentContext';
import { contentTargetId, useAgent } from '../AgentContext';
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
  post: <DocsIcon size={IconSize.XXSmall} />,
  feed: <BulletListIcon size={IconSize.XXSmall} />,
  activity: <TimerIcon size={IconSize.XXSmall} />,
  debug: <TerminalIcon size={IconSize.XXSmall} />,
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

const FeedView = ({
  posts,
  onOpenPost,
}: {
  posts: Post[];
  onOpenPost: (post: Post) => void;
}): ReactElement => {
  const { ref, isNarrow } = useNarrowContainer<HTMLDivElement>();

  return (
    <FlexCol ref={ref} className={classNames('gap-2 py-4', postPageGutter)}>
      {posts.map((post) => {
        const CardComponent = isNarrow ? ArticleGrid : ArticleList;

        return (
          <CardComponent
            key={post.id}
            post={post}
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
            onShare={noop}
          />
        );
      })}
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
  onWidthChange: (width: number) => void;
  onWidthCommit: () => void;
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
  } = useAgent();
  const isLaptop = useViewSize(ViewSize.Laptop);
  useKeyboardNavigation(globalThis?.window, [
    ['Escape', () => activeContentId && closeContent(activeContentId)],
  ]);

  const onResizeStart = (event: React.PointerEvent) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = width;

    const onMove = (moveEvent: PointerEvent) =>
      onWidthChange(startWidth - (moveEvent.clientX - startX));

    const onUp = () => {
      globalThis.removeEventListener('pointermove', onMove);
      globalThis.removeEventListener('pointerup', onUp);
      document.body.style.removeProperty('user-select');
      document.body.style.removeProperty('cursor');
      onWidthCommit();
    };

    document.body.style.setProperty('user-select', 'none');
    document.body.style.setProperty('cursor', 'col-resize');
    globalThis.addEventListener('pointermove', onMove);
    globalThis.addEventListener('pointerup', onUp);
  };

  return (
    <aside
      className="absolute inset-0 z-modal flex flex-col bg-background-default laptop:relative laptop:inset-auto laptop:z-0 laptop:h-full laptop:shrink-0 laptop:border-l laptop:border-border-subtlest-tertiary"
      style={isLaptop ? { width } : undefined}
      aria-label="Agent content panel"
    >
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel"
        onPointerDown={onResizeStart}
        className="group absolute inset-y-0 -left-1.5 z-1 hidden w-3 cursor-col-resize items-center justify-center laptop:flex"
      >
        <span className="h-10 w-1 rounded-6 bg-transparent transition-colors group-hover:bg-text-quaternary" />
      </div>

      {/* Same inset as the conversation's header, so the two 48px control rows
          start and end on the same margin. */}
      <FlexRow className="h-12 shrink-0 items-center gap-1 border-b border-border-subtlest-tertiary px-3 tablet:px-4">
        {/* Floating chips rather than a full-height strip. The active one is
            carried by the brand fill, not by a fill-versus-no-fill difference:
            that read as "slightly lighter" when three tabs were open. */}
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
                  'group flex h-8 w-fit max-w-[12rem] shrink-0 items-center gap-1.5 rounded-10 pl-2.5 pr-1.5 transition-colors',
                  isActive
                    ? 'bg-brand-float'
                    : 'bg-surface-float hover:bg-surface-hover',
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
                    isActive ? 'text-brand-default' : 'text-text-quaternary',
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
                  className={classNames(
                    'flex size-5 shrink-0 items-center justify-center rounded-6 transition-colors hover:bg-surface-hover hover:text-text-primary',
                    isActive ? 'text-text-tertiary' : 'text-text-quaternary',
                  )}
                >
                  <MiniCloseIcon size={IconSize.XXSmall} />
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
            onClick={closeAllContent}
          />
        </Tooltip>
      </FlexRow>

      <FlexCol
        className={classNames(
          'min-h-0 w-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden',
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
          <div className={classNames('py-4', postPageGutter)}>{debugPanel}</div>
        )}
      </FlexCol>
    </aside>
  );
};
