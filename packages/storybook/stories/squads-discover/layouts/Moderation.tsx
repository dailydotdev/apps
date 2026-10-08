import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  BlockIcon,
  MiniCloseIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  NotifContainer,
  NotifMessage,
} from '@dailydotdev/shared/src/components/notifications/utils';
import type { PendingPost } from '../data';
import { PageHeaderStrip, PhonePageBlock } from '../shell';
import { usePreview } from '../kit';

// The moderator's queue behind "Pending posts", as production builds it on
// /squads/moderate (SquadModerationList and its modals). Production's
// modals portal outside the device frame, so their markup and copy are
// rebuilt here, in the frame.

export type ModerationOutcome = 'approved' | 'declined';

const declineReasons = [
  'Off-topic post unrelated to the Squad',
  "Violates the Squad's code of conduct",
  'Too promotional without adding value',
  'Duplicate or similar content already posted',
  'Lacks quality or clarity',
  'Inappropriate, NSFW or offensive post',
  'Post is spam or scam',
  'Contains misleading or false information',
  'Copyright or privacy violation',
  'Other',
];

/* ------------------------------------------------------------- pieces */

const Tags = ({ tags }: { tags: string[] }): ReactElement => (
  <span className="flex flex-wrap gap-2">
    {tags.map((tag) => (
      <span
        key={tag}
        className="rounded-8 bg-surface-float px-2 py-0.5 text-text-tertiary typo-footnote"
      >
        #{tag}
      </span>
    ))}
  </span>
);

const Author = ({ post }: { post: PendingPost }): ReactElement => (
  <span className="flex flex-row gap-4">
    {/* People's pictures are rounded squares; squads are circles. */}
    <img
      alt=""
      src={post.author.image}
      className="size-10 shrink-0 rounded-12 object-cover"
    />
    <span className="flex flex-col gap-1">
      <Typography type={TypographyType.Footnote} bold>
        {post.author.name}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {post.createdAt} · {post.readTime}m read time
      </Typography>
    </span>
  </span>
);

const SquadLine = ({ post }: { post: PendingPost }): ReactElement => (
  <span className="flex items-center gap-2">
    <img
      alt=""
      src={post.squad.image}
      className="size-6 rounded-full object-cover"
    />
    <Typography type={TypographyType.Callout} color={TypographyColor.Tertiary}>
      {post.squad.name}
    </Typography>
  </span>
);

const Actions = ({
  onDecline,
  onApprove,
}: {
  onDecline: () => void;
  onApprove: () => void;
}): ReactElement => (
  <div className="flex w-full flex-row gap-4">
    <Button
      type="button"
      size={ButtonSize.Small}
      variant={ButtonVariant.Float}
      icon={<BlockIcon />}
      className="flex-1"
      onClick={onDecline}
    >
      Decline
    </Button>
    <Button
      type="button"
      size={ButtonSize.Small}
      variant={ButtonVariant.Primary}
      icon={<VIcon secondary />}
      className="flex-1"
      onClick={onApprove}
    >
      Approve
    </Button>
  </div>
);

/** An in-frame stand-in for production's Modal: a sheet on phones. */
const Sheet = ({
  label,
  onClose,
  size = 'large',
  children,
}: {
  label: string;
  onClose: () => void;
  size?: 'large' | 'small';
  children: ReactNode;
}): ReactElement => (
  // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
  <div
    className="fixed inset-0 z-max flex flex-col items-center justify-end bg-overlay-quaternary-onion tablet:justify-start tablet:pt-10"
    onClick={onClose}
  >
    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
    <section
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={(event) => event.stopPropagation()}
      className={classNames(
        'sd-in flex max-h-[calc(100%-3rem)] w-full flex-col overflow-y-auto rounded-t-16 bg-background-default tablet:max-h-[calc(100vh-5rem)] tablet:rounded-16 tablet:border tablet:border-border-subtlest-tertiary',
        size === 'large' ? 'tablet:w-[42.5rem]' : 'tablet:w-[26.25rem]',
      )}
    >
      {children}
    </section>
  </div>
);

/** PostModerationModal: tapping a queued post opens its full preview. */
const PreviewSheet = ({
  post,
  onClose,
  onDecline,
  onApprove,
}: {
  post: PendingPost;
  onClose: () => void;
  onDecline: () => void;
  onApprove: () => void;
}): ReactElement => (
  <Sheet label="Post preview" onClose={onClose}>
    <div className="flex flex-col gap-6 p-6">
      <Actions onDecline={onDecline} onApprove={onApprove} />
      <div className="flex items-center gap-2">
        <Typography
          tag={TypographyTag.H3}
          type={TypographyType.Title3}
          bold
          className="flex-1 truncate"
        >
          Post preview
        </Typography>
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          icon={<MiniCloseIcon />}
          aria-label="Close"
          onClick={onClose}
        />
      </div>
      <SquadLine post={post} />
      <Author post={post} />
      <Typography type={TypographyType.Title2} bold className="break-words">
        {post.title}
      </Typography>
      <img
        alt=""
        src={post.image}
        className="h-64 w-full rounded-16 object-cover"
      />
      <Typography type={TypographyType.Body}>{post.content}</Typography>
    </div>
  </Sheet>
);

/** ReasonSelectionModal, opened by Decline, replacing the preview. */
const DeclineSheet = ({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: () => void;
}): ReactElement => {
  const [reason, setReason] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const canSubmit = !!reason && (reason !== 'Other' || !!note.trim());
  return (
    <Sheet label="Select a reason for declining" onClose={onClose}>
      <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary px-6 py-4">
        <Typography type={TypographyType.Title3} bold className="flex-1">
          Select a reason for declining
        </Typography>
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          icon={<MiniCloseIcon />}
          aria-label="Close"
          onClick={onClose}
        />
      </div>
      <div className="flex flex-col gap-1 p-6">
        {declineReasons.map((item) => (
          <label
            key={item}
            className="flex cursor-pointer items-center gap-3 rounded-12 px-2 py-2.5 hover:bg-surface-hover"
          >
            <input
              type="radio"
              name="decline-reason"
              checked={reason === item}
              onChange={() => setReason(item)}
              className="size-4 accent-text-primary"
            />
            <Typography type={TypographyType.Callout}>{item}</Typography>
          </label>
        ))}
        <Typography type={TypographyType.Callout} bold className="mt-4">
          Anything else you&apos;d like to add?
        </Typography>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          className="mt-2 w-full rounded-12 border border-border-subtlest-tertiary bg-surface-float p-3 text-text-primary typo-callout"
        />
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          className="mt-6 self-end"
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          Submit report
        </Button>
      </div>
    </Sheet>
  );
};

/** usePrompt before approving several posts at once. */
const ApproveAllPrompt = ({
  count,
  onCancel,
  onConfirm,
}: {
  count: number;
  onCancel: () => void;
  onConfirm: () => void;
}): ReactElement => (
  <Sheet label={`Approve all ${count} posts?`} onClose={onCancel} size="small">
    <div className="flex flex-col p-6">
      <h1 className="text-center font-bold typo-title3">
        Approve all {count} posts?
      </h1>
      <div className="mb-6 mt-4 text-center text-text-secondary typo-callout">
        This action cannot be undone.
      </div>
      <div className="flex flex-col items-center justify-center gap-4 tablet:flex-row">
        <Button
          type="button"
          variant={ButtonVariant.Secondary}
          className="w-full tablet:w-auto"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          className="w-full tablet:w-auto"
          onClick={onConfirm}
        >
          Yes, Approve all
        </Button>
      </div>
    </div>
  </Sheet>
);

/** Production's toast, without Undo: these actions cannot be undone. */
const Toast = ({ message }: { message: string }): ReactElement => (
  <div className="pointer-events-none fixed inset-x-0 top-4 z-max flex justify-center px-4 tablet:top-8">
    <NotifContainer
      role="alert"
      className="sd-in pointer-events-auto !static !w-auto !translate-x-0 gap-2"
    >
      <VIcon
        size={IconSize.Small}
        className="shrink-0 text-accent-avocado-default"
      />
      <NotifMessage>{message}</NotifMessage>
    </NotifContainer>
  </div>
);

/* --------------------------------------------------------------- page */

export const ModerationView = ({
  queue,
  onResolve,
  onBack,
}: {
  queue: PendingPost[];
  onResolve: (ids: string[], outcome: ModerationOutcome) => void;
  onBack: () => void;
}): ReactElement => {
  const { moderation: step } = usePreview();
  const [previewing, setPreviewing] = useState<PendingPost | null>(
    step === 'preview' ? queue[0] : null,
  );
  const [declining, setDeclining] = useState<PendingPost | null>(
    step === 'decline' ? queue[0] : null,
  );
  const [confirmAll, setConfirmAll] = useState(step === 'approve-all');
  const [toast, setToast] = useState<string | null>(
    step === 'approved' ? 'Post(s) approved successfully' : null,
  );

  useEffect(() => {
    // The catalog's "after approving" frame keeps its toast on screen.
    if (!toast || step === 'approved') {
      return undefined;
    }
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast, step]);

  const approve = (ids: string[]) => {
    onResolve(ids, 'approved');
    setPreviewing(null);
    setToast('Post(s) approved successfully');
  };
  const decline = (post: PendingPost) => {
    setPreviewing(null);
    setDeclining(post);
  };

  return (
    <>
      <PageHeaderStrip className="hidden gap-2 tablet:flex">
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          icon={<ArrowIcon className="-rotate-90" />}
          aria-label="Back"
          onClick={onBack}
        />
        <Typography tag={TypographyTag.H1} type={TypographyType.Title3} bold>
          Squad settings
        </Typography>
      </PageHeaderStrip>
      <PhonePageBlock title="Squad settings" onBack={onBack} />
      <main className="sd-in mx-auto flex w-full max-w-[42.5rem] flex-col border-border-subtlest-tertiary laptop:min-h-[calc(100vh-5rem)] laptop:border-x">
        {queue.length > 1 && (
          <span className="flex w-full flex-row justify-end border-b border-border-subtlest-tertiary px-4 py-3">
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              icon={<VIcon secondary />}
              onClick={() => setConfirmAll(true)}
            >
              Approve all {queue.length} posts
            </Button>
          </span>
        )}
        {queue.length === 0 && (
          <div className="flex w-full flex-col items-center gap-4 p-6 py-10">
            <VIcon
              secondary
              size={IconSize.XXXLarge}
              className="text-text-disabled"
            />
            <Typography type={TypographyType.Title2} bold>
              All done!
            </Typography>
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Secondary}
              className="text-center"
            >
              All caught up! There are no posts waiting for your review right
              now.
            </Typography>
          </div>
        )}
        {queue.map((post) => (
          <article
            key={post.id}
            className="relative flex flex-col gap-4 border-b border-border-subtlest-tertiary p-6 hover:bg-surface-hover"
          >
            <button
              type="button"
              aria-label={`Review ${post.title}`}
              className="absolute inset-0"
              onClick={() => setPreviewing(post)}
            />
            <SquadLine post={post} />
            <Author post={post} />
            <div className="flex flex-col gap-4 tablet:flex-row">
              <div className="flex flex-1 flex-col gap-3">
                <Typography
                  tag={TypographyTag.H2}
                  type={TypographyType.Title3}
                  bold
                  className="break-words"
                >
                  {post.title}
                </Typography>
                <Tags tags={post.tags} />
              </div>
              <img
                alt=""
                src={post.image}
                className="h-40 w-full rounded-16 object-cover tablet:w-60"
              />
            </div>
            <div className="relative z-1">
              <Actions
                onDecline={() => decline(post)}
                onApprove={() => approve([post.id])}
              />
            </div>
          </article>
        ))}
      </main>
      {previewing && (
        <PreviewSheet
          post={previewing}
          onClose={() => setPreviewing(null)}
          onDecline={() => decline(previewing)}
          onApprove={() => approve([previewing.id])}
        />
      )}
      {declining && (
        <DeclineSheet
          onClose={() => setDeclining(null)}
          onSubmit={() => {
            onResolve([declining.id], 'declined');
            setDeclining(null);
            setToast('Post(s) declined successfully');
          }}
        />
      )}
      {confirmAll && (
        <ApproveAllPrompt
          count={queue.length}
          onCancel={() => setConfirmAll(false)}
          onConfirm={() => {
            setConfirmAll(false);
            approve(queue.map((post) => post.id));
          }}
        />
      )}
      {toast && <Toast message={toast} />}
    </>
  );
};
