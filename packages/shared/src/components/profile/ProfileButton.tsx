import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import AuthContext from '../../contexts/AuthContext';
import { ProfilePicture } from '../ProfilePicture';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import SettingsIcon from '../icons/Settings';
import { Button, ButtonSize, ButtonVariant } from '../buttons/ButtonV2';
import { useInteractivePopup } from '../../hooks/utils/useInteractivePopup';

const ProfileMenu = dynamic(
  () => import(/* webpackChunkName: "profileMenu" */ '../ProfileMenu'),
);

interface ProfileButtonProps {
  className?: string;
  settingsIconOnly?: boolean;
}

export default function ProfileButton({
  className,
  settingsIconOnly,
}: ProfileButtonProps): ReactElement {
  const { isOpen, onUpdate, wrapHandler } = useInteractivePopup();
  const { user } = useContext(AuthContext);

  return (
    <>
      {settingsIconOnly ? (
        <Button
          variant={ButtonVariant.Tertiary}
          onClick={wrapHandler(() => onUpdate(!isOpen))}
          icon={<SettingsIcon />}
        />
      ) : (
        <SimpleTooltip placement="left" content="Profile settings">
          <button
            className={classNames(
              'items-center p-0 ml-0.5 font-bold no-underline rounded-lg border-none cursor-pointer text-theme-label-primary bg-theme-bg-secondary typo-callout focus-outline gap-2',
              className,
            )}
            onClick={wrapHandler(() => onUpdate(!isOpen))}
          >
            <span className="block ml-3">{user.reputation ?? 0}</span>
            <ProfilePicture user={user} size="medium" />
          </button>
        </SimpleTooltip>
      )}
      {isOpen && <ProfileMenu onClose={() => onUpdate(false)} />}
    </>
  );
}
