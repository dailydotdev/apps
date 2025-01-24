import type { ReactElement } from 'react';
import React from 'react';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import CloseButton from '../CloseButton';
import { ButtonSize } from '../buttons/common';
import type { UserShortProfile } from '../../lib/user';

interface GiftingSelectedUserProps {
  user: UserShortProfile;
  onClose: () => void;
}

export function GiftingSelectedUser({
  user,
  onClose,
}: GiftingSelectedUserProps): ReactElement {
  const { username, name } = user;

  return (
    <div className="flex w-full max-w-full flex-row items-center gap-2 rounded-10 bg-surface-float p-2">
      <ProfilePicture user={user} size={ProfileImageSize.Medium} />
      <span className="flex w-full flex-1 flex-row items-center gap-2 truncate">
        <Typography bold type={TypographyType.Callout}>
          {name}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
        >
          {username}
        </Typography>
      </span>
      <CloseButton type="button" onClick={onClose} size={ButtonSize.XSmall} />
    </div>
  );
}
