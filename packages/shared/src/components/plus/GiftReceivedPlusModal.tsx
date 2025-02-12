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
import { Button } from '../buttons/Button';
import { getPlusGifterUser } from '../../graphql/users';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import Link from '../utilities/Link';
import { useAuthContext } from '../../contexts/AuthContext';
import { Loader } from '../Loader';
import { webappUrl } from '../../lib/constants';

const GifterProfile = ({ gifter }: { gifter: UserShortProfile }) => (
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
);

export function GiftReceivedPlusModal(props: ModalProps): ReactElement {
  const { onRequestClose } = props;
  const { user } = useAuthContext();
  const { data: gifter, isLoading } = useQuery({
    queryKey: generateQueryKey(RequestKey.GifterUser, user),
    queryFn: getPlusGifterUser,
    enabled: Boolean(user?.isPlus),
  });

  if (!gifter || isLoading) {
    return (
      <Modal
        {...props}
        isDrawerOnMobile
        kind={Modal.Kind.FixedCenter}
        size={Modal.Size.Small}
      >
        <Modal.Body className="flex flex-1 tablet:!px-4">
          <Loader />
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal
      {...props}
      isDrawerOnMobile
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
    >
      <Modal.Body className="flex flex-1 tablet:!px-4">
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-row justify-between">
            <PlusTitle type={TypographyType.Callout} bold />
            <CloseButton
              type="button"
              size={ButtonSize.Small}
              onClick={onRequestClose}
            />
          </div>
          <GifterProfile gifter={gifter} />
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
        <Button
          className="mt-4 w-full"
          href={`${webappUrl}squads/plus`}
          tag="a"
          variant={ButtonVariant.Primary}
        >{`See what's inside`}</Button>
      </Modal.Body>
    </Modal>
  );
}

export default GiftReceivedPlusModal;
