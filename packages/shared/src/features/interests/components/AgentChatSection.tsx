import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import Markdown from '../../../components/Markdown';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  BulletListIcon,
  CopyIcon,
  DownvoteIcon,
  ShareIcon,
  MiniCloseIcon,
  TimerIcon,
  UpvoteIcon,
  VIcon,
  WarningIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useCopyText } from '../../../hooks/useCopy';
import { DateFormat } from '../../../components/utilities/DateFormat';
import { TimeFormatType } from '../../../lib/dateFormat';
import type { Post } from '../../../graphql/posts';
import type { AgentBlock, AgentMessage } from '../chat';
import { useAgent } from '../AgentContext';
import { transcriptProse } from '../prose';
import { messageAsMarkdown, messageAsText } from '../replyText';
import { AgentShareReplyModal } from './AgentShareReplyModal';
import { feedAttachment, quoteAttachment } from '../attachments';
import { AgentPickList } from './AgentPickList';
import { AgentAttachmentChip } from './AgentAttachmentChip';
import { addToChatFloat, AgentAddToChatButton } from './AgentAddToChatButton';
import { AgentThinkingStrip } from './AgentThinkingStrip';
import { AgentPostCard } from './AgentPostCard';
import { AgentEmbedCard } from './blocks/AgentEmbedCard';

const postLinkKey = (href: string): string => {
  try {
    const url = new URL(href);
    return `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
  } catch {
    return href;
  }
};

const BlockRenderer = ({
  block,
  onPostClick,
  onFeedClick,
  resolvePostLink,
  activePostId,
}: {
  block: AgentBlock;
  onPostClick: (post: Post) => void;
  onFeedClick: (label: string, posts: Post[]) => void;
  resolvePostLink: (href: string) => Post | undefined;
  activePostId?: string;
}): ReactElement => {
  if (block.type === 'text') {
    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
      <div
        onClick={(event) => {
          const anchor = (event.target as Element).closest('a');
          const post = anchor && resolvePostLink(anchor.href);
          if (!post) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          onPostClick(post);
        }}
      >
        <Markdown className={transcriptProse} content={block.html} />
      </div>
    );
  }

  if (block.type === 'feedLink') {
    return (
      // The float lives on a wrapper: the card clips its own overflow and the
      // action reaches past its top edge.
      <div className="group/item relative">
        <AgentEmbedCard
          icon={<BulletListIcon size={IconSize.Size16} />}
          title={block.label}
          subtitle={`Feed · ${block.posts.length} posts`}
          actionLabel="Open"
          onAction={() => onFeedClick(block.label, block.posts)}
        />
        <AgentAddToChatButton
          attachment={feedAttachment(block.label, block.posts)}
          reveal
          className={addToChatFloat}
        />
      </div>
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

const MessageActions = ({
  message,
}: {
  message: AgentMessage;
}): ReactElement => {
  const { attachContext, writeDraft, sendFeedback } = useAgent();
  const [, copyText] = useCopyText();
  const [isCopied, setCopied] = useState(false);
  const [isSharing, setSharing] = useState(false);
  const [vote, setVote] = useState<'up' | 'down'>();

  const castVote = (next: 'up' | 'down') => {
    if (vote) {
      return;
    }

    setVote(next);
    const text = messageAsText(message);
    sendFeedback(
      `${next === 'up' ? 'More' : 'Fewer'} replies like this one: "${text.slice(
        0,
        140,
      )}"`,
    ).catch(() => setVote(undefined));
  };

  useEffect(() => {
    if (!isCopied) {
      return undefined;
    }

    const timer = setTimeout(() => setCopied(false), 2000);

    return () => clearTimeout(timer);
  }, [isCopied]);

  const explain = () => {
    const text = messageAsText(message);

    if (text) {
      attachContext(quoteAttachment(text));
    }

    writeDraft(
      vote === 'down'
        ? 'I marked that one down because '
        : 'I marked that one up because ',
    );
  };

  return (
    <FlexCol className="gap-1">
      <FlexRow className="items-center gap-0.5">
        <Tooltip content={isCopied ? 'Copied' : 'Copy reply'}>
          <Button
            icon={
              isCopied ? (
                <VIcon
                  size={IconSize.Size16}
                  className="agent-icon-in text-status-success"
                />
              ) : (
                <CopyIcon size={IconSize.Size16} />
              )
            }
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Tertiary}
            aria-label="Copy reply"
            // Flattened on click, not render: DOMParser only exists in the
            // browser.
            onClick={() => {
              Promise.resolve(
                copyText({ textToCopy: messageAsMarkdown(message) }),
              )
                .then(() => setCopied(true))
                .catch(() => undefined);
            }}
          />
        </Tooltip>
        <Button
          icon={<UpvoteIcon size={IconSize.Size16} secondary={vote === 'up'} />}
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Avocado}
          pressed={vote === 'up'}
          disabled={!!vote}
          aria-label="Good reply"
          aria-pressed={vote === 'up'}
          onClick={() => castVote('up')}
        />
        <Button
          icon={
            <DownvoteIcon size={IconSize.Size16} secondary={vote === 'down'} />
          }
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Ketchup}
          pressed={vote === 'down'}
          disabled={!!vote}
          aria-label="Bad reply"
          aria-pressed={vote === 'down'}
          onClick={() => castVote('down')}
        />
        <Tooltip content="Share reply">
          <Button
            icon={<ShareIcon size={IconSize.Size16} />}
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Tertiary}
            aria-label="Share reply"
            onClick={() => setSharing(true)}
          />
        </Tooltip>
      </FlexRow>

      {isSharing && (
        <AgentShareReplyModal
          isOpen
          onRequestClose={() => setSharing(false)}
          message={message}
        />
      )}

      {!!vote && (
        <FlexRow className="agent-line-in items-center gap-1.5 px-1">
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
          >
            {vote === 'up'
              ? 'Noted. More like this one.'
              : 'Noted. Fewer like this one.'}
          </Typography>
          <button
            type="button"
            onClick={explain}
            className="text-text-link typo-caption2 hover:underline"
          >
            Tell it why
          </button>
        </FlexRow>
      )}
    </FlexCol>
  );
};

const ErrorTurn = ({ message }: { message: AgentMessage }): ReactElement => {
  const { runCommand } = useAgent();
  const { retryText } = message;

  return (
    <FlexRow className="items-center gap-2 rounded-12 border border-border-subtlest-tertiary px-3 py-2.5">
      <WarningIcon
        size={IconSize.Size16}
        className="shrink-0 text-status-error"
      />
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="min-w-0 flex-1"
      >
        Something went wrong and this run didn&apos;t finish.
      </Typography>
      {retryText && (
        <Button
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Subtle}
          onClick={() => runCommand({ text: retryText })}
        >
          Retry
        </Button>
      )}
    </FlexRow>
  );
};

const MessageRow = ({
  message,
  onPostClick,
  onFeedClick,
  resolvePostLink,
  activePostId,
}: {
  message: AgentMessage;
  onPostClick: (post: Post) => void;
  onFeedClick: (label: string, posts: Post[]) => void;
  resolvePostLink: (href: string) => Post | undefined;
  activePostId?: string;
}): ReactElement => {
  if (message.role === 'user') {
    return (
      <FlexCol className="agent-turn-in items-end gap-1">
        {!!message.attachments?.length && (
          <FlexRow className="max-w-[85%] flex-wrap justify-end gap-1 tablet:max-w-[30rem]">
            {message.attachments.map((attachment) => (
              <AgentAttachmentChip
                key={attachment.id}
                attachment={attachment}
              />
            ))}
          </FlexRow>
        )}
        <div className="max-w-[85%] rounded-12 rounded-br-4 bg-surface-float px-3 py-2 tablet:max-w-[30rem]">
          <Typography type={TypographyType.Callout} className="!leading-normal">
            {message.text}
          </Typography>
        </div>
      </FlexCol>
    );
  }

  return (
    <FlexCol className="agent-turn-in group min-w-0 gap-2">
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
      {message.isPending && <AgentThinkingStrip />}
      {message.isError && <ErrorTurn message={message} />}
      {!message.isPending && !message.isError && (
        <>
          {(message.blocks ?? []).map((block, index) => (
            <BlockRenderer
              // eslint-disable-next-line react/no-array-index-key
              key={`${message.id}-${index}`}
              block={block}
              onPostClick={onPostClick}
              onFeedClick={onFeedClick}
              resolvePostLink={resolvePostLink}
              activePostId={activePostId}
            />
          ))}
          {!!message.blocks?.length && <MessageActions message={message} />}
        </>
      )}
    </FlexCol>
  );
};

export const AgentChatSection = (): ReactElement => {
  const {
    messages,
    openContentTarget,
    activeContent,
    queuedCommands,
    removeQueuedCommand,
    findingsPosts,
  } = useAgent();
  const activePostId =
    activeContent?.type === 'post' ? activeContent.post.id : undefined;
  const postsByLink = useMemo(
    () =>
      new Map(
        findingsPosts
          .filter((post) => post.commentsPermalink)
          .map((post) => [postLinkKey(post.commentsPermalink), post]),
      ),
    [findingsPosts],
  );

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
          resolvePostLink={(href) => postsByLink.get(postLinkKey(href))}
          activePostId={activePostId}
        />
      ))}
      {queuedCommands.map(({ id, text }) => (
        <FlexCol key={id} className="agent-turn-in items-end">
          <FlexRow className="max-w-[85%] items-center gap-2 rounded-12 rounded-br-4 border border-dashed border-border-subtlest-secondary px-3 py-2 tablet:max-w-[30rem]">
            <FlexCol className="min-w-0 flex-1">
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.Quaternary}
              >
                Queued
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
                className="truncate"
              >
                {text}
              </Typography>
            </FlexCol>
            <Button
              icon={<MiniCloseIcon size={IconSize.Size16} />}
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Tertiary}
              aria-label={`Remove queued message: ${text}`}
              onClick={() => removeQueuedCommand(id)}
            />
          </FlexRow>
        </FlexCol>
      ))}
    </FlexCol>
  );
};
