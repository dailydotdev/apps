import type { ReactElement } from 'react';
import React, { useId } from 'react';
import { ModalSize } from '../common/types';
import { ModalBody } from '../common/ModalBody';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import type { LoggedUser } from '../../../lib/user';
import {
  Typography,
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

const StreakRecoverButton = ({
  recover,
  ...props
}: { recover: UserStreakRecoverData } & ButtonProps<'button'>) => {
  const { user } = useAuthContext();

  return (
    <Button
      {...props}
      className="relative gap-1"
      variant={ButtonVariant.Primary}
      size={ButtonSize.Large}
      data-testid="streak-recover-button"
    >
      {recover.cost > user.balance.amount ? 'Buy Cores' : 'Restore my streak'}
      <CoreIcon />
      {recover.cost === 0 ? 'Free' : formatCoresCurrency(recover.cost)}
    </Button>
  );
};

export const StreakRecoverOptout = ({
  hideForever,
  id,
}: {
  id: string;
} & Pick<UseStreakRecoverReturn, 'hideForever'>): ReactElement => (
  <div className="flex flex-row items-center justify-center">
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
      className="cursor-pointer py-2.5 text-text-tertiary"
      htmlFor={`showAgain-${id}`}
      id={`showAgain-label-${id}`}
      tag={TypographyTag.Label}
      type={TypographyType.Footnote}
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

  if (
    !user ||
    !isStreaksEnabled ||
    !recover.canRecover ||
    recover.isLoading ||
    recover.isDisabled
  ) {
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
          <StreakRecoverButton
            onClick={onRecover}
            recover={recover}
            loading={recover.isRecoverPending}
          />
          <StreakRecoverOptout id={id} hideForever={hideForever} />
        </div>
      </ModalBody>
    </Modal>
  );
};

export default StreakRecoverModal;
