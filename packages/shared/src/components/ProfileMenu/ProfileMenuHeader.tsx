import React from 'react';
import type { ReactElement } from 'react';

import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePlusSubscription } from '../../hooks';
import { PlusUser } from '../PlusUser';

export const ProfileMenuHeader = (): ReactElement => {
  const { user } = useAuthContext();
  const { isPlus } = usePlusSubscription();

  return (
    <div className="flex gap-2">
      <ProfilePicture
        user={user}
        nativeLazyLoading
        eager
        size={ProfileImageSize.Large}
        className="!rounded-10 border-background-default"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-1">
          <Typography
            type={TypographyType.Subhead}
            color={TypographyColor.Primary}
            bold
            truncate
            className="min-w-0"
          >
            {user.name}
            {user.name}
          </Typography>
          {isPlus && <PlusUser withText={false} />}
        </div>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          truncate
        >
          @{user.username}
        </Typography>
      </div>
    </div>
  );
};
