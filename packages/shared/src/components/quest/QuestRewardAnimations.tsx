import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect } from 'react';
import { IconSize } from '../Icon';
import { CoreIcon, ReputationIcon } from '../icons';
import { RootPortal } from '../tooltips/Portal';
import { QuestRewardType } from '../../graphql/quests';

const QUEST_REWARD_FLY_DURATION_MS = 1850;
const QUEST_REWARD_HIT_PROGRESS = 0.86;
const QUEST_REWARD_FLIGHT_STAGGER_MS = 180;
const QUEST_REWARD_SOURCE_LIFT_PX = 34;
export const QUEST_REWARD_LAYER_Z_INDEX = 2147483647;

export type QuestRewardSource = {
  id: string;
  type: QuestRewardType;
  amount: number;
  x: number;
  y: number;
};

export type QuestRewardFlight = QuestRewardSource & {
  dx: number;
  dy: number;
  delayMs: number;
};

export const getQuestRewardHitAt = (delayMs: number): number =>
  delayMs +
  Math.round(QUEST_REWARD_FLY_DURATION_MS * QUEST_REWARD_HIT_PROGRESS);

const getQuestRewardAnimationIcon = (
  rewardType: QuestRewardType,
): ReactElement => {
  switch (rewardType) {
    case QuestRewardType.Cores:
      return (
        <CoreIcon
          size={IconSize.Large}
          className="text-accent-cheese-default drop-shadow-[0_2px_6px_rgb(0_0_0_/_0.45)]"
        />
      );
    case QuestRewardType.Reputation:
      return (
        <ReputationIcon
          size={IconSize.Large}
          className="text-accent-onion-default drop-shadow-[0_2px_6px_rgb(0_0_0_/_0.45)]"
        />
      );
    case QuestRewardType.Xp:
    default:
      return (
        <span className="inline-flex min-w-[1.5rem] items-center justify-center text-lg font-black lowercase leading-none !text-accent-avocado-default [text-shadow:0_2px_6px_rgb(0_0_0_/_0.55)]">
          xp
        </span>
      );
  }
};

const getQuestRewardFlightCount = (
  rewardType: QuestRewardType,
  amount: number,
): number => {
  const normalizedAmount = Math.max(1, Math.round(amount));
  const maxParticles = rewardType === QuestRewardType.Xp ? 5 : 4;

  return Math.min(normalizedAmount, maxParticles);
};

export const buildQuestRewardFlights = (
  rewardSources: QuestRewardSource[],
): QuestRewardFlight[] => {
  if (typeof document === 'undefined') {
    return [];
  }

  const startedAt = Date.now();

  return rewardSources.flatMap((source) => {
    const target = document.querySelector<HTMLElement>(
      `[data-reward-target="${source.type}"]`,
    );

    if (!target) {
      return [];
    }

    const targetRect = target.getBoundingClientRect();
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;
    const particleCount = getQuestRewardFlightCount(source.type, source.amount);
    const horizontalSpread =
      Math.min(0.75, 0.1875 + particleCount * 0.0625) * 16;

    return Array.from({ length: particleCount }, (_, index) => {
      const normalizedPosition =
        particleCount > 1 ? index / (particleCount - 1) : 0.5;
      const offsetX = (normalizedPosition - 0.5) * 2 * horizontalSpread;
      const originX = source.x + offsetX + (index % 2 === 0 ? 2 : -2);
      const originY = source.y - QUEST_REWARD_SOURCE_LIFT_PX;
      const delayMs = index * QUEST_REWARD_FLIGHT_STAGGER_MS;

      return {
        ...source,
        id: `${source.id}-${index.toString()}-${startedAt.toString()}`,
        x: originX,
        y: originY,
        dx: targetX - originX,
        dy: targetY - originY,
        delayMs,
      };
    });
  });
};

export const QuestRewardFlightLayer = ({
  flights,
  onDone,
}: {
  flights: QuestRewardFlight[];
  onDone: () => void;
}): ReactElement | null => {
  useEffect(() => {
    if (!flights.length) {
      return undefined;
    }

    const latestDelay = flights.reduce(
      (maxDelay, flight) => Math.max(maxDelay, flight.delayMs),
      0,
    );
    const timeout = window.setTimeout(
      onDone,
      latestDelay + QUEST_REWARD_FLY_DURATION_MS + 120,
    );

    return () => window.clearTimeout(timeout);
  }, [flights, onDone]);

  if (!flights.length) {
    return null;
  }

  return (
    <RootPortal>
      <div
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: QUEST_REWARD_LAYER_Z_INDEX }}
      >
        {flights.map((flight) => {
          const style = {
            left: `${flight.x}px`,
            top: `${flight.y}px`,
            '--quest-reward-fly-x': `${flight.dx}px`,
            '--quest-reward-fly-y': `${flight.dy}px`,
          } as CSSProperties;

          return (
            <span
              key={flight.id}
              className="quest-reward-flight absolute inline-flex items-center justify-center text-text-primary"
              style={{
                ...style,
                animationDelay: `${flight.delayMs}ms`,
              }}
            >
              {getQuestRewardAnimationIcon(flight.type)}
            </span>
          );
        })}
      </div>
    </RootPortal>
  );
};
