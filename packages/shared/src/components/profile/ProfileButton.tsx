import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { useAuthContext } from '../../contexts/AuthContext';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { CoreIcon, InfoIcon, SettingsIcon } from '../icons';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { useInteractivePopup } from '../../hooks/utils/useInteractivePopup';
import { ReputationUserBadge } from '../ReputationUserBadge';
import { IconSize } from '../Icon';
import { ReadingStreakButton } from '../streak/ReadingStreakButton';
import { useReadingStreak } from '../../hooks/streaks';
import { walletUrl } from '../../lib/constants';
import { largeNumberFormat } from '../../lib';
import { formatCurrency } from '../../lib/utils';
import { useHasAccessToCores } from '../../hooks/useCoresFeature';
import Link from '../utilities/Link';
import { Tooltip } from '../tooltip/Tooltip';
import { useProfileCompletionIndicator } from '../../hooks/profile/useProfileCompletionIndicator';

const ProfileMenu = dynamic(
  () =>
    import(/* webpackChunkName: "profileMenu" */ '../ProfileMenu/ProfileMenu'),
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
  const hasCoresAccess = useHasAccessToCores();
  const { showIndicator: showProfileCompletionIndicator } =
    useProfileCompletionIndicator();

  const preciseBalance = formatCurrency(user?.balance?.amount, {
    minimumFractionDigits: 0,
  });

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
          {hasCoresAccess && (
            <Tooltip
              content={
                <>
                  Wallet
                  <br />
                  {preciseBalance} Cores
                </>
              }
            >
              <div>
                <Link href={walletUrl} passHref>
                  <Button
                    icon={<CoreIcon />}
                    tag="a"
                    variant={ButtonVariant.Tertiary}
                    size={ButtonSize.Small}
                  >
                    {largeNumberFormat(user?.balance?.amount || 0)}
                  </Button>
                </Link>
              </div>
            </Tooltip>
          )}
          <Tooltip side="bottom" content="Profile settings">
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
              <span className="relative">
                <ProfilePicture
                  user={user}
                  size={ProfileImageSize.Medium}
                  nativeLazyLoading
                />
                {showProfileCompletionIndicator && (
                  <InfoIcon
                    size={IconSize.XSmall}
                    className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 rounded-full bg-background-subtle text-accent-cheese-default"
                  />
                )}
              </span>
            </button>
          </Tooltip>
        </div>
      )}
      {isOpen && <ProfileMenu onClose={() => onUpdate(false)} />}
    </>
  );
}
