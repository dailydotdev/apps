import React, { ReactElement, useContext } from 'react';
import dynamic from 'next/dynamic';
import { ProfileLink } from '../profile/ProfileLink';
import { ProfilePicture } from '../ProfilePicture';
import { Button } from '../buttons/Button';
import useProfileMenu from '../../hooks/useProfileMenu';
import AuthContext from '../../contexts/AuthContext';
import SettingsIcon from '../../../icons/settings.svg';
import UserIcon from '../../../icons/user.svg';
import { SidebarUserButtonProps } from './common';

const { onMenuClick } = useProfileMenu();

const ProfileMenu = dynamic(
  () => import(/* webpackChunkName: "profileMenu" */ '../ProfileMenu'),
);

export default function SidebarUserButton({
  showSidebar,
  onShowDndClick,
}: SidebarUserButtonProps): ReactElement {
  const { user, showLogin, loadingUser } = useContext(AuthContext);

  return (
    <>
      {!loadingUser && !showSidebar && (
        <li className="flex flex-col p-6 pt-2">
          {user ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <ProfileLink
                  user={user}
                  className="flex items-center p-0 ml-0.5 font-bold no-underline rounded-lg border-none cursor-pointer text-theme-label-primary bg-theme-bg-secondary typo-callout focus-outline"
                >
                  <ProfilePicture user={user} size="medium" />
                  <span className="laptop:hidden mr-2 ml-3">
                    {user.reputation ?? 0}
                  </span>
                </ProfileLink>
                <Button className="btn btn-tertiary" onClick={onMenuClick}>
                  <SettingsIcon />
                </Button>
              </div>
              <strong className="mb-0.5 typo-callout">{user.name}</strong>
              <p className="typo-footnote text-theme-label-secondary">
                @{user.username}
              </p>
              <ProfileMenu onShowDndClick={onShowDndClick} />
            </>
          ) : (
            <Button
              onClick={() => showLogin('main button')}
              className="btn-primary"
              icon={<UserIcon />}
            >
              Login
            </Button>
          )}
        </li>
      )}
    </>
  );
}
