import React from 'react';
import type { ReactElement } from 'react';

import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePlusSubscription } from '../../hooks';
import { PlusUser } from '../PlusUser';
import { OpenLinkIcon } from '../icons';
import Link from '../utilities/Link';
import type { WithClassNameProps } from '../utilities';
import { webappUrl } from '../../lib/constants';

type Props = WithClassNameProps & {
  shouldOpenProfile?: boolean;
};

export const ProfileMenuHeader = ({
  className,
  shouldOpenProfile = false,
}: Props): ReactElement => {
  const { user } = useAuthContext();
  const { isPlus } = usePlusSubscription();

  return (
    <div className={classNames('flex items-center gap-2', className)}>
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

      {shouldOpenProfile && (
        <Link href={`${webappUrl}${user.username}`} passHref>
          <Typography tag={TypographyTag.Link} color={TypographyColor.Tertiary}>
            <OpenLinkIcon />
          </Typography>
        </Link>
      )}
    </div>
  );
};
