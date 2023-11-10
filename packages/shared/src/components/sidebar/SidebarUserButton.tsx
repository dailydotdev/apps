import React, { ReactElement, useContext } from 'react';
import { ProfileLink } from '../profile/ProfileLink';
import { ProfilePicture } from '../ProfilePicture';
import AuthContext from '../../contexts/AuthContext';
import { SidebarUserButtonProps } from './common';
import LoginButton from '../LoginButton';
import { SearchReferralButton } from '../referral/SearchReferralButton';
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
              <div className="flex items-center mb-4">
                <ProfileLink
                  href={user.permalink}
                  className="flex items-center p-0 ml-0.5 font-bold no-underline rounded-lg border-none cursor-pointer text-theme-label-primary bg-theme-bg-secondary typo-callout focus-outline"
                >
                  <ProfilePicture user={user} size="medium" />
                  <span className="mr-3 ml-2">{user.reputation ?? 0}</span>
                </ProfileLink>
                <SearchReferralButton className="ml-3" />
                <div className="flex-1" />
                <ProfileButton atMobileSidebar />
              </div>
              <strong className="mb-0.5 typo-callout">{user.name}</strong>
              <p className="typo-footnote text-theme-label-secondary">
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
