import React, { ReactElement, useContext, useState } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import AuthContext from '../../contexts/AuthContext';
import { ProfilePicture } from '../ProfilePicture';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import SettingsIcon from '../icons/Settings';
import { Button } from '../buttons/Button';

const ProfileMenu = dynamic(
  () => import(/* webpackChunkName: "profileMenu" */ '../ProfileMenu'),
);

interface ProfileButtonProps {
  className?: string;
  atMobileSidebar?: boolean;
}

export default function ProfileButton({
  className,
  atMobileSidebar,
}: ProfileButtonProps): ReactElement {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useContext(AuthContext);

  return (
    <>
      {atMobileSidebar ? (
        <Button
          iconOnly
          className="btn btn-tertiary"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          icon={<SettingsIcon />}
        />
      ) : (
        <SimpleTooltip placement="left" content="Profile settings">
          <button
            type="button"
            className={classNames(
              'items-center p-0 ml-0.5 font-bold no-underline rounded-lg border-none cursor-pointer text-theme-label-primary bg-theme-bg-secondary typo-callout focus-outline',
              className ?? 'flex',
            )}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="hidden laptop:block mr-2 ml-3">
              {user.reputation ?? 0}
            </span>
            <ProfilePicture user={user} size="medium" />
          </button>
        </SimpleTooltip>
      )}
      {isMenuOpen && <ProfileMenu onClose={() => setIsMenuOpen(false)} />}
    </>
  );
}
