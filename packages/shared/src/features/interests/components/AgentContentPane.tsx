import type { ReactElement } from 'react';
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
import CloseButton from '../../../components/CloseButton';
import { OpenLinkIcon } from '../../../components/icons';
import { PostContent } from '../../../components/post/PostContent';
import { ArticleList } from '../../../components/cards/article/ArticleList';
import { ArticleGrid } from '../../../components/cards/article/ArticleGrid';
import { useNarrowContainer } from '../hooks/useNarrowContainer';
import { Origin } from '../../../lib/log';
import type { Post } from '../../../graphql/posts';
import { useKeyboardNavigation } from '../../../hooks/useKeyboardNavigation';
import { useViewSize, ViewSize } from '../../../hooks';
import { useLayoutVariant } from '../../../hooks/layout/useLayoutVariant';
import type { AgentContentTarget } from '../AgentContext';
import { useAgent } from '../AgentContext';

const noop = () => undefined;

const FeedView = ({
  posts,
  onOpenPost,
}: {
  posts: Post[];
  onOpenPost: (post: Post) => void;
}): ReactElement => {
  const { ref, isNarrow } = useNarrowContainer<HTMLDivElement>();

  return (
    <FlexCol ref={ref} className="gap-2 p-4">
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
  content,
  onClose,
  width,
  onWidthChange,
  onWidthCommit,
}: {
  content: AgentContentTarget;
  onClose: () => void;
  width: number;
  onWidthChange: (width: number) => void;
  onWidthCommit: () => void;
}): ReactElement => {
  const { setActiveContent } = useAgent();
  useKeyboardNavigation(globalThis?.window, [['Escape', onClose]]);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { isV2 } = useLayoutVariant();
  const isPost = content.type === 'post';

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
      className={classNames(
        'fixed inset-x-0 bottom-0 z-modal flex h-2/3 flex-col overflow-hidden rounded-t-16 border-t border-border-subtlest-tertiary bg-background-default shadow-3 laptop:sticky laptop:inset-x-auto laptop:bottom-auto laptop:z-0 laptop:w-[24rem] laptop:shrink-0 laptop:rounded-16 laptop:border laptop:shadow-none',
        // Sit a 1rem gap below the sticky page-header strip, which itself sits
        // at a different offset per layout variant.
        isV2
          ? 'laptop:top-[5.375rem] laptop:h-[calc(100vh-6.375rem)]'
          : 'laptop:top-[8.5rem] laptop:h-[calc(100vh-9.5rem)]',
      )}
      style={isLaptop ? { width } : undefined}
      aria-label="Agent content preview"
    >
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel"
        onPointerDown={onResizeStart}
        className="group absolute inset-y-0 left-0 z-1 hidden w-3 cursor-col-resize items-center justify-center hover:bg-surface-float laptop:flex"
      >
        <span className="h-10 w-1 rounded-6 bg-border-subtlest-secondary transition-colors group-hover:bg-text-tertiary" />
      </div>
      <FlexRow className="w-full min-w-0 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary px-4 py-3">
        {isPost ? (
          <Button
            tag="a"
            href={content.post.commentsPermalink ?? content.post.permalink}
            target="_blank"
            rel="noopener"
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            icon={<OpenLinkIcon />}
          >
            Read post
          </Button>
        ) : (
          <Typography type={TypographyType.Footnote} bold className="truncate">
            {content.label}
          </Typography>
        )}
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="ml-auto min-w-0 truncate"
        >
          {isPost ? content.post.source?.name : `${content.posts.length} posts`}
        </Typography>
        <CloseButton size={ButtonSize.Small} onClick={onClose} />
      </FlexRow>

      <FlexCol className="min-h-0 w-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden [&_aside]:!w-full [&_aside]:!max-w-full [&_aside]:!border-l-0 [&_aside]:!px-4 [&_main]:!border-r-0 [&_main]:!px-4">
        {isPost ? (
          <PostContent
            post={content.post}
            origin={Origin.ArticleModal}
            position="relative"
            inlineActions
            onClose={onClose}
            className={{
              // PageBodyContainer draws its own laptop:border-x, which would
              // double up against the pane's border.
              container: 'w-full !max-w-none !flex-col !border-x-0',
              navigation: { actions: 'ml-auto' },
            }}
          />
        ) : (
          <FeedView
            posts={content.posts}
            onOpenPost={(post) => setActiveContent({ type: 'post', post })}
          />
        )}
      </FlexCol>
    </aside>
  );
};
