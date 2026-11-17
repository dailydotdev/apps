import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ModalProps } from '../modals/common/Modal';
import { Modal } from '../modals/common/Modal';
import { ModalClose } from '../modals/common/ModalClose';
import { ButtonSize, ButtonVariant } from '../buttons/Button';
import { CoreIcon } from '../icons/Core';
import { IconSize } from '../Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { coresFriendshipImage } from '../../lib/image';

type CoresMomentModalProps = Pick<ModalProps, 'onRequestClose'> & {
  amount: string;
  title: string;
  body: string;
  children: ReactNode;
  /** Height of the art, shorter when the card has more to say */
  artClassName?: string;
};

/**
 * "You have Cores now": the character art on top, the amount right under it,
 * then the copy and the actions.
 */
export const CoresMomentModal = ({
  amount,
  title,
  body,
  children,
  artClassName = 'h-48 tablet:h-56',
  onRequestClose,
}: CoresMomentModalProps): ReactElement => (
  <Modal
    isOpen
    kind={Modal.Kind.FlexibleCenter}
    size={Modal.Size.Small}
    onRequestClose={onRequestClose}
    isDrawerOnMobile
    className="overflow-hidden"
  >
    <div
      className={classNames(
        'relative w-full shrink-0 overflow-hidden',
        artClassName,
      )}
    >
      <img
        src={coresFriendshipImage}
        alt="Friends sharing a Core with Patchy"
        className="size-full object-cover object-[50%_45%]"
      />
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background-default to-transparent" />
      <ModalClose
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        zIndex="1"
        top="3"
        right="3"
        onClick={onRequestClose}
      />
    </div>
    <div className="flex min-h-0 flex-col items-center gap-4 overflow-y-auto px-6 pb-6 pt-4 text-center">
      <div className="flex flex-col items-center gap-3">
        <span className="flex items-center gap-1.5 rounded-14 border border-border-subtlest-tertiary bg-background-default px-3 py-1.5 shadow-2">
          <CoreIcon size={IconSize.Medium} />
          <strong className="tabular-nums typo-title2">{amount}</strong>
        </span>
        <div className="flex flex-col gap-1">
          <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
            {title}
          </Typography>
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            {body}
          </Typography>
        </div>
      </div>
      {children}
    </div>
  </Modal>
);
