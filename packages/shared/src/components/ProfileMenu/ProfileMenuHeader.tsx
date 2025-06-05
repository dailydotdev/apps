import React from 'react';
import type { ReactElement } from 'react';

import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
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
import ConditionalWrapper from '../ConditionalWrapper';
import { IconSize } from '../Icon';

type Props = WithClassNameProps & {
  shouldOpenProfile?: boolean;
  profileImageSize?: ProfileImageSize;
};

export const ProfileMenuHeader = ({
  className,
  shouldOpenProfile = false,
  profileImageSize = ProfileImageSize.Large,
}: Props): ReactElement => {
  const { user } = useAuthContext();
  const { isPlus } = usePlusSubscription();

  return (
    <ConditionalWrapper
      condition={shouldOpenProfile}
      wrapper={(children) => (
        <Link href={`${webappUrl}${user.username}`} passHref>
          <a>{children}</a>
        </Link>
      )}
    >
      <div
        className={classNames('relative flex items-center gap-2', className)}
      >
        <ProfilePicture
          user={user}
          nativeLazyLoading
          eager
          size={profileImageSize}
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
          <OpenLinkIcon
            className="text-text-quaternary"
            size={IconSize.Size16}
          />
        )}
      </div>
    </ConditionalWrapper>
  );
};
