import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { useAuthContext } from '../../contexts/AuthContext';
import { ProfilePictureWithIndicator } from './ProfilePictureWithIndicator';
import { ProfileImageSize } from '../ProfilePicture';
import { ArrowIcon, CoreIcon, SettingsIcon } from '../icons';
import { InteractivePopupPosition } from '../tooltips/InteractivePopup';
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
import { QuestRewardType } from '../../graphql/quests';
import { QUEST_REWARD_COUNTER_EVENT } from '../../lib/questRewardAnimation';
import type { QuestRewardCounterEventDetail } from '../../lib/questRewardAnimation';

const ProfileMenu = dynamic(
  () =>
    import(/* webpackChunkName: "profileMenu" */ '../ProfileMenu/ProfileMenu'),
);

interface ProfileButtonProps {
  className?: string;
  avatarOnly?: boolean;
  compact?: boolean;
  settingsIconOnly?: boolean;
}

export default function ProfileButton({
  avatarOnly,
  className,
  compact,
  settingsIconOnly,
}: ProfileButtonProps): ReactElement {
  const { isOpen, onUpdate, wrapHandler } = useInteractivePopup();
  const { user, isAuthReady } = useAuthContext();
  const { streak, isLoading, isStreaksEnabled } = useReadingStreak();
  const hasCoresAccess = useHasAccessToCores();
  const [animatedCores, setAnimatedCores] = useState<number | null>(null);
  const [animatedReputation, setAnimatedReputation] = useState<number | null>(
    null,
  );
  const clearCounterTimersRef = useRef<
    Partial<Record<QuestRewardType.Reputation | QuestRewardType.Cores, number>>
  >({});
  const activeClaimRef = useRef<
    Partial<Record<QuestRewardType.Reputation | QuestRewardType.Cores, string>>
  >({});
  const coresCounterRef = useRef<HTMLDivElement | null>(null);
  const reputationCounterRef = useRef<HTMLSpanElement | null>(null);
  const displayedBalance =
    typeof animatedCores === 'number'
      ? animatedCores
      : user?.balance?.amount ?? 0;
  const displayedReputation =
    typeof animatedReputation === 'number'
      ? animatedReputation
      : user?.reputation;
  const preciseBalance = formatCurrency(displayedBalance, {
    minimumFractionDigits: 0,
  });

  const playCounterImpactAnimation = useCallback(
    (rewardType: QuestRewardType.Reputation | QuestRewardType.Cores) => {
      const target =
        rewardType === QuestRewardType.Reputation
          ? reputationCounterRef.current
          : coresCounterRef.current;

      if (!target || typeof target.animate !== 'function') {
        return;
      }

      target.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.2)', offset: 0.45 },
          { transform: 'scale(1)' },
        ],
        {
          duration: 180,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        },
      );
    },
    [],
  );

  useEffect(() => {
    const handleRewardCounter = (event: Event) => {
      const { detail } = event as CustomEvent<QuestRewardCounterEventDetail>;
      const { rewardType } = detail;

      if (
        rewardType !== QuestRewardType.Reputation &&
        rewardType !== QuestRewardType.Cores
      ) {
        return;
      }

      if (detail.phase === 'start') {
        activeClaimRef.current[rewardType] = detail.claimId;

        if (rewardType === QuestRewardType.Reputation) {
          setAnimatedReputation(detail.baseValue ?? user?.reputation ?? 0);
        } else {
          setAnimatedCores(detail.baseValue ?? user?.balance?.amount ?? 0);
        }

        const activeTimer = clearCounterTimersRef.current[rewardType];

        if (activeTimer) {
          window.clearTimeout(activeTimer);
        }

        if (!detail.clearAfterMs) {
          return;
        }

        clearCounterTimersRef.current[rewardType] = window.setTimeout(() => {
          if (rewardType === QuestRewardType.Reputation) {
            setAnimatedReputation(null);
          } else {
            setAnimatedCores(null);
          }

          activeClaimRef.current[rewardType] = undefined;
          clearCounterTimersRef.current[rewardType] = undefined;
        }, detail.clearAfterMs);

        return;
      }

      if (detail.phase !== 'hit') {
        return;
      }

      if (activeClaimRef.current[rewardType] !== detail.claimId) {
        return;
      }

      const delta = detail.delta ?? 0;

      if (!delta) {
        return;
      }

      if (rewardType === QuestRewardType.Reputation) {
        setAnimatedReputation((current) => {
          const base =
            typeof current === 'number' ? current : user?.reputation ?? 0;

          return base + delta;
        });
        playCounterImpactAnimation(QuestRewardType.Reputation);

        return;
      }

      setAnimatedCores((current) => {
        const base =
          typeof current === 'number' ? current : user?.balance?.amount ?? 0;

        return base + delta;
      });
      playCounterImpactAnimation(QuestRewardType.Cores);
    };

    const clearCounterTimers = clearCounterTimersRef.current;

    window.addEventListener(
      QUEST_REWARD_COUNTER_EVENT,
      handleRewardCounter as EventListener,
    );

    return () => {
      window.removeEventListener(
        QUEST_REWARD_COUNTER_EVENT,
        handleRewardCounter as EventListener,
      );

      Object.values(clearCounterTimers).forEach((timerId) => {
        if (!timerId) {
          return;
        }

        window.clearTimeout(timerId);
      });
    };
  }, [playCounterImpactAnimation, user?.balance?.amount, user?.reputation]);

  if (!isAuthReady || !user) {
    return <></>;
  }

  const renderTrigger = (): ReactElement => {
    if (settingsIconOnly) {
      return (
        <Button
          variant={ButtonVariant.Tertiary}
          onClick={wrapHandler(() => onUpdate(!isOpen))}
          icon={<SettingsIcon />}
        />
      );
    }

    if (avatarOnly) {
      return (
        <button
          type="button"
          aria-label="Profile settings"
          className={classNames(
            'focus-outline cursor-pointer border-none p-0 no-underline',
            className ?? 'flex',
          )}
          onClick={wrapHandler(() => onUpdate(!isOpen))}
        >
          <Tooltip side="right" content="Profile settings">
            <div className="flex items-center">
              <ProfilePictureWithIndicator
                user={user}
                size={ProfileImageSize.Large}
              />
            </div>
          </Tooltip>
        </button>
      );
    }

    if (compact) {
      return (
        <button
          type="button"
          aria-label="Profile settings"
          aria-expanded={isOpen}
          className={classNames(
            'focus-outline flex w-fit max-w-full cursor-pointer items-center gap-1.5 rounded-10 border-none bg-transparent p-1 text-left transition-colors hover:bg-surface-hover',
            className,
          )}
          onClick={wrapHandler(() => onUpdate(!isOpen))}
        >
          <ProfilePictureWithIndicator
            user={user}
            size={ProfileImageSize.Small}
          />
          <span className="min-w-0 truncate font-bold text-text-primary typo-footnote">
            {user.name?.split(' ')[0] ?? user.username}
          </span>
          <ArrowIcon
            size={IconSize.Size16}
            aria-hidden
            className={classNames(
              'shrink-0 text-text-tertiary transition-transform',
              !isOpen && 'rotate-180',
            )}
          />
        </button>
      );
    }

    return (
      <div className="flex h-10 items-center rounded-12 bg-surface-float px-1">
        {isStreaksEnabled && streak && (
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
            <div
              ref={coresCounterRef}
              className="flex origin-center justify-center will-change-transform"
            >
              <Link href={walletUrl} passHref>
                <Button
                  data-reward-target={QuestRewardType.Cores}
                  icon={<CoreIcon />}
                  tag="a"
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Small}
                >
                  {largeNumberFormat(displayedBalance)}
                </Button>
              </Link>
            </div>
          </Tooltip>
        )}
        <button
          type="button"
          aria-label="Profile settings"
          className={classNames(
            'focus-outline cursor-pointer items-center gap-2 border-none p-0 font-bold text-text-primary no-underline typo-subhead',
            className ?? 'flex',
          )}
          onClick={wrapHandler(() => onUpdate(!isOpen))}
        >
          <span
            ref={reputationCounterRef}
            className="inline-flex items-center"
            data-reward-target={QuestRewardType.Reputation}
          >
            <ReputationUserBadge
              className="ml-1 !typo-subhead"
              user={{ reputation: displayedReputation ?? 0 }}
              iconProps={{
                size: IconSize.Small,
              }}
            />
          </span>
          <Tooltip side="bottom" content="Profile settings">
            <div className="flex items-center">
              <ProfilePictureWithIndicator user={user} />
            </div>
          </Tooltip>
        </button>
      </div>
    );
  };

  return (
    <>
      {renderTrigger()}
      {isOpen && (
        <ProfileMenu
          onClose={() => onUpdate(false)}
          position={
            compact
              ? InteractivePopupPosition.SidebarProfileMenu
              : InteractivePopupPosition.ProfileMenu
          }
        />
      )}
    </>
  );
}
