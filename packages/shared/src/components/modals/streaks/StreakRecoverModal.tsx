import type { ReactElement } from 'react';
import React, { useId } from 'react';
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
import {
  getCurrentTier,
  getNextMilestone,
  RewardType,
} from '../../../lib/streakMilestones';
import { MILESTONE_ICON_URLS } from '../../streak/popup/icons/milestoneIcons';

export interface StreakRecoverModalProps
  extends Pick<ModalProps, 'isOpen' | 'onAfterClose'> {
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

const StreakRecoverHeading = ({ days }: { days: number }) => (
  <Typography
    className="-mx-1 -mb-1 text-center font-bold"
    tag={TypographyTag.H3}
    type={TypographyType.Title1}
    data-testid="streak-recover-modal-heading"
  >
    Oh no! Your
    <span className="text-accent-bacon-default"> {days} day streak </span> has
    been broken!
  </Typography>
);

const StreakRecoveryCopy = ({
  recover,
}: {
  recover: UserStreakRecoverData;
}) => {
  const { user } = useAuthContext();
  const isFree = recover.cost === 0;
  const canRecover = user.balance.amount >= recover.cost;
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

const StreakRecoverMilestoneProgress = ({
  streakDays,
}: {
  streakDays: number;
}): ReactElement | null => {
  const currentTier = getCurrentTier(streakDays);
  const nextMilestone = getNextMilestone(streakDays);

  if (!nextMilestone) {
    return null;
  }

  const rangeStart = currentTier.day;
  const rangeEnd = nextMilestone.day;
  const daysLeft = rangeEnd - streakDays;
  const progress =
    ((streakDays - rangeStart) / Math.max(rangeEnd - rangeStart, 1)) * 100;
  const safeProgress = Math.min(Math.max(progress, 0), 100);
  const rewardTypeIcon: Record<RewardType, ReactElement | string> = {
    [RewardType.Cores]: <CoreIcon className="inline size-4" />,
    [RewardType.Cosmetic]: '✨',
    [RewardType.Perk]: '⚡',
  };

  return (
    <div className="flex flex-col gap-1.5 rounded-12 border border-border-subtlest-tertiary bg-background-default px-3 py-2">
      <div className="flex items-center gap-1.5">
        <img
          src={MILESTONE_ICON_URLS[nextMilestone.tier]}
          alt={nextMilestone.label}
          className="size-5 object-contain grayscale"
        />
        <Typography
          type={TypographyType.Footnote}
          className="rounded-6 bg-surface-float px-1.5 py-0.5"
          color={TypographyColor.Primary}
          bold
        >
          {nextMilestone.label}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {daysLeft === 1 ? '1 day left' : `${daysLeft} days left`}
        </Typography>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-bold tabular-nums typo-body text-text-quaternary">
          {rangeStart}
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-4 bg-surface-float">
          <div
            className="h-full bg-accent-bacon-default"
            style={{ width: `${safeProgress}%` }}
          />
        </div>
        <span className="font-bold tabular-nums typo-body text-text-primary">
          {rangeEnd}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        {nextMilestone.rewards.map((reward) => (
          <Typography
            key={reward.description}
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {rewardTypeIcon[reward.type]} {reward.description}
          </Typography>
        ))}
      </div>
    </div>
  );
};

const StreakRecoverButton = ({
  recover,
  ...props
}: { recover: UserStreakRecoverData } & ButtonProps<'button'>) => {
  const { user } = useAuthContext();

  return (
    <Button
      {...props}
      className="relative mx-1 gap-1 overflow-hidden"
      style={{ animation: 'streak-recover-cta-pop 2.2s ease-in-out infinite' }}
      variant={ButtonVariant.Primary}
      size={ButtonSize.Large}
      data-testid="streak-recover-button"
    >
      <span className="pointer-events-none absolute inset-0 z-1 animate-streak-shine bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      {recover.cost > user.balance.amount ? 'Buy Cores' : 'Restore my streak'}
      <span className="relative z-2 inline-flex items-center gap-1">
        <CoreIcon />
        {recover.cost === 0 ? 'Free' : formatCoresCurrency(recover.cost)}
      </span>
    </Button>
  );
};

export const StreakRecoverOptout = ({
  hideForever,
  id,
}: {
  id: string;
} & Pick<UseStreakRecoverReturn, 'hideForever'>): ReactElement => (
  <div className="flex h-[30px] flex-row items-center justify-center gap-0">
    <Checkbox
      aria-labelledby={`showAgain-label-${id}`}
      checked={hideForever.isChecked}
      className="!pr-0"
      data-testid="streak-recover-optout"
      id={`showAgain-${id}`}
      name="showAgain"
      onToggleCallback={hideForever.toggle}
    />
    <Typography
      aria-label="Never show 'reading streak recover' popup again"
      className="cursor-pointer py-2.5"
      htmlFor={`showAgain-${id}`}
      id={`showAgain-label-${id}`}
      tag={TypographyTag.Label}
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
    >
      Never show this again
    </Typography>
  </div>
);

export const StreakRecoverModal = (
  props: StreakRecoverModalProps,
): ReactElement => {
  const { isOpen, onRequestClose, onAfterClose, user } = props;
  const { isStreaksEnabled } = useReadingStreak();

  const id = useId();
  const { recover, hideForever, onClose, onRecover } = useStreakRecover({
    onAfterClose,
    onRequestClose,
  });

  if (!user || !isStreaksEnabled || !recover.canRecover || recover.isLoading) {
    return null;
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
          <StreakRecoverHeading days={recover.oldStreakLength} />
          <StreakRecoveryCopy recover={recover} />
          <StreakRecoverMilestoneProgress streakDays={recover.oldStreakLength} />
          <StreakRecoverButton
            onClick={onRecover}
            recover={recover}
            loading={recover.isRecoverPending}
          />
          <StreakRecoverOptout id={id} hideForever={hideForever} />
        </div>
      </ModalBody>
      <style>{`
        @keyframes streak-recover-cta-pop {
          0%, 58%, 100% {
            transform: scale(1);
          }
          65% {
            transform: scale(1.035);
          }
          76% {
            transform: scale(0.992);
          }
        }
      `}</style>
    </Modal>
  );
};

export default StreakRecoverModal;
