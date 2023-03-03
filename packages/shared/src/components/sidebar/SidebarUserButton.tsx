import React, { ReactElement, useContext } from 'react';
import dynamic from 'next/dynamic';
import { ProfileLink } from '../profile/ProfileLink';
import { ProfilePicture } from '../ProfilePicture';
import { Button } from '../buttons/Button';
import useProfileMenu from '../../hooks/useProfileMenu';
import AuthContext from '../../contexts/AuthContext';
import SettingsIcon from '../icons/Settings';
import UserIcon from '../icons/User';
import { SidebarUserButtonProps } from './common';
import LoginButton from '../LoginButton';

const { onMenuClick } = useProfileMenu();

const ProfileMenu = dynamic(
  () => import(/* webpackChunkName: "profileMenu" */ '../ProfileMenu'),
);

export default function SidebarUserButton({
  sidebarRendered,
}: SidebarUserButtonProps): ReactElement {
  const { user, loadingUser } = useContext(AuthContext);

  return (
    <>
      {!loadingUser && sidebarRendered === false && (
        <li className="flex flex-col p-6 pt-2">
          {user && user?.infoConfirmed ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <ProfileLink
                  href={user.permalink}
                  className="flex items-center p-0 ml-0.5 font-bold no-underline rounded-lg border-none cursor-pointer text-theme-label-primary bg-theme-bg-secondary typo-callout focus-outline"
                >
                  <ProfilePicture user={user} size="medium" />
                  <span className="mr-3 ml-2">{user.reputation ?? 0}</span>
                </ProfileLink>
                <Button
                  iconOnly
                  className="btn btn-tertiary"
                  onClick={onMenuClick}
                  icon={<SettingsIcon />}
                />
              </div>
              <strong className="mb-0.5 typo-callout">{user.name}</strong>
              <p className="typo-footnote text-theme-label-secondary">
                @{user.username}
              </p>
              <ProfileMenu />
            </>
          ) : (
            <LoginButton icon={<UserIcon />} />
          )}
        </li>
      )}
    </>
  );
}
