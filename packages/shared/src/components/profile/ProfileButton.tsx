import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import AuthContext from '../../contexts/AuthContext';
import { ProfilePicture } from '../ProfilePicture';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import SettingsIcon from '../icons/Settings';
import { Button } from '../buttons/Button';
import { useInteractivePopup } from '../../hooks/utils/useInteractivePopup';

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
  const { isOpen, onUpdate, wrapHandler } = useInteractivePopup();
  const { user } = useContext(AuthContext);

  return (
    <>
      {atMobileSidebar ? (
        <Button
          iconOnly
          className="btn btn-tertiary"
          onClick={wrapHandler(() => onUpdate(!isOpen))}
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
            onClick={wrapHandler(() => onUpdate(!isOpen))}
          >
            <span className="hidden laptop:block mr-2 ml-3">
              {user.reputation ?? 0}
            </span>
            <ProfilePicture user={user} size="medium" />
          </button>
        </SimpleTooltip>
      )}
      {isOpen && <ProfileMenu onClose={() => onUpdate(false)} />}
    </>
  );
}
