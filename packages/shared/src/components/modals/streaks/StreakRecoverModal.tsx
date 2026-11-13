import type { ReactElement } from 'react';
import React, { useEffect, useId } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { ModalSize } from '../common/types';
import { ModalBody } from '../common/ModalBody';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import type { LoggedUser } from '../../../lib/user';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import type { ButtonProps } from '../../buttons/Button';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import type { UseStreakRecoverReturn } from '../../../hooks/streaks/useStreakRecover';
import { useStreakRecover } from '../../../hooks/streaks/useStreakRecover';
import { getStreakEarnedBackCopy } from '../../../hooks/streaks/useStreakEarnBackProgress';
import { Checkbox } from '../../fields/Checkbox';
import { ModalClose } from '../common/ModalClose';
import { cloudinaryStreakLost } from '../../../lib/image';
import { useReadingStreak } from '../../../hooks/streaks';
import { useAuthContext } from '../../../contexts/AuthContext';
import { formatCoresCurrency } from '../../../lib/utils';
import type { UserStreakRecoverData } from '../../../graphql/users';
import { CoreIcon } from '../../icons';
import { coresDocsLink } from '../../../lib/constants';
import { anchorDefaultRel } from '../../../lib/strings';
import { StreakFreezeUpsell } from '../../streak/StreakFreezeUpsell';
import { CoresBalanceNote } from '../../cores/CoresBalanceNote';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureStreakSoftBreak } from '../../../lib/featureManagement';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { generateQueryKey, RequestKey } from '../../../lib/query';

export interface StreakRecoverModalProps extends Pick<
  ModalProps,
  'isOpen' | 'onAfterClose'
> {
  onRequestClose: () => void;
  user: LoggedUser;
}

const StreakRecoverCover = () => (
  <div className="overflow-hidden tablet:-mx-4" role="presentation" aria-hidden>
    <img
      alt="Broken reading streak"
      className="h-auto w-full object-contain"
      loading="lazy"
      src={cloudinaryStreakLost}
    />
  </div>
);

const StreakRecoverHeading = ({
  days,
  isSoftBreak,
}: {
  days: number;
  isSoftBreak: boolean;
}) => (
  <Typography
    className="-mx-1 -mb-1 text-center font-bold"
    tag={TypographyTag.H3}
    type={TypographyType.Title1}
    data-testid="streak-recover-modal-heading"
  >
    {isSoftBreak ? (
      <>
        Your best:
        <span className="text-accent-bacon-default"> {days} days</span>. Today
        can be day 1.
      </>
    ) : (
      <>
        Oh no! Your
        <span className="text-accent-bacon-default">
          {' '}
          {days} day streak{' '}
        </span>{' '}
        has been broken!
      </>
    )}
  </Typography>
);

const StreakRecoveryCopy = ({
  recover,
}: {
  recover: UserStreakRecoverData;
}) => {
  const { user } = useAuthContext();
  const isFree = recover.cost === 0;
  const balance = user?.balance.amount ?? 0;
  const canRecover = balance >= recover.cost;
  const coresLink = (
    <a
      target="_blank"
      rel={anchorDefaultRel}
      href={coresDocsLink}
      title="What are Cores?"
      className="text-text-link hover:underline"
    >
      Cores
    </a>
  );

  const isFreeText = (
    <>
      Lucky you! The first streak restore is on us 🎁. This usually costs{' '}
      {formatCoresCurrency(recover.regularCost ?? 100)} {coresLink}. Be sure to
      come prepared next time!
    </>
  );
  const canRecoverText = (
    <>
      Maintain your streak!
      <br />
      Use {recover.cost} {coresLink} to keep going.
    </>
  );
  const noRecoverText = (
    <>You don&apos;t have enough {coresLink} to restore your streak.</>
  );

  return (
    <Typography
      className="text-center"
      tag={TypographyTag.P}
      type={TypographyType.Body}
      data-testid="streak-recovery-copy"
    >
      {isFree && isFreeText}
      {!isFree && (canRecover ? canRecoverText : noRecoverText)}
    </Typography>
  );
};

const StreakRecoverButton = ({
  recover,
  ...props
}: { recover: UserStreakRecoverData } & ButtonProps<'button'>) => {
  const { user } = useAuthContext();
  const balance = user?.balance.amount ?? 0;

  return (
    <Button
      {...props}
      className="relative gap-1"
      variant={ButtonVariant.Primary}
      size={ButtonSize.Large}
      data-testid="streak-recover-button"
    >
      {recover.cost > balance ? 'Buy Cores' : 'Restore my streak'}
      <CoreIcon />
      {recover.cost === 0 ? 'Free' : formatCoresCurrency(recover.cost)}
    </Button>
  );
};

// Earn-back progress: one segment per new post read since the reset
const StreakEarnBackProgress = ({
  postsRead,
  postsRequired,
}: {
  postsRead: number;
  postsRequired: number;
}) => {
  const read = Math.min(postsRead, postsRequired);

  return (
    <div
      className="flex flex-col gap-2"
      data-testid="streak-earn-back-progress"
    >
      <div className="flex items-center justify-between gap-2">
        <Typography tag={TypographyTag.P} type={TypographyType.Callout} bold>
          Read {postsRequired} posts to bring it back
        </Typography>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {read}/{postsRequired}
        </Typography>
      </div>
      <div
        className="flex gap-1"
        role="progressbar"
        aria-label="Posts read to bring your streak back"
        aria-valuemin={0}
        aria-valuemax={postsRequired}
        aria-valuenow={read}
      >
        {Array.from({ length: postsRequired }, (_, index) => (
          <span
            key={index}
            data-testid="streak-earn-back-segment"
            data-filled={index < read}
            className={classNames(
              'h-1.5 flex-1 rounded-full',
              index < read ? 'bg-accent-bacon-default' : 'bg-surface-float',
            )}
          />
        ))}
      </div>
    </div>
  );
};

export const StreakRecoverOptout = ({
  hideForever,
  id,
  className,
  compact = false,
}: {
  id: string;
  className?: string;
  compact?: boolean;
} & Pick<UseStreakRecoverReturn, 'hideForever'>): ReactElement => (
  <div className={className ?? 'flex flex-row items-center justify-center'}>
    <Checkbox
      aria-labelledby={`showAgain-label-${id}`}
      checked={hideForever.isChecked}
      className={compact ? '!w-5 !p-0 !pr-0' : '!pr-0'}
      checkmarkClassName={compact ? 'mr-2 h-4 w-4 rounded-4' : undefined}
      data-testid="streak-recover-optout"
      id={`showAgain-${id}`}
      name="showAgain"
      onToggleCallback={hideForever.toggle}
    />
    <Typography
      aria-label="Never show 'reading streak recover' popup again"
      className={compact ? 'cursor-pointer py-0' : 'cursor-pointer py-2.5'}
      htmlFor={`showAgain-${id}`}
      id={`showAgain-label-${id}`}
      tag={TypographyTag.Label}
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
    >
      {compact ? 'Hide this' : 'Never show this again'}
    </Typography>
  </div>
);

export const StreakRecoverModal = (
  props: StreakRecoverModalProps,
): ReactElement | null => {
  const { isOpen, onRequestClose, onAfterClose, user } = props;
  const { isStreaksEnabled } = useReadingStreak();
  const id = useId();
  const client = useQueryClient();
  const { recover, hideForever, onClose, onRecover, onStartReading } =
    useStreakRecover({
      onAfterClose,
      onRequestClose,
    });
  const { logEvent } = useLogContext();
  const { value: isSoftBreak } = useConditionalFeature({
    feature: featureStreakSoftBreak,
    shouldEvaluate: recover.canRecover && !recover.isLoading,
  });
  const { isEarnedBack } = recover;
  const isEarnBack = recover.earnBack && recover.postsRequired > 0;

  useEffect(() => {
    if (!isEarnedBack || !user) {
      return;
    }

    client.invalidateQueries({
      queryKey: generateQueryKey(RequestKey.UserStreak, user),
    });
  }, [client, isEarnedBack, user]);

  if (
    !user ||
    !isStreaksEnabled ||
    (!recover.canRecover && !isEarnedBack) ||
    recover.isLoading
  ) {
    return null;
  }

  if (isEarnedBack) {
    return (
      <Modal
        isOpen={isOpen}
        isDrawerOnMobile={isOpen}
        onRequestClose={onClose}
        size={ModalSize.XSmall}
      >
        <ModalClose
          aria-label="Close streak recover popup"
          onClick={onClose}
          title="Close streak recover popup"
        />
        <ModalBody className="!p-4">
          <div className="flex flex-col gap-4">
            <Typography
              className="text-center font-bold"
              tag={TypographyTag.H3}
              type={TypographyType.Title1}
              data-testid="streak-earned-back-heading"
            >
              {getStreakEarnedBackCopy(recover.oldStreakLength)}
            </Typography>
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Large}
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </ModalBody>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      isDrawerOnMobile={isOpen}
      onRequestClose={onClose}
      size={ModalSize.XSmall}
    >
      <ModalClose
        aria-label="Close streak recover popup"
        onClick={onClose}
        title="Close streak recover popup"
      />
      <ModalBody className="!p-4">
        <div className="flex flex-col gap-4">
          <StreakRecoverCover />
          <StreakRecoverHeading
            days={recover.oldStreakLength}
            isSoftBreak={isSoftBreak}
          />
          <StreakRecoveryCopy recover={recover} />
          {isEarnBack && (
            <StreakEarnBackProgress
              postsRead={recover.postsRead}
              postsRequired={recover.postsRequired}
            />
          )}
          {isEarnBack ? (
            <>
              <Button
                variant={ButtonVariant.Primary}
                size={ButtonSize.Large}
                onClick={onStartReading}
              >
                Start reading
              </Button>
              <Button
                className="gap-1"
                variant={ButtonVariant.Secondary}
                size={ButtonSize.Large}
                onClick={onRecover}
                loading={recover.isRecoverPending}
                data-testid="streak-recover-button"
              >
                Restore instantly ·{' '}
                {recover.cost === 0
                  ? 'Free'
                  : `${formatCoresCurrency(recover.cost)} Cores`}
              </Button>
            </>
          ) : (
            <StreakRecoverButton
              onClick={onRecover}
              recover={recover}
              loading={recover.isRecoverPending}
            />
          )}
          {recover.cost > 0 && (
            <CoresBalanceNote price={recover.cost} className="-mt-2" />
          )}
          {isSoftBreak && !isEarnBack && (
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Large}
              onClick={() => {
                logEvent({
                  event_name: LogEvent.Click,
                  target_type: TargetType.StreakSoftBreak,
                });
                onClose?.();
              }}
            >
              Start again
            </Button>
          )}
          <StreakFreezeUpsell>
            Get streak freezes for next time
          </StreakFreezeUpsell>
          <StreakRecoverOptout id={id} hideForever={hideForever} />
        </div>
      </ModalBody>
    </Modal>
  );
};

export default StreakRecoverModal;
