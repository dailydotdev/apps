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
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            className={classNames(
              'items-center !p-0 ml-0.5 text-theme-label-primary gap-2',
              className,
            )}
            onClick={wrapHandler(() => onUpdate(!isOpen))}
          >
            <span className="block ml-3">{user.reputation ?? 0}</span>
            <ProfilePicture user={user} size="medium" />
          </Button>
        </SimpleTooltip>
      )}
      {isOpen && <ProfileMenu onClose={() => onUpdate(false)} />}
    </>
  );
}
