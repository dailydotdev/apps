import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { useAuthContext } from '../../contexts/AuthContext';
import { ProfilePictureWithIndicator } from './ProfilePictureWithIndicator';
import { CoreIcon, SettingsIcon } from '../icons';
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
              <div
                ref={coresCounterRef}
                className="origin-center will-change-transform"
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
      )}
      {isOpen && <ProfileMenu onClose={() => onUpdate(false)} />}
    </>
  );
}
