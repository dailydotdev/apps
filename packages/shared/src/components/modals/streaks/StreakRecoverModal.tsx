import React, { ReactElement, useId } from 'react';

import {
  useStreakRecover,
  UseStreakRecoverReturn,
} from '../../../hooks/streaks/useStreakRecover';
import { reputation as reputationHref } from '../../../lib/constants';
import { cloudinary } from '../../../lib/image';
import { anchorDefaultRel } from '../../../lib/strings';
import { LoggedUser } from '../../../lib/user';
import {
  Button,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { Checkbox } from '../../fields/Checkbox';
import { IconSize } from '../../Icon';
import { ReputationIcon } from '../../icons';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { Modal, ModalProps } from '../common/Modal';
import { ModalBody } from '../common/ModalBody';
import { ModalClose } from '../common/ModalClose';
import { ModalSize } from '../common/types';

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
      src={cloudinary.streak.lost}
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
  reputation,
  cost,
}: Record<'reputation' | 'cost', number>) => {
  const isFree = cost === 0;
  const canRecover = reputation >= cost;
  const reputationLink = (
    <a
      target="_blank"
      rel={anchorDefaultRel}
      href={reputationHref}
      title="What are reputation points?"
      className="text-text-link hover:underline"
    >
      reputation points
    </a>
  );

  const isFreeText = (
    <>
      Lucky you! The first streak restore is on us 🎁. This usually costs 25{' '}
      {reputationLink}. Be sure to come prepared next time!
    </>
  );
  const canRecoverText = (
    <>
      Maintain your streak!
      <br />
      Use {cost} {reputationLink} to keep going.
    </>
  );
  const noRecoverText = (
    <>You don’t have enough {reputationLink} to restore your streaks.</>
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
  cost,
  ...props
}: Record<'cost', number> & ButtonProps<'button'>) => (
  <Button
    {...props}
    className="relative"
    variant={ButtonVariant.Primary}
    size={ButtonSize.Large}
    data-testid="streak-recover-button"
  >
    Restore my streak
    <span className="absolute -right-0.5 -top-0.5 flex items-center whitespace-nowrap rounded-bl-14 rounded-tr-14 bg-accent-onion-default px-1.5 py-1 text-text-primary">
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Caption1}
        data-testid="streak-recovery-cost"
      >
        {cost} Rep
      </Typography>{' '}
      <ReputationIcon className="inline-block" size={IconSize.Size16} />
    </span>
  </Button>
);

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
      id={`showAgain-${id}`}
      name="showAgain"
      onToggle={hideForever.toggle}
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

  const id = useId();
  const { recover, hideForever, onClose, onRecover } = useStreakRecover({
    onAfterClose,
    onRequestClose,
  });

  if (!user || !recover.canRecover || recover.isLoading || recover.isDisabled) {
    return null;
  }

  const { reputation } = user;
  const canUserAffordTheCost = reputation >= recover.cost;

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
          <StreakRecoveryCopy reputation={reputation} cost={recover.cost} />
          {canUserAffordTheCost && (
            <StreakRecoverButton onClick={onRecover} cost={recover.cost} />
          )}
          <StreakRecoverOptout id={id} hideForever={hideForever} />
        </div>
      </ModalBody>
    </Modal>
  );
};

export default StreakRecoverModal;
