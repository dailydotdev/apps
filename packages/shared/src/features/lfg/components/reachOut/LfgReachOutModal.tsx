import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, ButtonVariant } from '../../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import type { LazyModalCommonProps } from '../../../../components/modals/common/Modal';
import { Modal } from '../../../../components/modals/common/Modal';
import { ModalSize } from '../../../../components/modals/common/types';
import { Justify } from '../../../../components/utilities/common';
import Textarea from '../../../../components/fields/Textarea';
import { TextField } from '../../../../components/fields/TextField';
import { IconSize } from '../../../../components/Icon';
import { LinkIcon } from '../../../../components/icons/Link';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLogContext } from '../../../../contexts/LogContext';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import { useViewSize, ViewSize } from '../../../../hooks/useViewSize';
import type { ApiErrorResult } from '../../../../graphql/common';
import { ApiError, getApiError } from '../../../../graphql/common';
import type { Origin } from '../../../../lib/log';
import { LogEvent, TargetType } from '../../../../lib/log';
import { useDmSettings } from '../../../messages/hooks/useDmSettings';
import { LfgMessagesOffNotice } from '../LfgMessagesOffNotice';
import type { LfgPost } from '../../types';
import { LfgAskType } from '../../types';
import {
  LFG_ANSWER_MAX_LENGTH,
  LFG_DAILY_REACH_OUTS,
  LFG_PITCH_MAX_LENGTH,
} from '../../constants';
import { sendLfgReachOut } from '../../graphql';
import {
  lfgBoardQueryKey,
  lfgPersonQueryOptions,
  lfgPostQueryKey,
  lfgReachOutsLeftQueryKey,
  lfgReachOutsLeftQueryOptions,
  userLfgPostQueryKey,
} from '../../queries';
import { getFirstName } from '../../lib/format';
import { LfgContextCard } from '../LfgContextCard';
import { LfgReceipts } from '../LfgReceipts';
import { LfgStandOut } from './LfgStandOut';
import {
  isHttpUrl,
  isOwnGithubRepo,
  LfgUnverifiedLink,
  LfgVerifiedLink,
} from './LfgLinkVerification';

export type LfgReachOutModalProps = LazyModalCommonProps & {
  post: LfgPost;
  origin: Origin;
};

const Notice = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex items-start gap-2 rounded-12 bg-surface-float px-3 py-2 text-text-secondary typo-footnote">
    <span className="min-w-0 flex-1">{children}</span>
  </div>
);

const SectionLabel = ({ children }: { children: ReactNode }): ReactElement => (
  <Typography
    type={TypographyType.Footnote}
    color={TypographyColor.Tertiary}
    bold
  >
    {children}
  </Typography>
);

const sendErrorCopy = (error: ApiErrorResult): string => {
  if (getApiError(error, ApiError.Conflict)) {
    return 'You already reached out about this post.';
  }

  return (
    getApiError(error, ApiError.Forbidden)?.message ??
    getApiError(error, ApiError.GraphqlValidationFailed)?.message ??
    "Couldn't send your request. Please try again."
  );
};

export const LfgReachOutModal = ({
  isOpen,
  onRequestClose,
  post,
  origin,
}: LfgReachOutModalProps): ReactElement => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { allowsMessages } = useDmSettings();
  const isMobile = useViewSize(ViewSize.MobileL);
  const { data: reachOutsLeft } = useQuery(lfgReachOutsLeftQueryOptions(user));
  const { data: me } = useQuery(lfgPersonQueryOptions(user, user?.id ?? ''));
  const [pitch, setPitch] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const first = getFirstName(post.author.name);
  const isOutOfCredits = reachOutsLeft === 0;
  const isMissingAnswer = post.asks.some(
    (ask) =>
      !answers[ask.id]?.trim() ||
      (ask.type === LfgAskType.Link && !isHttpUrl(answers[ask.id])),
  );

  const { mutate: send, isPending } = useMutation({
    mutationFn: () =>
      sendLfgReachOut({
        postId: post.id,
        pitch: pitch.trim(),
        answers: post.asks.map((ask) => ({
          askId: ask.id,
          value: answers[ask.id].trim(),
        })),
      }),
    onSuccess: (myReachOut) => {
      logEvent({
        event_name: LogEvent.SendLfgReachOut,
        target_type: TargetType.LfgPost,
        target_id: post.id,
        extra: JSON.stringify({
          origin,
          kind: post.kind,
          reach_out_id: myReachOut?.id,
          asks: post.asks.length,
          verified_links: post.asks.filter(
            (ask) =>
              ask.type === LfgAskType.Link &&
              isOwnGithubRepo(answers[ask.id], me?.verifiedGithub),
          ).length,
        }),
      });
      queryClient.setQueryData<LfgPost | null>(
        lfgPostQueryKey(user, post.id),
        (current) => current && { ...current, myReachOut },
      );
      queryClient.setQueryData<number>(lfgReachOutsLeftQueryKey(user), (left) =>
        typeof left === 'number' ? Math.max(0, left - 1) : left,
      );
      queryClient.invalidateQueries({ queryKey: lfgBoardQueryKey(user) });
      queryClient.invalidateQueries({
        queryKey: userLfgPostQueryKey(user, post.author.id),
      });
      displayToast("Request sent. You'll hear back here if they accept.");
      onRequestClose();
    },
    onError: async (error: ApiErrorResult) => {
      if (!getApiError(error, ApiError.RateLimited)) {
        displayToast(sendErrorCopy(error));
        return;
      }

      // Out of today's credits, or past the hourly cap on attempts: the
      // credits left tell them apart.
      const left = await queryClient
        .fetchQuery({ ...lfgReachOutsLeftQueryOptions(user), staleTime: 0 })
        .catch(() => 0);
      displayToast(
        left
          ? "You've sent a lot of requests in the last hour. Try again later."
          : "You've used today's reach-outs. They refill tomorrow.",
      );
    },
  });

  const canSend =
    !!pitch.trim() &&
    !isMissingAnswer &&
    !isOutOfCredits &&
    allowsMessages &&
    !isPending;
  const title = `Reach out to ${first}`;
  const creditsLeft =
    typeof reachOutsLeft === 'number' &&
    `${reachOutsLeft} of ${LFG_DAILY_REACH_OUTS} left today`;

  return (
    <Modal
      isOpen={isOpen}
      isDrawerOnMobile
      size={ModalSize.Medium}
      onRequestClose={onRequestClose}
      // A phone's sheet pins the send button under the thumb.
      formProps={{
        form: '',
        title,
        copy: { right: 'Send request' },
        rightButtonProps: {
          type: 'button',
          disabled: !canSend,
          loading: isPending,
          onClick: () => send(),
        },
      }}
    >
      <Modal.Header title={title} />
      <Modal.Body className="flex flex-col gap-5">
        <LfgContextCard
          post={post}
          label={`About ${first}'s post`}
          isLinked={false}
        />

        <div className="flex flex-col gap-2">
          <Textarea
            inputId="lfg-pitch"
            name="pitch"
            label="Your pitch"
            placeholder="I can help with X because I've done Y. Free for Z."
            rows={4}
            maxLength={LFG_PITCH_MAX_LENGTH}
            value={pitch}
            valueChanged={setPitch}
          />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Say why you&apos;re a fit for this post.
          </Typography>
        </div>

        {post.asks.length > 0 && (
          <div className="flex flex-col gap-3">
            <SectionLabel>{first} asked for</SectionLabel>
            {post.asks.map((ask) => {
              const value = answers[ask.id] ?? '';
              const isLink = ask.type === LfgAskType.Link;
              const isOwnRepo = isOwnGithubRepo(value, me?.verifiedGithub);

              return (
                <div key={ask.id} className="flex flex-col gap-1">
                  <TextField
                    inputId={`lfg-ask-${ask.id}`}
                    name={ask.id}
                    label={ask.label}
                    type={isLink ? 'url' : 'text'}
                    placeholder={
                      isLink ? 'https://github.com/you/project' : undefined
                    }
                    leftIcon={
                      isLink ? <LinkIcon size={IconSize.Small} /> : undefined
                    }
                    maxLength={LFG_ANSWER_MAX_LENGTH}
                    showMaxLength={false}
                    value={value}
                    valueChanged={(next) =>
                      setAnswers((prev) => ({ ...prev, [ask.id]: next }))
                    }
                  />
                  {isLink && !!value.trim() && !isHttpUrl(value) && (
                    <span className="text-status-error typo-caption1">
                      Add a link that starts with https://
                    </span>
                  )}
                  {isLink && isHttpUrl(value) && isOwnRepo && (
                    <LfgVerifiedLink isOwn />
                  )}
                  {isLink && isHttpUrl(value) && !isOwnRepo && (
                    <LfgUnverifiedLink isOwn hasGithub={!!me?.verifiedGithub} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {me && <LfgStandOut person={me} />}

        {me && (
          <div className="flex flex-col gap-3">
            <SectionLabel>Sent with your request</SectionLabel>
            <LfgReceipts person={me} />
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Quaternary}
            >
              These come from your profile.
            </Typography>
          </div>
        )}

        <LfgMessagesOffNotice>
          An accepted request turns into a chat, so turn on direct messages to
          reach out.
        </LfgMessagesOffNotice>
        {isMobile && creditsLeft && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="tabular-nums"
          >
            {creditsLeft}
          </Typography>
        )}
        {isOutOfCredits && (
          <Notice>
            You&apos;ve used today&apos;s {LFG_DAILY_REACH_OUTS} reach-outs.
            They refill tomorrow, and every accepted one comes back right away.
          </Notice>
        )}
      </Modal.Body>
      <Modal.Footer justify={Justify.Between}>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="tabular-nums"
        >
          {creditsLeft}
        </Typography>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            onClick={onRequestClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            disabled={!canSend}
            loading={isPending}
            onClick={() => send()}
          >
            Send request
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default LfgReachOutModal;
