import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
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
import { feedAttachment, quoteAttachment } from '../attachments';
import { AgentPickList } from './AgentPickList';
import { AgentAttachmentChip } from './AgentAttachmentChip';
import { addToChatFloat, AgentAddToChatButton } from './AgentAddToChatButton';
import { AgentThinkingStrip } from './AgentThinkingStrip';
import { AgentPostCard } from './AgentPostCard';
import { AgentEmbedCard } from './blocks/AgentEmbedCard';

// The shared markdown styles are tuned for reading an article (17px on a 1.7
// leading, 24px paragraph gaps), which is far too loose at transcript density.
// Step it down to our callout token on a prose leading, scoped to the chat so
// post pages keep the reading rhythm. The shared rules are `:where()`-wrapped,
// so these class-based overrides win without `!important`.
// The `!leading-*` overrides are required, not stylistic: `typo-*` ships a
// line-height with its size, and it wins the cascade over a plain `leading-*`.
// `text-pretty` on the prose and `text-balance` on the headings: a reply that
// ends on one orphaned word, or a heading that breaks after "the", is the kind
// of thing nobody points at and everybody feels.
const transcriptProse = classNames(
  '[&_p]:my-3 [&_p]:text-pretty [&_p]:!leading-relaxed [&_p]:typo-callout',
  '[&_li]:text-pretty [&_li]:!leading-relaxed [&_li]:typo-callout [&_ol]:my-3 [&_ul]:my-3',
  '[&_h1]:mb-1.5 [&_h1]:mt-5 [&_h1]:text-balance [&_h1]:!leading-snug [&_h1]:typo-body',
  '[&_h2]:mb-1.5 [&_h2]:mt-5 [&_h2]:text-balance [&_h2]:!leading-snug [&_h2]:typo-body',
  '[&_h3]:mb-1.5 [&_h3]:mt-5 [&_h3]:text-balance [&_h3]:!leading-snug [&_h3]:typo-callout',
  '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
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
      // The float lives on a wrapper: the card clips its own overflow for the
      // media area, and the action reaches past its top edge.
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

// The reply as flat text for the clipboard: markup stripped, block gaps kept.
const messageAsText = (message: AgentMessage): string =>
  (message.blocks ?? [])
    .filter((block) => block.type === 'text')
    .map(
      (block) =>
        new DOMParser().parseFromString(
          (block as { html: string }).html,
          'text/html',
        ).body.textContent ?? '',
    )
    .join('\n\n')
    .trim();

// Hover-revealed, the way Claude and Codex keep reply actions out of the
// reading flow until the pointer says they are wanted. Every one of them
// answers back: a press with no visible consequence reads as a press that did
// not land.
const MessageActions = ({
  message,
}: {
  message: AgentMessage;
}): ReactElement => {
  const { attachContext, writeDraft } = useAgent();
  const [, copyText] = useCopyText();
  const [isCopied, setCopied] = useState(false);
  const [vote, setVote] = useState<'up' | 'down'>();

  useEffect(() => {
    if (!isCopied) {
      return undefined;
    }

    const timer = setTimeout(() => setCopied(false), 2000);

    return () => clearTimeout(timer);
  }, [isCopied]);

  // The reply goes into the field as context, so "why" is answered about this
  // turn rather than about the conversation in general.
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
      <FlexRow
        className={classNames(
          'items-center gap-0.5 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100',
          // Once voted the row stays: the note under it is permanent, and a
          // line of feedback floating under buttons that vanished reads as
          // orphaned text.
          !vote && 'opacity-0',
        )}
      >
        <Tooltip content={isCopied ? 'Copied' : 'Copy reply'}>
          <Button
            icon={
              isCopied ? (
                // Scales and unblurs into place rather than appearing: it is
                // the same control confirming, not a second one arriving.
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
              copyText({ textToCopy: messageAsText(message) });
              setCopied(true);
            }}
          />
        </Tooltip>
        <Button
          icon={<UpvoteIcon size={IconSize.Size16} secondary={vote === 'up'} />}
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Avocado}
          pressed={vote === 'up'}
          aria-label="Good reply"
          aria-pressed={vote === 'up'}
          onClick={() =>
            setVote((current) => (current === 'up' ? undefined : 'up'))
          }
        />
        <Button
          icon={
            <DownvoteIcon size={IconSize.Size16} secondary={vote === 'down'} />
          }
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Ketchup}
          pressed={vote === 'down'}
          aria-label="Bad reply"
          aria-pressed={vote === 'down'}
          onClick={() =>
            setVote((current) => (current === 'down' ? undefined : 'down'))
          }
        />
      </FlexRow>

      {/* Stays put once voted rather than fading with the row: it carries the
          way to say more, and a note you have to hover to re-read is a note
          nobody reads. */}
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
  activePostId,
}: {
  message: AgentMessage;
  onPostClick: (post: Post) => void;
  onFeedClick: (label: string, posts: Post[]) => void;
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

  // Agent turns carry no avatar or name: the right-aligned user bubbles are
  // what separates the two voices, so repeating "Your agent" on every reply is
  // noise. Only a scheduled run gets a marker, because that one arrived on its
  // own rather than as an answer.
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
  } = useAgent();
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
      {/* Prompts waiting behind the in-flight run sit as muted bubbles under
          the transcript, Claude Code's queued-message pattern: visible,
          removable, and not yet part of the conversation. */}
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
