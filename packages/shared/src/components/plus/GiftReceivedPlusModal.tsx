import type { ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from '../modals/common/Modal';
import { Modal } from '../modals/common/Modal';

import type { UserShortProfile } from '../../lib/user';
import { PlusTitle } from './PlusTitle';
import { Typography, TypographyType } from '../typography/Typography';
import CloseButton from '../CloseButton';
import { ButtonSize } from '../buttons/common';
import { cloudinaryGiftedPlusModalImage } from '../../lib/image';
import { PlusList } from './PlusList';

interface GiftPlusModalProps extends ModalProps {
  user?: UserShortProfile;
  gifterId?: string;
}

export function GiftReceivedPlusModal({
  user,
  gifterId,
  onRequestClose,
  ...props
}: GiftPlusModalProps): ReactElement {
  // const { data: gifter, isLoading } = useQuery({
  //   queryKey: ['user', gifterId],
  //   queryFn: () => getUserShortInfo(gifterId),
  //   enabled: Boolean(user.isPlus && gifterId),
  // });

  const gifter = user;
  const isLoading = false;

  if (!gifter || isLoading) {
    return null;
  }

  return (
    <Modal
      {...props}
      isOpen
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
      isDrawerOnMobile
    >
      <Modal.Body className="gap-4 tablet:!px-4">
        <div className="flex flex-row justify-between">
          <PlusTitle type={TypographyType.Callout} bold />
          <CloseButton
            type="button"
            size={ButtonSize.Small}
            onClick={onRequestClose}
          />
        </div>
        <Typography bold type={TypographyType.Title1}>
          Surprise! 🎁{gifter.username} thought of you and gifted you a one-year
          daily.dev Plus membership!
        </Typography>
        <img
          src={cloudinaryGiftedPlusModalImage}
          alt="gift pack with daily.dev logo"
        />
        <PlusList />
      </Modal.Body>
    </Modal>
  );
}

export default GiftReceivedPlusModal;
