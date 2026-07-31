import type { ReactElement } from 'react';
import React from 'react';
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
import { Origin } from '../../../lib/log';
import type { Post } from '../../../graphql/posts';
import { useKeyboardNavigation } from '../../../hooks/useKeyboardNavigation';
import type { AgentContentTarget } from '../AgentContext';
import { useAgent } from '../AgentContext';

const noop = () => undefined;

const FeedView = ({
  posts,
  onOpenPost,
}: {
  posts: Post[];
  onOpenPost: (post: Post) => void;
}): ReactElement => (
  <FlexCol className="gap-2 p-4">
    {posts.map((post) => (
      <ArticleList
        key={post.id}
        post={post}
        onPostClick={(clicked, event) => {
          event?.preventDefault();
          onOpenPost(clicked);
        }}
        onUpvoteClick={noop}
        onDownvoteClick={noop}
        onCommentClick={noop}
        onBookmarkClick={noop}
        onCopyLinkClick={noop}
        onShare={noop}
      />
    ))}
  </FlexCol>
);

export const AgentContentPane = ({
  content,
  onClose,
}: {
  content: AgentContentTarget;
  onClose: () => void;
}): ReactElement => {
  const { setActiveContent } = useAgent();
  useKeyboardNavigation(globalThis?.window, [['Escape', onClose]]);
  const isPost = content.type === 'post';

  return (
    <aside
      className="fixed inset-x-0 bottom-0 z-modal flex h-2/3 flex-col overflow-hidden rounded-t-16 border-t border-border-subtlest-tertiary bg-background-default shadow-3 laptop:sticky laptop:inset-x-auto laptop:bottom-auto laptop:top-[7.5rem] laptop:z-0 laptop:h-[calc(100vh-8.5rem)] laptop:w-[24rem] laptop:shrink-0 laptop:rounded-16 laptop:border laptop:shadow-none laptopL:w-[28rem]"
      aria-label="Agent content preview"
    >
      <FlexRow className="items-center gap-2 border-b border-border-subtlest-tertiary px-4 py-3">
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
          className="ml-auto shrink-0"
        >
          {isPost ? content.post.source?.name : `${content.posts.length} posts`}
        </Typography>
        <CloseButton size={ButtonSize.Small} onClick={onClose} />
      </FlexRow>

      <FlexCol className="min-h-0 flex-1 overflow-y-auto [&_aside]:!w-full [&_aside]:!max-w-full [&_aside]:!border-l-0 [&_aside]:!px-4 [&_main]:!border-r-0 [&_main]:!px-4">
        {isPost ? (
          <PostContent
            post={content.post}
            origin={Origin.ArticleModal}
            position="relative"
            inlineActions
            onClose={onClose}
            className={{
              container: 'w-full !max-w-none !flex-col',
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
