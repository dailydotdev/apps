import type { ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  BlockIcon,
  DiscussIcon,
  DownvoteIcon,
  EyeCancelIcon,
  FlagIcon,
  MenuIcon,
  ReputationIcon,
  ShareIcon,
  TrashIcon,
  UpvoteIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { Separator } from '../../../components/cards/common/common';
import { CardActionBar } from '../../../components/buttons/CardActionBar';
import { CardAction } from '../../../components/buttons/CardAction';
import { useOutsideClick } from '../../../hooks/utils/useOutsideClick';

interface GivebackComment {
  id: string;
  author: string;
  handle: string;
  reputation: string;
  time: string;
  text: string;
  avatarClass: string;
  upvotes?: number;
  replies?: GivebackComment[];
}

const seedComments: GivebackComment[] = [
  {
    id: 'comment-1',
    author: 'Priya N.',
    handle: '@priyan',
    reputation: '2.5K',
    time: '2h ago',
    text: 'Love that this costs me nothing but still funds real causes. Backed open source and shared the launch post.',
    avatarClass: 'bg-accent-cabbage-flat text-accent-cabbage-default',
    upvotes: 14,
    replies: [
      {
        id: 'comment-1-reply-1',
        author: 'daily.dev team',
        handle: '@dailydotdev',
        reputation: '48K',
        time: '1h ago',
        text: 'Thank you for spreading the word, Priya — every share helps the pot grow.',
        avatarClass: 'bg-accent-onion-flat text-accent-onion-default',
        upvotes: 6,
      },
    ],
  },
  {
    id: 'comment-2',
    author: 'Marco D.',
    handle: '@marcod',
    reputation: '6.5K',
    time: '5h ago',
    text: 'Finally a rewards program where the company puts up the money. Picked Girls Who Code — keep it going!',
    avatarClass: 'bg-accent-avocado-flat text-accent-avocado-default',
    upvotes: 9,
  },
  {
    id: 'comment-3',
    author: 'Lena S.',
    handle: '@lenas',
    reputation: '1.7K',
    time: 'Yesterday',
    text: 'Question for the team: will you share the donation receipts publicly? Would love the transparency.',
    avatarClass: 'bg-accent-onion-flat text-accent-onion-default',
    upvotes: 4,
  },
];

const currentUser = 'You';

const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

// Recursive tree helpers — comments and their replies share one shape, so a
// single set of helpers keeps remove/block/reply consistent at any depth.
const removeNode = (list: GivebackComment[], id: string): GivebackComment[] =>
  list
    .filter((comment) => comment.id !== id)
    .map((comment) =>
      comment.replies
        ? { ...comment, replies: removeNode(comment.replies, id) }
        : comment,
    );

const removeByAuthor = (
  list: GivebackComment[],
  author: string,
): GivebackComment[] =>
  list
    .filter((comment) => comment.author !== author)
    .map((comment) =>
      comment.replies
        ? { ...comment, replies: removeByAuthor(comment.replies, author) }
        : comment,
    );

const addReply = (
  list: GivebackComment[],
  threadId: string,
  reply: GivebackComment,
): GivebackComment[] =>
  list.map((comment) =>
    comment.id === threadId
      ? { ...comment, replies: [...(comment.replies ?? []), reply] }
      : comment,
  );

interface CommentMenuProps {
  isOwn: boolean;
  author: string;
  onRemove: () => void;
  onBlock: () => void;
  onReport: () => void;
}

const CommentMenu = ({
  isOwn,
  author,
  onRemove,
  onBlock,
  onReport,
}: CommentMenuProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => setOpen(false), open);

  const run = (action: () => void) => () => {
    action();
    setOpen(false);
  };

  const ownerItems = [
    {
      id: 'remove',
      label: 'Remove',
      icon: <TrashIcon />,
      onClick: run(onRemove),
      destructive: true,
    },
  ];

  const visitorItems = [
    {
      id: 'hide',
      label: 'Hide',
      icon: <EyeCancelIcon />,
      onClick: run(onRemove),
      destructive: false,
    },
    {
      id: 'block',
      label: `Block ${author}`,
      icon: <BlockIcon />,
      onClick: run(onBlock),
      destructive: false,
    },
    {
      id: 'report',
      label: 'Report',
      icon: <FlagIcon />,
      onClick: run(onReport),
      destructive: true,
    },
  ];

  const items = isOwn ? ownerItems : visitorItems;

  return (
    <div ref={ref} className="relative">
      <Button
        type="button"
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
        icon={<MenuIcon />}
        aria-label="More options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      />
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-3 mt-1 min-w-44 origin-top-right overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default py-1 shadow-2 motion-safe:animate-reward-pop"
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              onClick={item.onClick}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left typo-callout hover:bg-surface-hover [&_svg]:size-4 ${
                item.destructive ? 'text-status-error' : 'text-text-primary'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface ReplyComposerProps {
  author: string;
  onCancel: () => void;
  onSubmit: (text: string) => void;
}

const ReplyComposer = ({
  author,
  onCancel,
  onSubmit,
}: ReplyComposerProps): ReactElement => {
  const [draft, setDraft] = useState('');

  const submit = () => {
    const text = draft.trim();
    if (!text) {
      return;
    }
    onSubmit(text);
    setDraft('');
  };

  return (
    <FlexCol className="ml-[52px] mt-2 gap-2">
      <textarea
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        aria-label={`Reply to ${author}`}
        placeholder={`Reply to ${author}…`}
        className="min-h-16 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 text-text-primary typo-callout"
      />
      <FlexRow className="justify-end gap-2">
        <Button
          type="button"
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Tertiary}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Primary}
          disabled={!draft.trim()}
          onClick={submit}
        >
          Post reply
        </Button>
      </FlexRow>
    </FlexCol>
  );
};

interface CommentHandlers {
  onStartReply: (id: string) => void;
  onCancelReply: () => void;
  onSubmitReply: (threadId: string, author: string, text: string) => void;
  onRemove: (id: string) => void;
  onBlock: (author: string) => void;
  onReport: (id: string) => void;
}

interface CommentRowProps extends CommentHandlers {
  comment: GivebackComment;
  threadId: string;
  isReported: boolean;
  replyingToId: string | null;
}

// Mirrors the product's `CommentContainer` body used in the post page / modal
// thread (isModalThread): avatar + author/handle/time + reputation, then the
// body and compact action bar indented under the name (`ml-[52px]`), with no
// per-comment border, padding or hover fill — spacing comes from the thread.
const CommentRow = ({
  comment,
  threadId,
  isReported,
  replyingToId,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onRemove,
  onBlock,
  onReport,
}: CommentRowProps): ReactElement => {
  const isOwn = comment.author === currentUser;
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const upvotes = (comment.upvotes ?? 0) + (vote === 'up' ? 1 : 0);

  return (
    <article className="relative flex flex-col">
      <header className="z-1 flex w-full flex-row self-start">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-full font-bold typo-footnote ${comment.avatarClass}`}
        >
          {getInitials(comment.author)}
        </span>
        <div className="ml-3 flex min-w-0 flex-1 flex-col typo-callout">
          <FlexRow className="h-5 items-center gap-1 text-text-quaternary">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Callout}
              bold
            >
              {comment.author}
            </Typography>
            <span className="flex h-5 min-w-0 shrink items-center truncate !leading-5 text-text-tertiary typo-footnote">
              {comment.handle}
            </span>
            <Separator className="!mx-0 !h-5 !leading-5" />
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="!h-5 !leading-5"
            >
              {comment.time}
            </Typography>
            {isReported && (
              <FlexRow className="items-center gap-1 text-status-error [&_svg]:size-3">
                <FlagIcon />
                <Typography type={TypographyType.Caption2} bold>
                  Reported
                </Typography>
              </FlexRow>
            )}
          </FlexRow>
          <div className="flex items-center font-bold text-text-primary typo-footnote">
            <ReputationIcon
              className="mr-0.5 text-accent-onion-default"
              size={IconSize.XSmall}
            />
            {comment.reputation}
          </div>
        </div>
      </header>

      <div className="z-1 ml-[52px] mt-1 break-words text-[0.9375rem] leading-[1.55]">
        {comment.text}
        <div className="pointer-events-auto mt-1 flex w-full flex-row items-center gap-0.5">
          <CardActionBar layout="compact">
            <CardAction
              density="compact"
              pressed={vote === 'up'}
              label="Upvote"
              color={ButtonColor.Avocado}
              icon={<UpvoteIcon />}
              iconPressed={<UpvoteIcon secondary />}
              onClick={() => setVote((value) => (value === 'up' ? null : 'up'))}
            />
            <CardAction
              density="compact"
              pressed={vote === 'down'}
              label="Downvote"
              color={ButtonColor.Ketchup}
              className="mr-3"
              icon={<DownvoteIcon />}
              iconPressed={<DownvoteIcon secondary />}
              onClick={() =>
                setVote((value) => (value === 'down' ? null : 'down'))
              }
            />
            <CardAction
              density="compact"
              label="Reply"
              color={ButtonColor.BlueCheese}
              className="mr-3"
              icon={<DiscussIcon />}
              onClick={() => onStartReply(comment.id)}
            />
            <CardAction
              density="compact"
              label="Share comment"
              color={ButtonColor.Cabbage}
              className="mr-3 hidden mobileXL:flex"
              icon={<ShareIcon />}
              onClick={() => undefined}
            />
          </CardActionBar>
          <CommentMenu
            isOwn={isOwn}
            author={comment.author}
            onRemove={() => onRemove(comment.id)}
            onBlock={() => onBlock(comment.author)}
            onReport={() => onReport(comment.id)}
          />
          {upvotes > 0 && (
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="ml-auto"
            >
              {upvotes} upvote{upvotes === 1 ? '' : 's'}
            </Typography>
          )}
        </div>
      </div>

      {replyingToId === comment.id && (
        <ReplyComposer
          author={comment.author}
          onCancel={onCancelReply}
          onSubmit={(text) => onSubmitReply(threadId, comment.author, text)}
        />
      )}
    </article>
  );
};

interface CommentThreadProps extends CommentHandlers {
  comment: GivebackComment;
  reportedIds: Set<string>;
  replyingToId: string | null;
}

// One thread = a top-level comment plus its replies, joined by the thin
// `accent-pepper-subtle` connector lines exactly like the post page thread.
const CommentThread = ({
  comment,
  reportedIds,
  replyingToId,
  ...handlers
}: CommentThreadProps): ReactElement => {
  const replies = comment.replies ?? [];
  const hasReplies = replies.length > 0;

  return (
    <section className="relative flex scroll-mt-16 flex-col items-stretch">
      {hasReplies && (
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-8 left-5 top-10 w-px bg-accent-pepper-subtle"
        />
      )}
      <CommentRow
        comment={comment}
        threadId={comment.id}
        isReported={reportedIds.has(comment.id)}
        replyingToId={replyingToId}
        {...handlers}
      />
      {hasReplies && (
        <div className="relative mt-1 flex flex-col">
          {replies.map((reply, index) => {
            const isFirst = index === 0;
            const isLast = index === replies.length - 1;

            return (
              <div
                key={reply.id}
                className={classNames('relative py-2', !isLast && 'mb-1')}
              >
                {isFirst && (
                  <div
                    aria-hidden
                    className="absolute -top-2 left-5 h-3 w-px bg-accent-pepper-subtle"
                  />
                )}
                {!isLast && (
                  <div
                    aria-hidden
                    className="absolute -bottom-3 left-5 top-10 w-px bg-accent-pepper-subtle"
                  />
                )}
                <CommentRow
                  comment={reply}
                  threadId={comment.id}
                  isReported={reportedIds.has(reply.id)}
                  replyingToId={replyingToId}
                  {...handlers}
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export const GivebackComments = (): ReactElement => {
  const [comments, setComments] = useState<GivebackComment[]>(seedComments);
  const [draft, setDraft] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());

  const postComment = () => {
    const text = draft.trim();
    if (!text) {
      return;
    }

    setComments((current) => [
      {
        id: `comment-${Date.now()}`,
        author: currentUser,
        handle: '@you',
        reputation: '0',
        time: 'Just now',
        text,
        avatarClass: 'bg-accent-bacon-flat text-accent-bacon-default',
      },
      ...current,
    ]);
    setDraft('');
  };

  const submitReply = (threadId: string, author: string, text: string) => {
    setComments((current) =>
      addReply(current, threadId, {
        id: `reply-${Date.now()}`,
        author: currentUser,
        handle: '@you',
        reputation: '0',
        time: 'Just now',
        text,
        avatarClass: 'bg-accent-bacon-flat text-accent-bacon-default',
      }),
    );
    setReplyingToId(null);
  };

  const removeComment = (id: string) =>
    setComments((current) => removeNode(current, id));

  const blockAuthor = (author: string) =>
    setComments((current) => removeByAuthor(current, author));

  const reportComment = (id: string) =>
    setReportedIds((current) => new Set(current).add(id));

  return (
    <FlexCol className="w-full gap-5">
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Share why you&apos;re backing Giveback, or ask the team anything.
      </Typography>

      <FlexCol className="gap-2">
        <label htmlFor="giveback-comment" className="flex flex-col gap-2">
          <Typography
            tag={TypographyTag.Span}
            bold
            type={TypographyType.Footnote}
          >
            Add a comment
          </Typography>
          <textarea
            id="giveback-comment"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="What does giving back mean to you?"
            className="min-h-20 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 text-text-primary typo-callout"
          />
        </label>
        <FlexRow className="justify-end">
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            disabled={!draft.trim()}
            onClick={postComment}
          >
            Post comment
          </Button>
        </FlexRow>
      </FlexCol>

      <FlexCol className="mt-2 gap-4">
        {comments.map((comment) => (
          <CommentThread
            key={comment.id}
            comment={comment}
            reportedIds={reportedIds}
            replyingToId={replyingToId}
            onStartReply={setReplyingToId}
            onCancelReply={() => setReplyingToId(null)}
            onSubmitReply={submitReply}
            onRemove={removeComment}
            onBlock={blockAuthor}
            onReport={reportComment}
          />
        ))}
      </FlexCol>
    </FlexCol>
  );
};
