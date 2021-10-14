import React, { ReactElement, useContext } from 'react';
import { LazyImage } from '../LazyImage';
import AuthContext from '../../contexts/AuthContext';
import { getTooltipProps } from '../../lib/tooltip';
import useProfileMenu from '../../hooks/useProfileMenu';
import ProfileMenu from '../ProfileMenu';

const profileContextMenuWidth = 10;

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
        className="flex items-center p-0 ml-0.5 font-bold no-underline rounded-lg border-none cursor-pointer text-theme-label-primary bg-theme-bg-secondary typo-callout focus-outline"
        {...getTooltipProps('Profile settings', {
          position: 'left',
        })}
        onClick={onMenuClick}
      >
        <span className="mr-2 ml-3">{user.reputation ?? 0}</span>
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
