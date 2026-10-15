import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from '../../../../components/utilities/Link';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../../components/ProfilePicture';
import { ReputationUserBadge } from '../../../../components/ReputationUserBadge';
import { FlexCol, FlexRow } from '../../../../components/utilities';
import { ShellPage } from '../../../../components/shell/ShellPageContext';
import { IconSize } from '../../../../components/Icon';
import { ArrowIcon } from '../../../../components/icons/Arrow';
import { FlagIcon } from '../../../../components/icons/Flag';
import { ShieldWarningIcon } from '../../../../components/icons/ShieldWarning';
import { LazyModal } from '../../../../components/modals/common/types';
import { reportUserReasons } from '../../../../components/modals/report/ReportUserModal';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLogContext } from '../../../../contexts/LogContext';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import useLogEventOnce from '../../../../hooks/log/useLogEventOnce';
import type { ApiErrorResult } from '../../../../graphql/common';
import { ApiError, getApiError } from '../../../../graphql/common';
import type { ReportReason } from '../../../../report';
import { LogEvent, TargetType } from '../../../../lib/log';
import { dmConversationsQueryKey } from '../../../messages/queries';
import { getMessagesUrl } from '../../../messages/urls';
import type { LfgReachOut } from '../../types';
import { LfgAskType, LfgReachOutStatus } from '../../types';
import {
  acceptLfgReachOut,
  declineLfgReachOut,
  reportLfgReachOut,
  restoreLfgReachOut,
} from '../../graphql';
import {
  invalidateLfgReachOutQueries,
  lfgReachOutQueryOptions,
} from '../../queries';
import { getLfgReachOutUrl } from '../../lib/format';
import { LfgContextCard } from '../LfgContextCard';
import { LfgReceipts } from '../LfgReceipts';
import { LfgVerifiedLink } from '../reachOut/LfgLinkVerification';

const SectionLabel = ({ children }: { children: string }): ReactElement => (
  <Typography
    type={TypographyType.Footnote}
    color={TypographyColor.Tertiary}
    bold
  >
    {children}
  </Typography>
);

const ReachOutBody = ({
  reachOut,
}: {
  reachOut: LfgReachOut;
}): ReactElement => {
  const { post, sender } = reachOut;
  const answers = new Map(
    reachOut.answers.map((answer) => [answer.askId, answer]),
  );

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <FlexCol className="mx-auto w-full max-w-[45rem] gap-5 px-4 py-6 tablet:px-6">
        <LfgContextCard post={post} label="Responding to your post" />
        {reachOut.filtered && (
          <div className="flex items-start gap-2 rounded-12 border border-status-warning px-3 py-2">
            <ShieldWarningIcon
              size={IconSize.Size16}
              className="mt-0.5 shrink-0 text-status-warning"
            />
            <Typography
              type={TypographyType.Footnote}
              className="min-w-0 flex-1"
            >
              This looks like spam, so it didn&apos;t notify you. Selling
              services or hiring isn&apos;t allowed on Looking for group.
            </Typography>
          </div>
        )}
        <FlexCol className="gap-2">
          <SectionLabel>Pitch</SectionLabel>
          <p className="w-fit max-w-full whitespace-pre-wrap break-words rounded-16 rounded-bl-4 border border-border-subtlest-tertiary px-3 py-2 text-text-primary typo-callout">
            {reachOut.pitch}
          </p>
        </FlexCol>
        {post.asks.length > 0 && (
          <FlexCol className="gap-3">
            <SectionLabel>What you asked for</SectionLabel>
            {post.asks.map((ask) => {
              const answer = answers.get(ask.id);

              return (
                <FlexCol key={ask.id} className="gap-0.5">
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    {ask.label}
                  </Typography>
                  {ask.type === LfgAskType.Link && answer ? (
                    <>
                      <a
                        href={answer.value}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="break-all text-text-link typo-callout hover:underline"
                      >
                        {answer.value}
                      </a>
                      {answer.verified && <LfgVerifiedLink isOwn={false} />}
                    </>
                  ) : (
                    <Typography
                      type={TypographyType.Callout}
                      className="break-words"
                    >
                      {answer?.value}
                    </Typography>
                  )}
                </FlexCol>
              );
            })}
          </FlexCol>
        )}
        <FlexCol className="gap-3">
          <SectionLabel>{`About ${sender.name}`}</SectionLabel>
          <LfgReceipts person={sender} />
        </FlexCol>
      </FlexCol>
    </div>
  );
};

const ReachOutResponse = ({
  reachOut,
}: {
  reachOut: LfgReachOut;
}): ReactElement => {
  const router = useRouter();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { openModal, closeModal } = useLazyModal();
  const { sender } = reachOut;
  const log = (eventName: LogEvent, extra?: Record<string, unknown>) =>
    logEvent({
      event_name: eventName,
      target_type: TargetType.LfgReachOut,
      target_id: reachOut.id,
      extra: JSON.stringify({
        post_id: reachOut.post.id,
        filtered: !!reachOut.filtered,
        ...extra,
      }),
    });
  const afterAnswer = () => invalidateLfgReachOutQueries(queryClient, user);
  const toList = () => router.replace(getLfgReachOutUrl());

  const accept = useMutation({
    mutationFn: () => acceptLfgReachOut(reachOut.id),
    onSuccess: () => {
      log(LogEvent.AcceptLfgReachOut);
      afterAnswer();
      queryClient.invalidateQueries({
        queryKey: dmConversationsQueryKey(user),
      });
      router.replace(getMessagesUrl(sender.id));
    },
    onError: (error: ApiErrorResult) =>
      displayToast(
        getApiError(error, ApiError.Forbidden)?.message ??
          "Couldn't accept the request. Please try again.",
      ),
  });

  const restore = useMutation({
    mutationFn: () => restoreLfgReachOut(reachOut.id),
    onSuccess: () => {
      log(LogEvent.RestoreLfgReachOut);
      afterAnswer();
      router.replace(getLfgReachOutUrl(reachOut.id));
    },
    onError: () => displayToast("Couldn't undo it. Please try again."),
  });

  const decline = useMutation({
    mutationFn: () => declineLfgReachOut(reachOut.id),
    onSuccess: () => {
      log(LogEvent.DeclineLfgReachOut);
      afterAnswer();
      displayToast("Declined. They won't be told.", {
        persistent: true,
        action: { copy: 'Undo', onClick: () => restore.mutate() },
      });
      toList();
    },
    onError: () =>
      displayToast("Couldn't decline the request. Please try again."),
  });

  const report = useMutation({
    mutationFn: ({
      reason,
      comment,
    }: {
      reason: ReportReason;
      comment?: string;
    }) => reportLfgReachOut({ id: reachOut.id, reason, comment }),
    onSuccess: (_, { reason }) => {
      log(LogEvent.ReportLfgReachOut, { reason });
      afterAnswer();
      displayToast(
        "Reported and blocked. We'll review the account and their other requests.",
      );
      toList();
    },
    onError: () => displayToast("Couldn't send the report. Please try again."),
    onSettled: () => closeModal(),
  });

  const onReport = () =>
    openModal({
      type: LazyModal.ReasonSelection,
      props: {
        isDrawerOnMobile: true,
        heading: 'Select reason for reporting',
        reasons: reportUserReasons,
        footer: (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="min-w-0 shrink"
          >
            {`${sender.name} is also blocked, and their other requests to you are declined.`}
          </Typography>
        ),
        onReport: (event, reason, comment) => {
          event.preventDefault();
          report.mutate({ reason: reason as ReportReason, comment });
        },
      },
    });

  const isPending = accept.isPending || decline.isPending || report.isPending;

  return (
    <div className="mx-4 mb-4 flex shrink-0 flex-col items-center gap-3 rounded-16 border border-border-subtlest-tertiary px-4 py-4 text-center tablet:mx-6">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        @{sender.username} wants to message you about your post. They won&apos;t
        know you saw this unless you accept.
      </Typography>
      <FlexRow className="gap-2">
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<FlagIcon />}
          disabled={isPending}
          onClick={onReport}
        >
          Report
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          disabled={isPending}
          loading={decline.isPending}
          onClick={() => decline.mutate()}
        >
          Decline
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          disabled={isPending}
          loading={accept.isPending}
          onClick={() => accept.mutate()}
        >
          Accept
        </Button>
      </FlexRow>
    </div>
  );
};

// A reach-out to one of the viewer's posts, in the pane a thread takes.
export const LfgReachOutDetail = ({
  reachOutId,
}: {
  reachOutId: string;
}): ReactElement => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { data: reachOut, isPending } = useQuery(
    lfgReachOutQueryOptions(user, reachOutId),
  );
  const listUrl = getLfgReachOutUrl();
  const sender = reachOut?.sender;
  const isWaiting = reachOut?.status === LfgReachOutStatus.Pending;

  useLogEventOnce(
    () => ({
      event_name: LogEvent.OpenLfgReachOut,
      target_type: TargetType.LfgReachOut,
      target_id: reachOutId,
      extra: JSON.stringify({ filtered: !!reachOut?.filtered }),
    }),
    { condition: !!reachOut },
  );

  return (
    <FlexCol className="min-h-0 flex-1">
      <ShellPage
        title={
          sender && (
            <span className="flex min-w-0 items-center gap-2">
              <ProfilePicture user={sender} size={ProfileImageSize.Small} />
              <span className="truncate">{sender.name}</span>
            </span>
          )
        }
        onBack={() => router.replace(listUrl)}
      />
      <header className="hidden h-14 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary px-3 tablet:flex tablet:px-4">
        <Link href={listUrl} passHref>
          <Button
            tag="a"
            className="laptop:hidden"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<ArrowIcon className="-rotate-90" />}
            aria-label="Back to requests"
          />
        </Link>
        {sender && (
          <Link href={sender.permalink} passHref>
            <a className="flex min-w-0 flex-1 items-center gap-2">
              <ProfilePicture user={sender} size={ProfileImageSize.Medium} />
              <FlexCol className="min-w-0">
                <span className="flex items-center gap-1">
                  <Typography type={TypographyType.Callout} bold truncate>
                    {sender.name}
                  </Typography>
                  <ReputationUserBadge user={sender} disableTooltip />
                </span>
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                  truncate
                >
                  @{sender.username}
                </Typography>
              </FlexCol>
            </a>
          </Link>
        )}
      </header>
      {isPending && (
        <FlexCol className="mx-auto w-full max-w-[45rem] gap-3 px-4 py-6">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-12 bg-surface-float"
            />
          ))}
        </FlexCol>
      )}
      {!isPending && !reachOut && (
        <FlexCol className="flex-1 items-center justify-center px-6 text-center">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            This request isn&apos;t available anymore.
          </Typography>
        </FlexCol>
      )}
      {reachOut && <ReachOutBody reachOut={reachOut} />}
      {reachOut && isWaiting && <ReachOutResponse reachOut={reachOut} />}
    </FlexCol>
  );
};
