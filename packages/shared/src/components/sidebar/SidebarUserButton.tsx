import React, { ReactElement, useContext } from 'react';

import AuthContext from '../../contexts/AuthContext';
import { IconSize } from '../Icon';
import LoginButton from '../LoginButton';
import ProfileButton from '../profile/ProfileButton';
import { ProfileLink } from '../profile/ProfileLink';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { ReputationUserBadge } from '../ReputationUserBadge';
import { SidebarUserButtonProps } from './common';

export function SidebarUserButton({
  sidebarRendered,
}: SidebarUserButtonProps): ReactElement {
  const { user, loadingUser } = useContext(AuthContext);

  return (
    <>
      {!loadingUser && sidebarRendered === false && (
        <li className="flex flex-col p-6 pt-2">
          {user && user?.infoConfirmed ? (
            <>
              <div className="mb-4 flex items-center">
                <ProfileLink
                  href={user.permalink}
                  className="focus-outline flex h-10 cursor-pointer items-center rounded-12 border-none bg-background-subtle p-0 font-bold text-text-primary no-underline typo-callout"
                >
                  <ProfilePicture user={user} size={ProfileImageSize.Large} />
                  <ReputationUserBadge
                    className="ml-2 mr-3 !typo-callout"
                    user={user}
                    iconProps={{
                      size: IconSize.Medium,
                    }}
                    disableTooltip
                  />
                </ProfileLink>
                <div className="flex-1" />
                <ProfileButton settingsIconOnly />
              </div>
              <strong className="mb-0.5 typo-callout">{user.name}</strong>
              <p className="text-text-secondary typo-footnote">
                @{user.username}
              </p>
            </>
          ) : (
            <LoginButton className={{ container: 'gap-4' }} />
          )}
        </li>
      )}
    </>
  );
}
