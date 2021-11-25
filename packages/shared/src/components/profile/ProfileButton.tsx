import React, { ReactElement, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import useProfileMenu from '../../hooks/useProfileMenu';
import ProfileMenu from '../ProfileMenu';
import { ProfilePicture } from '../ProfilePicture';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';

export interface ProfileButtonProps {
  onShowDndClick?: () => unknown;
}

export default function ProfileButton({
  onShowDndClick,
}: ProfileButtonProps): ReactElement {
  const { user } = useContext(AuthContext);
  const { onMenuClick } = useProfileMenu();

  return (
    <>
      <SimpleTooltip placement="left" content="Profile settings">
        <button
          type="button"
          className="flex items-center p-0 ml-0.5 font-bold no-underline rounded-lg border-none cursor-pointer text-theme-label-primary bg-theme-bg-secondary typo-callout focus-outline"
          onClick={onMenuClick}
        >
          <span className="mr-2 ml-3">{user.reputation ?? 0}</span>
          <ProfilePicture user={user} size="medium" />
        </button>
      </SimpleTooltip>
      <ProfileMenu onShowDndClick={onShowDndClick} />
    </>
  );
}
