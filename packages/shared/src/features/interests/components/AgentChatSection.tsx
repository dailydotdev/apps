import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Markdown from '../../../components/Markdown';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { BulletListIcon, TimerIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { DateFormat } from '../../../components/utilities/DateFormat';
import { TimeFormatType } from '../../../lib/dateFormat';
import type { Post } from '../../../graphql/posts';
import type { AgentBlock, AgentMessage } from '../chat';
import { useAgent } from '../AgentContext';
import { AgentPickList } from './AgentPickList';
import { AgentPostCard } from './AgentPostCard';
import { AgentEmbedCard } from './blocks/AgentEmbedCard';

// The shared markdown styles are tuned for reading an article (17px on a 1.7
// leading, 24px paragraph gaps), which is far too loose at transcript density.
// Step it down to our callout token on a prose leading, scoped to the chat so
// post pages keep the reading rhythm. The shared rules are `:where()`-wrapped,
// so these class-based overrides win without `!important`.
// The `!leading-*` overrides are required, not stylistic: `typo-*` ships a
// line-height with its size, and it wins the cascade over a plain `leading-*`.
const transcriptProse = classNames(
  '[&_p]:my-3 [&_p]:!leading-relaxed [&_p]:typo-callout',
  '[&_li]:!leading-relaxed [&_li]:typo-callout [&_ol]:my-3 [&_ul]:my-3',
  '[&_h1]:mb-1.5 [&_h1]:mt-5 [&_h1]:!leading-snug [&_h1]:typo-body',
  '[&_h2]:mb-1.5 [&_h2]:mt-5 [&_h2]:!leading-snug [&_h2]:typo-body',
  '[&_h3]:mb-1.5 [&_h3]:mt-5 [&_h3]:!leading-snug [&_h3]:typo-callout',
  '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
);

const PendingBubble = (): ReactElement => (
  <FlexRow className="items-center gap-1.5 py-1">
    {[0, 150, 300].map((delay) => (
      <span
        key={delay}
        className="size-1.5 animate-bounce rounded-6 bg-text-quaternary"
        style={{ animationDelay: `${delay}ms` }}
      />
    ))}
  </FlexRow>
);

const BlockRenderer = ({
  block,
  onPostClick,
  onFeedClick,
  activePostId,
}: {
  block: AgentBlock;
  onPostClick: (post: Post) => void;
  onFeedClick: (label: string, posts: Post[]) => void;
  activePostId?: string;
}): ReactElement => {
  if (block.type === 'text') {
    return <Markdown className={transcriptProse} content={block.html} />;
  }

  if (block.type === 'feedLink') {
    return (
      <AgentEmbedCard
        icon={<BulletListIcon size={IconSize.Size16} />}
        title={block.label}
        subtitle={`Feed · ${block.posts.length} posts`}
        actionLabel="Open"
        onAction={() => onFeedClick(block.label, block.posts)}
      />
    );
  }

  if (block.type === 'picks') {
    return (
      <FlexCol className="gap-1.5">
        {block.caption && (
          <Typography
            type={TypographyType.Caption1}
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
    <FlexCol className="gap-1.5">
      {block.caption && (
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          {block.caption}
        </Typography>
      )}
      {block.posts.map((post) => (
        <AgentPostCard
          key={post.id}
          post={post}
          onOpen={onPostClick}
          isViewing={post.id === activePostId}
        />
      ))}
    </FlexCol>
  );
};

const MessageRow = ({
  message,
  onPostClick,
  onFeedClick,
  activePostId,
}: {
  message: AgentMessage;
  onPostClick: (post: Post) => void;
  onFeedClick: (label: string, posts: Post[]) => void;
  activePostId?: string;
}): ReactElement => {
  if (message.role === 'user') {
    return (
      <FlexCol className="items-end">
        <div className="max-w-[85%] rounded-12 rounded-br-4 bg-surface-float px-3 py-2 tablet:max-w-[30rem]">
          <Typography type={TypographyType.Callout} className="!leading-normal">
            {message.text}
          </Typography>
        </div>
      </FlexCol>
    );
  }

  // Agent turns carry no avatar or name: the right-aligned user bubbles are
  // what separates the two voices, so repeating "Your agent" on every reply is
  // noise. Only a scheduled run gets a marker, because that one arrived on its
  // own rather than as an answer.
  return (
    <FlexCol className="min-w-0 gap-2">
      {message.isScheduled && (
        <FlexRow className="items-center gap-1.5 text-text-quaternary">
          <TimerIcon size={IconSize.XXSmall} />
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
          >
            {'Scheduled run · '}
            <DateFormat date={message.at} type={TimeFormatType.Post} />
          </Typography>
        </FlexRow>
      )}
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
            activePostId={activePostId}
          />
        ))
      )}
    </FlexCol>
  );
};

export const AgentChatSection = (): ReactElement => {
  const { messages, openContentTarget, activeContent } = useAgent();
  const activePostId =
    activeContent?.type === 'post' ? activeContent.post.id : undefined;

  return (
    <FlexCol className="gap-6">
      {messages.map((message) => (
        <MessageRow
          key={message.id}
          message={message}
          onPostClick={(post) => openContentTarget({ type: 'post', post })}
          onFeedClick={(label, posts) =>
            openContentTarget({ type: 'feed', label, posts })
          }
          activePostId={activePostId}
        />
      ))}
    </FlexCol>
  );
};
