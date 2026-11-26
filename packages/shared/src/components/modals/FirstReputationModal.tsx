import type { KeyboardEvent, MouseEvent, ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { ModalClose } from './common/ModalClose';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { Image } from '../image/Image';
import { LockIcon } from '../icons/Lock';
import { ReputationIcon } from '../icons/Reputation';
import { IconSize } from '../Icon';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useLazyModal } from '../../hooks/useLazyModal';
import { cloudinaryReputationPrivilegesUnlocked } from '../../lib/image';
import { reputationPrivileges, webappUrl } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';
import { LogEvent, TargetType } from '../../lib/log';
import type { ReputationEvent } from '../../graphql/reputation';
import {
  firstReputationGainQueryOptions,
  ReputationReason,
} from '../../graphql/reputation';
import {
  REPUTATION_GRANT_THRESHOLD,
  reputationMilestones,
} from '../analytics/reputation/common';

interface FirstReputationCopy {
  /** What the headline names: "Your comment earned …". */
  subject: string;
  /** The link to what earned it. */
  seeLabel: string;
}

const reasonCopy: Partial<Record<ReputationReason, FirstReputationCopy>> = {
  [ReputationReason.CommentUpvoted]: {
    subject: 'Your comment',
    seeLabel: 'See your comment',
  },
  [ReputationReason.PostUpvoted]: {
    subject: 'Your post',
    seeLabel: 'See your post',
  },
  [ReputationReason.PostReportConfirmed]: {
    subject: 'Your report',
    seeLabel: 'See the post',
  },
  [ReputationReason.SourceRequestApproved]: {
    subject: 'Your source request',
    seeLabel: 'See the source',
  },
};

const defaultCopy: FirstReputationCopy = {
  subject: 'You',
  seeLabel: 'See what earned it',
};

const roadMilestones = reputationMilestones.filter(
  (milestone) => milestone.reputation < REPUTATION_GRANT_THRESHOLD,
);

const privilegeUnlocks =
  reputationMilestones.find(
    (milestone) => milestone.reputation === REPUTATION_GRANT_THRESHOLD,
  )?.unlocks ?? [];

const getQuote = (event: ReputationEvent): string | null => {
  if (!event.target?.title) {
    return null;
  }

  if (event.reason === ReputationReason.CommentUpvoted) {
    return `On “${event.target.title}”`;
  }

  return `“${event.target.title}”`;
};

const RoadToPrivileges = ({
  reputation,
}: {
  reputation: number;
}): ReactElement => {
  const next = roadMilestones.find(
    (milestone) => milestone.reputation > reputation,
  );

  return (
    <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-3 text-left">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="flex items-center gap-1 font-bold tabular-nums text-text-primary typo-callout">
            <ReputationIcon
              size={IconSize.Size16}
              className="text-accent-onion-default"
            />
            {reputation.toLocaleString('en-US')}
          </span>
          <span className="tabular-nums text-text-tertiary typo-footnote">
            {(REPUTATION_GRANT_THRESHOLD - reputation).toLocaleString('en-US')}{' '}
            to {REPUTATION_GRANT_THRESHOLD}
          </span>
        </div>
        <div
          className="relative h-2 rounded-4 bg-surface-float"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={REPUTATION_GRANT_THRESHOLD}
          aria-valuenow={reputation}
          aria-label={`Progress to ${REPUTATION_GRANT_THRESHOLD} reputation`}
        >
          <div
            className="h-full rounded-4 bg-accent-onion-default"
            style={{
              width: `${Math.min(reputation / REPUTATION_GRANT_THRESHOLD, 1) * 100}%`,
            }}
          />
          {roadMilestones.map((milestone) => (
            <span
              key={milestone.reputation}
              className={classNames(
                'absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full',
                reputation >= milestone.reputation
                  ? 'bg-background-default'
                  : 'bg-border-subtlest-primary',
              )}
              style={{
                left: `${(milestone.reputation / REPUTATION_GRANT_THRESHOLD) * 100}%`,
              }}
            />
          ))}
        </div>
        {next && (
          <span className="text-text-tertiary typo-caption1">
            Next at {next.reputation}: {next.unlocks[0]}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="font-bold text-text-primary typo-footnote">
          At {REPUTATION_GRANT_THRESHOLD} you unlock
        </span>
        <ul className="flex flex-col gap-1">
          {privilegeUnlocks.map((unlock) => (
            <li
              key={unlock}
              className="flex items-start gap-1.5 text-text-secondary typo-footnote"
            >
              <LockIcon
                size={IconSize.Size16}
                className="shrink-0 text-text-quaternary"
              />
              {unlock}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const FirstReputationModal = ({
  onRequestClose,
  onAfterClose,
  ...modalProps
}: ModalProps): ReactElement | null => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const {
    data: event,
    isSuccess,
    isError,
  } = useQuery(firstReputationGainQueryOptions({ user }));
  const loggedImpression = useRef(false);

  const { closeModal } = useLazyModal();

  const onClose = (e: MouseEvent | KeyboardEvent) => {
    onRequestClose?.(e);
  };

  useEffect(() => {
    // The gain was revoked before the moment opened: nothing to show
    if (isSuccess && event === null) {
      onAfterClose?.();
      closeModal();
      return;
    }

    // Keep the alert so the moment comes back on the next load
    if (isError) {
      closeModal();
    }
  }, [closeModal, event, isError, isSuccess, onAfterClose]);

  useEffect(() => {
    if (!event || loggedImpression.current) {
      return;
    }

    loggedImpression.current = true;
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.FirstReputation,
      target_id: event.reason,
      extra: JSON.stringify({ amount: event.amount }),
    });
  }, [event, logEvent]);

  if (!event || !user) {
    return null;
  }

  const copy = reasonCopy[event.reason as ReputationReason] ?? defaultCopy;
  const quote = getQuote(event);
  const reputation = Math.min(user.reputation ?? 0, REPUTATION_GRANT_THRESHOLD);

  const onCta = (cta: string) => (e: MouseEvent) => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.FirstReputation,
      target_id: cta,
    });
    onClose(e);
  };

  return (
    <Modal
      {...modalProps}
      onAfterClose={onAfterClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.XSmall}
      className="overflow-y-auto tablet:!max-h-[calc(100vh-5rem)]"
      onRequestClose={onClose}
      isDrawerOnMobile
    >
      <ModalClose className="top-2" onClick={onClose} />
      <div className="flex flex-col items-center gap-6 p-0 text-center tablet:p-6">
        <span className="relative flex size-40 justify-center">
          <Image
            src={cloudinaryReputationPrivilegesUnlocked}
            alt="Reputation badge"
            className="size-[85%]"
          />
          <strong className="absolute bottom-[7%] rounded-8 bg-accent-onion-default px-2 tabular-nums text-white shadow-2 typo-title3">
            +{event.amount}
          </strong>
        </span>
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-text-primary typo-title2">
            {copy.subject} earned +{event.amount} reputation
          </h3>
          {quote && (
            <p className="line-clamp-2 text-text-tertiary typo-callout">
              {quote}
            </p>
          )}
        </div>
        <div className="w-full">
          <RoadToPrivileges reputation={reputation} />
        </div>
        <div className="flex w-full flex-col gap-2">
          <Button
            tag="a"
            href={`${webappUrl}analytics/reputation`}
            className="w-full"
            variant={ButtonVariant.Primary}
            onClick={onCta('reputation')}
          >
            See your reputation
          </Button>
          <Button
            tag="a"
            target="_blank"
            rel={anchorDefaultRel}
            href={reputationPrivileges}
            className="w-full"
            variant={ButtonVariant.Float}
            onClick={onCta('privileges')}
          >
            See all privileges
          </Button>
          {event.target?.permalink && (
            <Button
              tag="a"
              href={event.target.permalink}
              className="w-full"
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
              onClick={onCta('target')}
            >
              {copy.seeLabel}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default FirstReputationModal;
