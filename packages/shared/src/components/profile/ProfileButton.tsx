import React, { ReactElement } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { useAuthContext } from '../../contexts/AuthContext';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { SettingsIcon } from '../icons';
import { Button, ButtonVariant } from '../buttons/Button';
import { useInteractivePopup } from '../../hooks/utils/useInteractivePopup';
import { ReputationUserBadge } from '../ReputationUserBadge';
import { IconSize } from '../Icon';
import { ReadingStreakButton } from '../streak/ReadingStreakButton';
import { useReadingStreak } from '../../hooks/streaks';

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
  const { user } = useAuthContext();
  const { streak, isLoading, isStreaksEnabled } = useReadingStreak();

  return (
    <>
      {settingsIconOnly ? (
        <Button
          variant={ButtonVariant.Tertiary}
          onClick={wrapHandler(() => onUpdate(!isOpen))}
          icon={<SettingsIcon />}
        />
      ) : (
        <div className="flex h-10 items-center rounded-12 bg-surface-float px-1">
          {isStreaksEnabled && (
            <ReadingStreakButton
              streak={streak}
              isLoading={isLoading}
              compact
              className="pl-4"
            />
          )}
          <SimpleTooltip placement="bottom" content="Profile settings">
            <button
              type="button"
              className={classNames(
                'focus-outline cursor-pointer items-center gap-2 border-none p-0 font-bold text-text-primary no-underline typo-subhead',
                className ?? 'flex',
              )}
              onClick={wrapHandler(() => onUpdate(!isOpen))}
            >
              <ReputationUserBadge
                className="ml-1 !typo-subhead"
                user={user}
                iconProps={{
                  size: IconSize.Small,
                }}
                disableTooltip
              />
              <ProfilePicture
                user={user}
                size={ProfileImageSize.Medium}
                nativeLazyLoading
              />
            </button>
          </SimpleTooltip>
        </div>
      )}
      {isOpen && <ProfileMenu onClose={() => onUpdate(false)} />}
    </>
  );
}
