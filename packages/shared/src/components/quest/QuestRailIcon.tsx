import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import { useQuestDashboard } from '../../hooks/useQuestDashboard';
import { JoystickIcon } from '../icons';
import { IconSize } from '../Icon';

interface QuestRailIconProps {
  active: boolean;
}

const SIZE = 20;
const STROKE = 2;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Rail icon for the Game Center sidebar tab. Falls back to the joystick
// glyph when the quest dashboard hasn't loaded yet so the rail never
// shows an empty slot during hydration.
export const QuestRailIcon = ({ active }: QuestRailIconProps): ReactElement => {
  const { data } = useQuestDashboard();
  const level = data?.level;

  if (!level) {
    return (
      <JoystickIcon secondary={active} size={IconSize.Small} aria-hidden />
    );
  }

  const totalForLevel = level.xpInLevel + level.xpToNextLevel;
  const progress = totalForLevel
    ? Math.min(100, (level.xpInLevel / totalForLevel) * 100)
    : 0;

  return (
    <span
      className="relative inline-flex size-5 items-center justify-center"
      aria-hidden
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        fill="none"
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          className={classNames(
            'fill-none',
            active ? 'stroke-text-tertiary' : 'stroke-border-subtlest-tertiary',
          )}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress / 100)}
          className={classNames(
            'fill-none transition-[stroke-dashoffset] duration-300 ease-out',
            active ? 'stroke-text-primary' : 'stroke-text-tertiary',
          )}
        />
      </svg>
      <span
        className={classNames(
          'absolute font-bold typo-caption2',
          active ? 'text-text-primary' : 'text-text-tertiary',
        )}
      >
        {level.level}
      </span>
    </span>
  );
};
