import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { useAuthContext } from '../../contexts/AuthContext';
import { ProfilePictureWithIndicator } from './ProfilePictureWithIndicator';
import { ProfileImageSize } from '../ProfilePicture';
import { CoreIcon, ReputationIcon, SettingsIcon } from '../icons';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { IconSize } from '../Icon';
import { useInteractivePopup } from '../../hooks/utils/useInteractivePopup';
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
  settingsIconOnly?: boolean;
}

export default function ProfileButton({
  className,
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

  return (
    <>
      {settingsIconOnly ? (
        <Button
          variant={ButtonVariant.Tertiary}
          onClick={wrapHandler(() => onUpdate(!isOpen))}
          icon={<SettingsIcon />}
        />
      ) : (
        <div className="flex h-10 items-stretch overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-surface-float">
          {isStreaksEnabled && streak && (
            <ReadingStreakButton
              streak={streak}
              isLoading={isLoading}
              compact
              className="!h-full !rounded-none !pl-1.5 !pr-2"
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
                    className="!h-full !rounded-none !px-2"
                  >
                    {largeNumberFormat(displayedBalance)}
                  </Button>
                </Link>
              </div>
            </Tooltip>
          )}
          <Tooltip side="bottom" content="Profile settings">
            <Button
              type="button"
              aria-label="Profile settings"
              icon={
                <ReputationIcon
                  className="text-accent-onion-default"
                  size={IconSize.Medium}
                />
              }
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              className={classNames(
                '!h-full !rounded-none !pl-1 !pr-1',
                className,
              )}
              onClick={wrapHandler(() => onUpdate(!isOpen))}
            >
              <span
                ref={reputationCounterRef}
                data-reward-target={QuestRewardType.Reputation}
                className="inline-flex origin-center items-center will-change-transform"
              >
                {largeNumberFormat(displayedReputation ?? 0)}
              </span>
              <ProfilePictureWithIndicator
                user={user}
                size={ProfileImageSize.Medium}
                wrapperClassName="relative ml-2"
              />
            </Button>
          </Tooltip>
        </div>
      )}
      {isOpen && <ProfileMenu onClose={() => onUpdate(false)} />}
    </>
  );
}
