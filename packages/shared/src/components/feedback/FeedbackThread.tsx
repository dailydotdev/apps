import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import Textarea from '../fields/Textarea';
import { OpenLinkIcon } from '../icons';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import Link from '../utilities/Link';
import { useToastNotification } from '../../hooks/useToastNotification';
import type { FeedbackItem, FeedbackReply } from '../../graphql/feedback';
import {
  FEEDBACK_REPLY_MAX_LENGTH,
  FeedbackStatus,
  feedbackQueryOptions,
  replyToFeedback,
  updateFeedbackStatus,
} from '../../graphql/feedback';
import {
  getFeedbackCategoryLabel,
  getFeedbackStatusClassName,
  getFeedbackStatusLabel,
  isFeedbackClosed,
} from '../../lib/feedback';
import { generateQueryKey, RequestKey } from '../../lib/query';

const badgeClassName = 'rounded-14 bg-surface-hover px-2 py-1 text-xs';

const teamStatusActions: {
  status: FeedbackStatus;
  label: string;
  variant: ButtonVariant;
}[] = [
  {
    status: FeedbackStatus.Completed,
    label: 'Resolve',
    variant: ButtonVariant.Secondary,
  },
  {
    status: FeedbackStatus.Cancelled,
    label: 'Close',
    variant: ButtonVariant.Float,
  },
  {
    status: FeedbackStatus.Spam,
    label: 'Mark as spam',
    variant: ButtonVariant.Float,
  },
];

const statusToasts: Partial<Record<FeedbackStatus, string>> = {
  [FeedbackStatus.Accepted]: 'Feedback reopened',
  [FeedbackStatus.Completed]: 'Feedback resolved',
  [FeedbackStatus.Cancelled]: 'Feedback closed',
  [FeedbackStatus.Spam]: 'Marked as spam',
};

const ReplyAuthor = ({ reply }: { reply: FeedbackReply }): ReactElement => {
  const name = reply.authorName || (reply.isTeam ? 'daily.dev team' : 'You');

  return (
    <div className="flex items-center gap-2">
      {reply.author && (
        <ProfilePicture
          user={{
            ...reply.author,
            image: reply.author.image ?? '',
            name: reply.author.name ?? undefined,
            username: reply.author.username ?? undefined,
          }}
          size={ProfileImageSize.Small}
        />
      )}
      <Typography type={TypographyType.Footnote} bold>
        {name}
      </Typography>
      {reply.isTeam && (
        <span className={`${badgeClassName} text-brand-default`}>
          daily.dev team
        </span>
      )}
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="ml-auto"
      >
        {format(new Date(reply.createdAt), 'dd MMM yyyy, HH:mm')}
      </Typography>
    </div>
  );
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}): ReactElement | null => {
  if (!value) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 tablet:flex-row tablet:gap-3">
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="w-28 shrink-0"
      >
        {label}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        className="min-w-0 flex-1 break-words"
      >
        {value}
      </Typography>
    </div>
  );
};

// Classification and client context, shown to team members only
const TeamDetails = ({ item }: { item: FeedbackItem }): ReactElement | null => {
  const { classification, clientInfo } = item;
  const clientRows = Object.entries(clientInfo ?? {}).filter(
    ([, value]) => !!value,
  );

  if (
    !classification &&
    !item.pageUrl &&
    !item.userAgent &&
    !clientRows.length
  ) {
    return null;
  }

  return (
    <details className="group rounded-16 border border-border-subtlest-tertiary">
      <summary className="cursor-pointer px-4 py-3 font-bold typo-callout">
        Details
      </summary>
      <div className="flex flex-col gap-2 border-t border-border-subtlest-tertiary px-4 py-3">
        <DetailRow label="Summary" value={classification?.summary} />
        <DetailRow label="Urgency" value={classification?.urgency} />
        <DetailRow label="Sentiment" value={classification?.sentiment} />
        <DetailRow label="Tags" value={classification?.tags?.join(', ')} />
        {item.pageUrl && (
          <div className="flex flex-col gap-1 tablet:flex-row tablet:gap-3">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="w-28 shrink-0"
            >
              Page
            </Typography>
            <a
              href={item.pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1 break-words text-text-link underline typo-footnote"
            >
              {item.pageUrl}
            </a>
          </div>
        )}
        <DetailRow label="User agent" value={item.userAgent} />
        {clientRows.map(([key, value]) => (
          <DetailRow key={key} label={key} value={value} />
        ))}
        {classification?.hasPromptInjection && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.StatusError}
          >
            Possible prompt injection detected in this feedback.
          </Typography>
        )}
      </div>
    </details>
  );
};

export type FeedbackThreadProps = {
  item: FeedbackItem;
  isTeam: boolean;
  viewerId?: string;
};

export const FeedbackThread = ({
  item,
  isTeam,
  viewerId,
}: FeedbackThreadProps): ReactElement => {
  const queryClient = useQueryClient();
  const { displayToast } = useToastNotification();
  const [body, setBody] = useState('');
  const isOwner = !!viewerId && item.user?.id === viewerId;
  const isClosed = isFeedbackClosed(item.status);
  const canReply = isTeam || item.status !== FeedbackStatus.Spam;
  const trimmedBody = body.trim();

  const invalidateLists = () => {
    [
      RequestKey.UserFeedback,
      RequestKey.FeedbackList,
      RequestKey.UserFeedbackByUserId,
    ].forEach((key) =>
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(key),
      }),
    );
  };

  const refreshThread = () =>
    queryClient.invalidateQueries({
      queryKey: feedbackQueryOptions({ id: item.id }).queryKey,
    });

  const replyMutation = useMutation({
    mutationFn: () => replyToFeedback({ id: item.id, body: trimmedBody }),
    onSuccess: () => {
      setBody('');
      refreshThread();
      invalidateLists();
    },
    onError: () => displayToast('Could not send your reply, try again'),
  });

  const statusMutation = useMutation({
    mutationFn: (status: FeedbackStatus) =>
      updateFeedbackStatus({
        id: item.id,
        status,
        message: trimmedBody || undefined,
      }),
    onSuccess: (data) => {
      setBody('');
      queryClient.setQueryData<FeedbackItem>(
        feedbackQueryOptions({ id: item.id }).queryKey,
        (current) => (current ? { ...current, ...data } : current),
      );
      invalidateLists();
      displayToast(statusToasts[data.status] ?? 'Feedback updated');
    },
    onError: () => displayToast('Could not update the status, try again'),
  });

  const isBusy = replyMutation.isPending || statusMutation.isPending;

  return (
    <div className="flex flex-col gap-4">
      <article className="rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`${badgeClassName} text-text-secondary`}>
            {getFeedbackCategoryLabel(item.category)}
          </span>
          <span
            className={`${badgeClassName} ${getFeedbackStatusClassName(
              item.status,
            )}`}
          >
            {getFeedbackStatusLabel(item.status, isTeam)}
          </span>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="ml-auto"
          >
            {format(new Date(item.createdAt), 'dd MMM yyyy, HH:mm')}
          </Typography>
        </div>

        {isTeam && item.user && (
          <Link href={`/team/users/${item.user.id}/feedback`}>
            <a className="mt-3 flex w-fit items-center gap-2 rounded-12 pr-2 transition-colors hover:bg-surface-hover">
              <ProfilePicture
                user={{
                  ...item.user,
                  image: item.user.image ?? '',
                  name: item.user.name ?? undefined,
                  username: item.user.username ?? undefined,
                }}
                size={ProfileImageSize.Small}
              />
              <Typography type={TypographyType.Callout} bold>
                {item.user.name || item.user.username || item.user.id}
              </Typography>
              {item.user.username && (
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  @{item.user.username}
                </Typography>
              )}
            </a>
          </Link>
        )}

        <Typography
          type={TypographyType.Body}
          className="mt-3 whitespace-pre-wrap break-words"
        >
          {item.description}
        </Typography>

        {item.screenshotUrl && (
          <a
            href={item.screenshotUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block"
          >
            <img
              src={item.screenshotUrl}
              alt="Feedback screenshot"
              className="max-h-64 w-auto rounded-12 border border-border-subtlest-tertiary"
            />
          </a>
        )}

        {isTeam && item.linearIssueUrl && (
          <Button
            className="mt-3 w-fit"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            tag="a"
            href={item.linearIssueUrl}
            target="_blank"
            rel="noopener noreferrer"
            icon={<OpenLinkIcon />}
          >
            Open in Linear
          </Button>
        )}
      </article>

      {isTeam && <TeamDetails item={item} />}

      {item.replies.length > 0 && (
        <div className="flex flex-col gap-3">
          {item.replies.map((reply) => (
            <div
              key={reply.id}
              className={classNames(
                'rounded-16 border border-border-subtlest-tertiary p-4',
                reply.isTeam ? 'bg-surface-float' : 'bg-background-default',
              )}
            >
              <ReplyAuthor reply={reply} />
              <Typography
                type={TypographyType.Callout}
                className="mt-2 whitespace-pre-wrap break-words"
              >
                {reply.body}
              </Typography>
            </div>
          ))}
        </div>
      )}

      {canReply ? (
        <form
          className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (trimmedBody && !isBusy) {
              replyMutation.mutate();
            }
          }}
        >
          <Textarea
            inputId="feedback-reply"
            label="Reply"
            placeholder={
              isTeam ? 'Write a reply to the user…' : 'Add to this thread…'
            }
            value={body}
            valueChanged={setBody}
            maxLength={FEEDBACK_REPLY_MAX_LENGTH}
            rows={4}
            fieldType="tertiary"
            disabled={isBusy}
          />
          {!isTeam && isClosed && (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Replying reopens this feedback for the team.
            </Typography>
          )}
          {isTeam && (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              The user gets an email for every team reply. Text in the box is
              sent along with a status change.
            </Typography>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="submit"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              disabled={!trimmedBody || isBusy}
              loading={replyMutation.isPending}
            >
              Send reply
            </Button>
            <div className="ml-auto flex flex-wrap gap-2">
              {isTeam &&
                (isClosed ? (
                  <Button
                    type="button"
                    variant={ButtonVariant.Secondary}
                    size={ButtonSize.Small}
                    disabled={isBusy}
                    onClick={() =>
                      statusMutation.mutate(FeedbackStatus.Accepted)
                    }
                  >
                    Reopen
                  </Button>
                ) : (
                  teamStatusActions.map((action) => (
                    <Button
                      key={action.status}
                      type="button"
                      variant={action.variant}
                      size={ButtonSize.Small}
                      disabled={isBusy}
                      onClick={() => statusMutation.mutate(action.status)}
                    >
                      {action.label}
                    </Button>
                  ))
                ))}
              {!isTeam && isOwner && !isClosed && (
                <Button
                  type="button"
                  variant={ButtonVariant.Secondary}
                  size={ButtonSize.Small}
                  disabled={isBusy}
                  onClick={() =>
                    statusMutation.mutate(FeedbackStatus.Completed)
                  }
                >
                  Mark as resolved
                </Button>
              )}
            </div>
          </div>
        </form>
      ) : (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          This feedback is closed.
        </Typography>
      )}
    </div>
  );
};
