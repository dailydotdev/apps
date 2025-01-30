import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ModalProps } from '../modals/common/Modal';
import { Modal } from '../modals/common/Modal';

import type { UserShortProfile } from '../../lib/user';
import { PlusTitle } from './PlusTitle';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import CloseButton from '../CloseButton';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { cloudinaryGiftedPlusModalImage } from '../../lib/image';
import { PlusList } from './PlusList';
import { PaymentContextProvider } from '../../contexts/PaymentContext';
import { Button } from '../buttons/Button';
import { getPlusGifterUser } from '../../graphql/users';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import Link from '../utilities/Link';

interface GiftPlusModalProps extends ModalProps {
  user?: UserShortProfile;
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
  onRequestClose,
  ...props
}: GiftPlusModalProps): ReactElement {
  const { data: gifter, isLoading } = useQuery({
    queryKey: generateQueryKey(RequestKey.GifterUser),
    queryFn: getPlusGifterUser,
    enabled: Boolean(user.isPlus),
  });

  if (!gifter || isLoading) {
    return null;
  }

  return (
    <PaymentContextProvider>
      <Modal
        {...props}
        drawerProps={{
          displayCloseButton: false,
        }}
        isDrawerOnMobile
        kind={Modal.Kind.FixedCenter}
        onRequestClose={onRequestClose}
        size={Modal.Size.Small}
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
            <Link href={`/${gifter.username}`} passHref>
              <a
                className="flex items-center gap-2"
                title={`View ${gifter.username}'s profile`}
              >
                <ProfilePicture user={gifter} size={ProfileImageSize.Medium} />
                <Typography
                  bold
                  color={TypographyColor.Primary}
                  type={TypographyType.Callout}
                >
                  {gifter.name}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Secondary}
                >
                  @{gifter.username}
                </Typography>
              </a>
            </Link>
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
