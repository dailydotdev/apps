import type { ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from '../modals/common/Modal';
import { Modal } from '../modals/common/Modal';

import type { UserShortProfile } from '../../lib/user';
import { PlusTitle } from './PlusTitle';
import { Typography, TypographyType } from '../typography/Typography';
import CloseButton from '../CloseButton';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { cloudinaryGiftedPlusModalImage } from '../../lib/image';
import { PlusList } from './PlusList';
import { PaymentContextProvider } from '../../contexts/PaymentContext';
import { Button } from '../buttons/Button';

interface GiftPlusModalProps extends ModalProps {
  user?: UserShortProfile;
  gifterId?: string;
}

const OpenSquadButton = () => (
  <Button
    className="w-full"
    href="/squads/plus"
    tag="a"
    variant={ButtonVariant.Primary}
  >{`See what's inside`}</Button>
);

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
    <PaymentContextProvider>
      <Modal
        {...props}
        isOpen
        kind={Modal.Kind.FixedCenter}
        size={Modal.Size.Small}
        isDrawerOnMobile
        drawerProps={{
          displayCloseButton: false,
        }}
      >
        <Modal.Body className="flex flex-1 tablet:!px-4">
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto tablet:overflow-auto">
            <div className="flex flex-row justify-between ">
              <PlusTitle type={TypographyType.Callout} bold />
              <CloseButton
                type="button"
                size={ButtonSize.Small}
                onClick={onRequestClose}
              />
            </div>
            <Typography bold type={TypographyType.Title1}>
              Surprise! 🎁 {gifter.username} thought of you and gifted you a
              one-year daily.dev Plus membership!
            </Typography>
            <img
              src={cloudinaryGiftedPlusModalImage}
              alt="gift pack with daily.dev logo"
              height={140}
              width={386}
              className="h-auto w-full"
            />
            <PlusList className="overflow-clip !py-0" />
          </div>
          <div className="flex flex-col gap-4 tablet:hidden">
            <OpenSquadButton />
            <Button onClick={onRequestClose} variant={ButtonVariant.Float}>
              Cancel
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <OpenSquadButton />
        </Modal.Footer>
      </Modal>
    </PaymentContextProvider>
  );
}

export default GiftReceivedPlusModal;
