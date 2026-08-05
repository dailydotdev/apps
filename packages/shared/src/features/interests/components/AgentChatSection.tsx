import type { ReactElement } from 'react';
import React from 'react';
import { ArticleList } from '../../../components/cards/article/ArticleList';
import { ArticleGrid } from '../../../components/cards/article/ArticleGrid';
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
import type { AgentBlock, AgentMessage } from '../chat';
import { useAgent } from '../AgentContext';
import { useNarrowContainer } from '../hooks/useNarrowContainer';
import { AgentPickList } from './AgentPickList';
import { AgentViewingChip } from './AgentViewingChip';

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
  onFeedClick,
  isNarrow,
  activePostId,
}: {
  block: AgentBlock;
  onPostClick: (post: Post) => void;
  onFeedClick: (label: string, posts: Post[]) => void;
  isNarrow: boolean;
  activePostId?: string;
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
        onClick={() => onFeedClick(block.label, block.posts)}
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
        <AgentPickList
          posts={block.posts}
          onOpen={onPostClick}
          activePostId={activePostId}
        />
      </FlexCol>
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
      {block.posts.map((post) => {
        const CardComponent = isNarrow ? ArticleGrid : ArticleList;
        const isViewing = post.id === activePostId;

        return (
          <CardComponent
            key={post.id}
            post={post}
            domProps={{
              className: isViewing
                ? '!border-border-subtlest-primary !bg-surface-float'
                : undefined,
            }}
            onPostClick={(clicked, event) => {
              event?.preventDefault();
              onPostClick(clicked);
            }}
            onPostAuxClick={noop}
            onUpvoteClick={noop}
            onDownvoteClick={noop}
            onCommentClick={noop}
            onBookmarkClick={noop}
            onCopyLinkClick={noop}
            onShare={noop}
          >
            {isViewing && (
              <div className="bg-background-default/85 absolute inset-0 z-2 flex items-center justify-center rounded-16 backdrop-blur-sm">
                <AgentViewingChip />
              </div>
            )}
          </CardComponent>
        );
      })}
    </FlexCol>
  );
};

const MessageRow = ({
  message,
  onPostClick,
  onFeedClick,
  isNarrow,
  activePostId,
}: {
  message: AgentMessage;
  onPostClick: (post: Post) => void;
  onFeedClick: (label: string, posts: Post[]) => void;
  isNarrow: boolean;
  activePostId?: string;
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
              onFeedClick={onFeedClick}
              isNarrow={isNarrow}
              activePostId={activePostId}
            />
          ))
        )}
      </FlexCol>
    </FlexRow>
  );
};

export const AgentChatSection = (): ReactElement => {
  const { messages, openContentTarget, activeContent } = useAgent();
  const { ref, isNarrow } = useNarrowContainer<HTMLDivElement>();
  const activePostId =
    activeContent?.type === 'post' ? activeContent.post.id : undefined;

  return (
    <FlexCol ref={ref} className="gap-8">
      {messages.map((message) => (
        <MessageRow
          key={message.id}
          message={message}
          onPostClick={(post) => openContentTarget({ type: 'post', post })}
          onFeedClick={(label, posts) =>
            openContentTarget({ type: 'feed', label, posts })
          }
          isNarrow={isNarrow}
          activePostId={activePostId}
        />
      ))}
    </FlexCol>
  );
};
