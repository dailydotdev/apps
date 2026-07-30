import type { ReactElement } from 'react';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { ArticleList } from '../../../components/cards/article/ArticleList';
import { CollectionList } from '../../../components/cards/collection/CollectionList';
import Markdown from '../../../components/Markdown';
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
import { AiIcon, ArrowIcon, TimerIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { DateFormat } from '../../../components/utilities/DateFormat';
import { TimeFormatType } from '../../../lib/dateFormat';
import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
import type { AgentBlock, AgentMessage } from '../chat';
import { useAgent } from '../AgentContext';
import { AgentPickList } from './AgentPickList';

const ArticlePostModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "articlePostModal" */ '../../../components/modals/ArticlePostModal'
    ),
);
const CollectionPostModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "collectionPostModal" */ '../../../components/modals/CollectionPostModal'
    ),
);

const noop = () => undefined;

const PendingBubble = (): ReactElement => (
  <FlexRow className="items-center gap-1.5 py-2">
    {[0, 150, 300].map((delay) => (
      <span
        key={delay}
        className="size-2 animate-bounce rounded-6 bg-text-quaternary"
        style={{ animationDelay: `${delay}ms` }}
      />
    ))}
  </FlexRow>
);

const BlockRenderer = ({
  block,
  onPostClick,
}: {
  block: AgentBlock;
  onPostClick: (post: Post) => void;
}): ReactElement => {
  if (block.type === 'text') {
    return <Markdown content={block.html} />;
  }

  if (block.type === 'feedLink') {
    return (
      <Button
        size={ButtonSize.Small}
        variant={ButtonVariant.Float}
        icon={<ArrowIcon className="rotate-90" />}
        className="w-fit"
        onClick={noop}
      >
        {block.label}
      </Button>
    );
  }

  if (block.type === 'picks') {
    return (
      <FlexCol className="gap-2">
        {block.caption && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {block.caption}
          </Typography>
        )}
        <AgentPickList posts={block.posts} onOpen={onPostClick} />
      </FlexCol>
    );
  }

  if (block.type === 'collection') {
    return (
      <CollectionList
        post={block.post}
        onPostClick={(post, event) => {
          event?.preventDefault();
          onPostClick(post);
        }}
        onUpvoteClick={noop}
        onDownvoteClick={noop}
        onCommentClick={noop}
        onBookmarkClick={noop}
        onCopyLinkClick={noop}
        onShare={noop}
      />
    );
  }

  return (
    <FlexCol className="gap-2">
      {block.caption && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {block.caption}
        </Typography>
      )}
      {block.posts.map((post) => (
        <ArticleList
          key={post.id}
          post={post}
          onPostClick={(clicked, event) => {
            event?.preventDefault();
            onPostClick(clicked);
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
};

const MessageRow = ({
  message,
  onPostClick,
}: {
  message: AgentMessage;
  onPostClick: (post: Post) => void;
}): ReactElement => {
  if (message.role === 'user') {
    return (
      <FlexCol className="items-end gap-1">
        <div className="max-w-[85%] rounded-16 rounded-br-4 bg-surface-float px-4 py-3 tablet:max-w-[32rem]">
          <Typography type={TypographyType.Callout}>{message.text}</Typography>
        </div>
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Quaternary}
        >
          <DateFormat date={message.at} type={TimeFormatType.Post} />
        </Typography>
      </FlexCol>
    );
  }

  return (
    <FlexRow className="items-start gap-3">
      <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-10 bg-action-bookmark-float">
        <AiIcon size={IconSize.Small} className="text-brand-default" />
      </span>
      <FlexCol className="min-w-0 flex-1 gap-3">
        <FlexRow className="items-center gap-2">
          <Typography type={TypographyType.Caption1} bold>
            Your agent
          </Typography>
          {message.isScheduled && (
            <FlexRow className="items-center gap-1 rounded-8 bg-surface-float px-2 py-0.5">
              <TimerIcon size={IconSize.XXSmall} />
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.Tertiary}
              >
                Scheduled run
              </Typography>
            </FlexRow>
          )}
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
          >
            <DateFormat date={message.at} type={TimeFormatType.Post} />
          </Typography>
        </FlexRow>
        {message.isPending ? (
          <PendingBubble />
        ) : (
          (message.blocks ?? []).map((block, index) => (
            <BlockRenderer
              // eslint-disable-next-line react/no-array-index-key
              key={`${message.id}-${index}`}
              block={block}
              onPostClick={onPostClick}
            />
          ))
        )}
      </FlexCol>
    </FlexRow>
  );
};

export const AgentChatSection = (): ReactElement => {
  const { messages } = useAgent();
  const [activePost, setActivePost] = useState<Post>();
  const isCollection = activePost?.type === PostType.Collection;
  const PostModal = isCollection ? CollectionPostModal : ArticlePostModal;

  return (
    <>
      <FlexCol className="gap-8 py-2">
        {messages.map((message) => (
          <MessageRow
            key={message.id}
            message={message}
            onPostClick={setActivePost}
          />
        ))}
      </FlexCol>
      {activePost && (
        <PostModal
          isOpen
          id={activePost.id}
          post={activePost}
          onRequestClose={() => setActivePost(undefined)}
        />
      )}
    </>
  );
};
