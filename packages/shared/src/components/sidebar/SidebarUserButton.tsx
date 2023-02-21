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
              <div className="mb-4 flex items-center justify-between">
                <ProfileLink
                  href={user.permalink}
                  className="focus-outline ml-0.5 flex cursor-pointer items-center rounded-lg border-none bg-theme-bg-secondary p-0 font-bold text-theme-label-primary no-underline typo-callout"
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
              <p className="text-theme-label-secondary typo-footnote">
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
