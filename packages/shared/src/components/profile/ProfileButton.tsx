import React, { ReactElement, useContext } from 'react';
import dynamic from 'next/dynamic';
import { LazyImage } from '../LazyImage';
import AuthContext from '../../contexts/AuthContext';
import { getTooltipProps } from '../../lib/tooltip';
import useProfileMenu from '../../hooks/useProfileMenu';

const profileContextMenuWidth = 10;

const ProfileMenu = dynamic(
  () => import(/* webpackChunkName: "profileMenu" */ '../ProfileMenu'),
);

export interface ProfileButtonProps {
  onShowDndClick?: () => unknown;
}

export default function ProfileButton({
  onShowDndClick,
}: ProfileButtonProps): ReactElement {
  const { user } = useContext(AuthContext);
  const { onMenuClick } = useProfileMenu(profileContextMenuWidth);

  return (
    <>
      <button
        type="button"
        className="flex items-center ml-0.5 p-0 text-theme-label-primary bg-theme-bg-secondary border-none rounded-lg cursor-pointer no-underline font-bold typo-callout focus-outline"
        {...getTooltipProps('Profile settings', {
          position: 'left',
        })}
        onClick={onMenuClick}
      >
        <span className="ml-3 mr-2">{user.reputation ?? 0}</span>
        <LazyImage
          className="w-8 h-8 rounded-lg"
          imgSrc={user.image}
          imgAlt="Your profile image"
        />
      </button>
      <ProfileMenu
        width={profileContextMenuWidth}
        onShowDndClick={onShowDndClick}
      />
    </>
  );
}
