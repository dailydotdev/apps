import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import AuthContext from '../../contexts/AuthContext';
import { ProfilePicture } from '../ProfilePicture';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import SettingsIcon from '../icons/Settings';
import { Button, ButtonVariant } from '../buttons/ButtonV2';
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
            type="button"
            className={classNames(
              'focus-outline ml-0.5 cursor-pointer items-center gap-2 rounded-lg border-none bg-theme-bg-secondary p-0 font-bold text-theme-label-primary no-underline typo-callout',
              className ?? 'flex',
            )}
            onClick={wrapHandler(() => onUpdate(!isOpen))}
          >
            <span className="ml-3 block">{user.reputation ?? 0}</span>
            <ProfilePicture user={user} size="medium" />
          </button>
        </SimpleTooltip>
      )}
      {isOpen && <ProfileMenu onClose={() => onUpdate(false)} />}
    </>
  );
}
