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
import streakRecoverCoverImage from './streak-recover-cover.png';

export interface StreakRecoverModalProps
  extends Pick<ModalProps, 'isOpen' | 'onAfterClose'> {
  onRequestClose: () => void;
  user: LoggedUser;
  forceOpen?: boolean;
}

const streakRecoverCoverSrc =
  typeof streakRecoverCoverImage === 'string'
    ? streakRecoverCoverImage
    : (streakRecoverCoverImage as { src?: string })?.src;

const StreakRecoverCover = () => (
  <div
    className="relative overflow-hidden bg-transparent tablet:-mx-4"
    role="presentation"
    aria-hidden
  >
    <img
      alt="Broken reading streak"
      className="block h-[150px] w-full bg-transparent object-contain"
      loading="lazy"
      src={streakRecoverCoverSrc || cloudinaryStreakLost}
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
    Oh no! <span className="text-accent-bacon-default">{days} day streak </span>{' '}
    has been broken!
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
      className="underline"
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
      Maintain your streak! Use {recover.cost} {coresLink} to keep going.
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

  return (
    <Button
      {...props}
      className="relative mb-2 mt-2 w-full gap-1 overflow-hidden"
      style={{ animation: 'streak-recover-cta-pop 2.2s ease-in-out infinite' }}
      variant={ButtonVariant.Primary}
      size={ButtonSize.Large}
      data-testid="streak-recover-button"
    >
      <span className="via-white/30 pointer-events-none absolute inset-0 z-1 animate-streak-shine bg-gradient-to-r from-transparent to-transparent" />
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
  <div className="-mt-3 flex h-[30px] flex-row items-center justify-center gap-0">
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
  const { isOpen, onRequestClose, onAfterClose, user, forceOpen } = props;
  const { isStreaksEnabled, streak } = useReadingStreak();

  const id = useId();
  const { recover, hideForever, onClose, onRecover } = useStreakRecover({
    onAfterClose,
    onRequestClose,
  });

  const isPreviewMode =
    !!forceOpen && (recover.isLoading || !recover.canRecover);
  const previewRecover: UserStreakRecoverData & {
    isLoading: boolean;
    isRecoverPending: boolean;
  } = {
    canRecover: true,
    cost: 100,
    regularCost: 100,
    oldStreakLength: Math.max(streak?.current ?? 0, 1),
    isLoading: false,
    isRecoverPending: false,
  };
  const activeRecover = isPreviewMode ? previewRecover : recover;
  const canRecoverAction = !isPreviewMode;

  if (
    !user ||
    !isStreaksEnabled ||
    (!isPreviewMode && (!recover.canRecover || recover.isLoading))
  ) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      isDrawerOnMobile={isOpen}
      onRequestClose={onClose}
      size={ModalSize.XSmall}
      className="tablet:!w-[26.25rem]"
    >
      <ModalClose
        aria-label="Close streak recover popup"
        onClick={onClose}
        top="2"
        right="2"
        zIndex="2"
        title="Close streak recover popup"
      />
      <ModalBody className="relative overflow-hidden !p-4">
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          aria-hidden
        >
          <span className="streak-recover-haze streak-recover-haze-1" />
          <span className="streak-recover-haze streak-recover-haze-2" />
          <span className="streak-recover-dust streak-recover-dust-1" />
          <span className="streak-recover-dust streak-recover-dust-2" />
          <span className="streak-recover-dust streak-recover-dust-3" />
          <span className="streak-recover-dust streak-recover-dust-4" />
          <span className="streak-recover-dust streak-recover-dust-5" />
          <span className="streak-recover-dust streak-recover-dust-6" />
          <span className="streak-recover-dust streak-recover-dust-7" />
          <span className="streak-recover-dust streak-recover-dust-8" />
          <span className="streak-recover-dust streak-recover-dust-9" />
          <span className="streak-recover-dust streak-recover-dust-10" />
          <span className="streak-recover-dust streak-recover-dust-11" />
          <span className="streak-recover-dust streak-recover-dust-12" />
          <span className="streak-recover-dust streak-recover-dust-13" />
          <span className="streak-recover-dust streak-recover-dust-14" />
        </div>
        <div className="relative z-1 flex flex-col gap-4">
          <StreakRecoverCover />
          <StreakRecoverHeading days={activeRecover.oldStreakLength} />
          <StreakRecoveryCopy recover={activeRecover} />
          <StreakRecoverButton
            onClick={canRecoverAction ? onRecover : undefined}
            recover={activeRecover}
            loading={activeRecover.isRecoverPending}
          />
          <StreakRecoverOptout id={id} hideForever={hideForever} />
        </div>
      </ModalBody>
      <style>{`
        .streak-recover-haze {
          position: absolute;
          border-radius: 9999px;
          filter: blur(42px);
          pointer-events: none;
          mix-blend-mode: screen;
          opacity: 0;
          will-change: transform, opacity;
        }

        .streak-recover-haze-1 {
          width: 320px;
          height: 200px;
          left: -10%;
          bottom: -8%;
          background: radial-gradient(
            ellipse at center,
            rgb(255 255 255 / 18%) 0%,
            rgb(255 255 255 / 0%) 72%
          );
          animation: streak-recover-haze-float-1 11.5s ease-in-out infinite;
        }

        .streak-recover-haze-2 {
          width: 290px;
          height: 180px;
          right: -12%;
          bottom: 20%;
          background: radial-gradient(
            ellipse at center,
            rgb(255 255 255 / 14%) 0%,
            rgb(255 255 255 / 0%) 74%
          );
          animation: streak-recover-haze-float-2 13.2s ease-in-out infinite;
          animation-delay: 1.7s;
        }

        .streak-recover-dust {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 9999px;
          background: rgb(255 255 255 / 70%);
          box-shadow: 0 0 10px rgb(255 255 255 / 45%);
          filter: blur(0.2px);
          opacity: 0;
          mix-blend-mode: screen;
          will-change: transform, opacity;
        }

        .streak-recover-dust-1 {
          left: 14%;
          bottom: 6%;
          animation: streak-recover-dust-float 6.2s linear infinite;
        }

        .streak-recover-dust-2 {
          left: 78%;
          bottom: 24%;
          animation: streak-recover-dust-float 7.4s linear infinite;
          animation-delay: 1.3s;
        }

        .streak-recover-dust-3 {
          left: 26%;
          bottom: 52%;
          animation: streak-recover-dust-float 6.8s linear infinite;
          animation-delay: 2.4s;
        }

        .streak-recover-dust-4 {
          left: 64%;
          bottom: 70%;
          animation: streak-recover-dust-float 7.9s linear infinite;
          animation-delay: 0.7s;
        }

        .streak-recover-dust-5 {
          left: 8%;
          bottom: 38%;
          animation: streak-recover-dust-float 8.6s linear infinite;
          animation-delay: 1.8s;
        }

        .streak-recover-dust-6 {
          left: 46%;
          bottom: 18%;
          animation: streak-recover-dust-float 6.6s linear infinite;
          animation-delay: 0.4s;
        }

        .streak-recover-dust-7 {
          left: 90%;
          bottom: 56%;
          animation: streak-recover-dust-float 9.1s linear infinite;
          animation-delay: 2.1s;
        }

        .streak-recover-dust-8 {
          left: 36%;
          bottom: 84%;
          animation: streak-recover-dust-float 7.2s linear infinite;
          animation-delay: 1.1s;
        }

        .streak-recover-dust-9 {
          left: 18%;
          bottom: 26%;
          animation: streak-recover-dust-float-soft 9.4s linear infinite;
          animation-delay: 0.9s;
        }

        .streak-recover-dust-10 {
          left: 56%;
          bottom: 42%;
          animation: streak-recover-dust-float-soft 10.6s linear infinite;
          animation-delay: 2.2s;
        }

        .streak-recover-dust-11 {
          left: 72%;
          bottom: 8%;
          animation: streak-recover-dust-float-soft 8.9s linear infinite;
          animation-delay: 1.5s;
        }

        .streak-recover-dust-12 {
          left: 30%;
          bottom: 66%;
          animation: streak-recover-dust-float-soft 9.8s linear infinite;
          animation-delay: 0.2s;
        }

        .streak-recover-dust-13 {
          left: 6%;
          bottom: 72%;
          animation: streak-recover-dust-float-soft 11.1s linear infinite;
          animation-delay: 2.6s;
        }

        .streak-recover-dust-14 {
          left: 86%;
          bottom: 38%;
          animation: streak-recover-dust-float-soft 10.1s linear infinite;
          animation-delay: 0.6s;
        }

        @keyframes streak-recover-dust-float {
          0% {
            transform: translate3d(0, 0, 0) scale(0.7);
            opacity: 0;
          }
          12% {
            opacity: 0.78;
          }
          72% {
            opacity: 0.36;
          }
          100% {
            transform: translate3d(20px, -120px, 0) scale(1.12);
            opacity: 0;
          }
        }

        @keyframes streak-recover-dust-float-soft {
          0% {
            transform: translate3d(0, 0, 0) scale(0.62);
            opacity: 0;
          }
          16% {
            opacity: 0.52;
          }
          78% {
            opacity: 0.24;
          }
          100% {
            transform: translate3d(14px, -98px, 0) scale(1.06);
            opacity: 0;
          }
        }

        @keyframes streak-recover-haze-float-1 {
          0% {
            transform: translate3d(0, 20px, 0) scale(0.95);
            opacity: 0;
          }
          20% {
            opacity: 0.62;
          }
          68% {
            opacity: 0.44;
          }
          100% {
            transform: translate3d(42px, -56px, 0) scale(1.18);
            opacity: 0;
          }
        }

        @keyframes streak-recover-haze-float-2 {
          0% {
            transform: translate3d(0, 16px, 0) scale(0.9);
            opacity: 0;
          }
          24% {
            opacity: 0.55;
          }
          70% {
            opacity: 0.38;
          }
          100% {
            transform: translate3d(-36px, -62px, 0) scale(1.16);
            opacity: 0;
          }
        }

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
