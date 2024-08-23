import React, { ReactElement, useId } from 'react';
import { ModalSize } from '../common/types';
import { ModalBody } from '../common/ModalBody';
import { Modal } from '../common/Modal';
import { LoggedUser } from '../../../lib/user';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import {
  Button,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { anchorDefaultRel } from '../../../lib/strings';
import { reputation as reputationHref } from '../../../lib/constants';
import { ReputationIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { useStreakRecover } from '../../../hooks/streaks/useStreakRecover';
import { Checkbox } from '../../fields/Checkbox';
import { ModalClose } from '../common/ModalClose';

export interface StreakRecoverModalProps {
  isOpen: boolean;
  onRequestClose?: () => void;
  user: LoggedUser;
}

const StreakRecoverCover = () => (
  <div className="-mx-4 -mt-6" role="presentation" aria-hidden>
    <svg viewBox="0 0 324 131" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M154.179 84.5133C150.741 87.4417 146.532 89.3181 142.055 89.9181L141 82.0465C143.965 81.6491 145.723 83.986 148 82.0465L154.179 84.5133Z"
        fill="#FC538D"
      />
      <path
        d="M188.253 106.106C185.024 106.513 181.799 106.408 178.965 105.803L187.106 97L188.253 106.106Z"
        fill="#FC538D"
      />
      <path
        d="M205.78 84.6583C206.728 87.7722 207.17 90.9681 207.055 93.864L197 87.3315L205.78 84.6583Z"
        fill="#FC538D"
      />
      <path
        d="M180.159 86.9333C178.438 84.1705 175.815 84.9073 175.178 82.0799L180.159 80.5L186.58 85.7899L180.159 86.9333Z"
        fill="#FC538D"
      />
      <path
        d="M165.231 94.712C162.196 93.5335 160.539 95.6964 158.334 93.8159L169.683 89.9463L165.231 94.712Z"
        fill="#FC538D"
      />
      <path
        d="M134.277 109.571C133.102 105.21 134.986 101.46 138.66 99.3235L156.986 103.454L134.277 109.571Z"
        fill="#FC538D"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M127.5 67.5C141.583 67.5 153 56.0833 153 42C153 27.9167 141.583 16.5 127.5 16.5C113.417 16.5 102 27.9167 102 42C102 56.0833 113.417 67.5 127.5 67.5ZM129.816 27.8369L128.535 26.1988C128.018 25.5255 127.068 25.4107 126.413 25.9423C126.299 26.0353 126.198 26.1448 126.114 26.2674C123.732 29.7408 124.017 33.9414 125.674 37.0808L126.379 38.4291L126.965 39.576L127.432 40.5215L127.677 41.04L127.869 41.469L128.025 41.8916C128.433 43.1655 128.309 44.4867 127.678 45.6046C126.725 47.2597 125.174 47.651 123.717 47.3998C121.331 46.9885 120.608 44.2696 120.389 41.137L120.343 40.3117L120.315 39.4751L120.297 38.2154L120.294 36.9722L120.287 36.6824C120.207 35.2264 119.486 35.2091 118.124 36.6305C114.307 40.6151 113.665 46.7211 116.524 51.8778C118.673 55.8099 123.022 58.3933 127.472 58.3937C127.661 58.3937 127.851 58.3889 128.046 58.3791C132.649 58.147 137.089 55.0977 139.06 50.8149C140.151 48.4775 140.516 45.7788 140.054 43.236C139.454 39.9303 137.726 37.7404 135.422 34.8212C135.152 34.479 134.874 34.1269 134.589 33.7618L133.471 32.3528L131.689 30.1593L129.816 27.8369Z"
        fill="#FC538D"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M68.5 67.5C82.5833 67.5 94 56.0833 94 42C94 27.9167 82.5833 16.5 68.5 16.5C54.4167 16.5 43 27.9167 43 42C43 56.0833 54.4167 67.5 68.5 67.5ZM70.8164 27.8369L69.5354 26.1988C69.0182 25.5255 68.068 25.4107 67.4131 25.9423C67.2986 26.0353 67.1977 26.1448 67.1138 26.2674C64.7316 29.7408 65.0171 33.9414 66.674 37.0808L67.3792 38.4291L67.9653 39.576L68.4322 40.5215L68.6773 41.04L68.8694 41.469L69.0251 41.8916C69.4328 43.1655 69.309 44.4867 68.678 45.6046C67.7245 47.2597 66.1742 47.651 64.7168 47.3998C62.3313 46.9885 61.6084 44.2696 61.3894 41.137L61.3429 40.3117L61.3147 39.4751L61.2967 38.2154L61.2942 36.9722L61.2866 36.6824C61.2065 35.2264 60.4855 35.2091 59.1236 36.6305C55.3073 40.6151 54.6646 46.7211 57.5241 51.8778C59.6726 55.8099 64.0219 58.3933 68.472 58.3937C68.6605 58.3937 68.8512 58.3889 69.0456 58.3791C73.6487 58.147 78.089 55.0977 80.0599 50.8149C81.1512 48.4775 81.5161 45.7788 81.0543 43.236C80.4539 39.9303 78.7257 37.7404 76.4219 34.8212C76.1519 34.479 75.874 34.1269 75.5891 33.7618L74.4705 32.3528L72.6891 30.1593L70.8164 27.8369Z"
        fill="#FC538D"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.5 67.5C23.5833 67.5 35 56.0833 35 42C35 27.9167 23.5833 16.5 9.5 16.5C-4.58326 16.5 -16 27.9167 -16 42C-16 56.0833 -4.58326 67.5 9.5 67.5ZM11.8164 27.8369L10.5354 26.1988C10.0182 25.5255 9.06804 25.4107 8.41308 25.9423C8.29856 26.0353 8.19774 26.1448 8.11376 26.2674C5.73163 29.7408 6.01715 33.9414 7.67405 37.0808L8.37921 38.4291L8.96525 39.576L9.43217 40.5215L9.67726 41.04L9.86942 41.469L10.0251 41.8916C10.4328 43.1655 10.309 44.4867 9.67804 45.6046C8.7245 47.2597 7.17421 47.651 5.71682 47.3998C3.33132 46.9885 2.60845 44.2696 2.38939 41.137L2.34292 40.3117L2.31473 39.4751L2.29672 38.2154L2.29415 36.9722L2.28664 36.6824C2.20653 35.2264 1.48552 35.2091 0.123611 36.6305C-3.69266 40.6151 -4.33545 46.7211 -1.47593 51.8778C0.672583 55.8099 5.02188 58.3933 9.47198 58.3937C9.66052 58.3937 9.85124 58.3889 10.0456 58.3791C14.6487 58.147 19.089 55.0977 21.0599 50.8149C22.1512 48.4775 22.5161 45.7788 22.0543 43.236C21.4539 39.9303 19.7257 37.7404 17.4219 34.8212C17.1519 34.479 16.874 34.1269 16.5891 33.7618L15.4705 32.3528L13.6891 30.1593L11.8164 27.8369Z"
        fill="#FC538D"
      />
    </svg>
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
      className="text-text-link underline-offset-2 hover:underline"
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

export const StreakRecoverModal = (
  props: StreakRecoverModalProps,
): ReactElement => {
  const { isOpen, onRequestClose, user } = props;

  const id = useId();
  const { recover, hideForever, onClose, onRecover } = useStreakRecover({
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
        </div>
      </ModalBody>
    </Modal>
  );
};

export default StreakRecoverModal;
