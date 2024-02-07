import React, { ReactElement, useContext } from 'react';
import { ProfileLink } from '../profile/ProfileLink';
import { ProfilePicture } from '../ProfilePicture';
import AuthContext from '../../contexts/AuthContext';
import { SidebarUserButtonProps } from './common';
import LoginButton from '../LoginButton';
import ProfileButton from '../profile/ProfileButton';

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
                  className="focus-outline flex h-10 cursor-pointer items-center rounded-12 border-none bg-theme-bg-secondary p-0 font-bold text-theme-label-primary no-underline typo-callout"
                >
                  <ProfilePicture user={user} size="large" />
                  <span className="ml-2 mr-3">{user.reputation ?? 0}</span>
                </ProfileLink>
                <div className="flex-1" />
                <ProfileButton settingsIconOnly />
              </div>
              <strong className="mb-0.5 typo-callout">{user.name}</strong>
              <p className="text-theme-label-secondary typo-footnote">
                @{user.username}
              </p>
            </>
          ) : (
            <LoginButton />
          )}
        </li>
      )}
    </>
  );
}
