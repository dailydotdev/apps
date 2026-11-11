import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  MedalBadgeIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { IntroQuest } from '../data';
import { mockUser, totalRewards } from '../data';
import { useSim } from '../sim';
import { FinalCta } from './kit';

// Timeline pieces shared by the journey trail and the combined finalist:
// green is done, your photo is where you are, gray is ahead, gold appears
// once at the summit.

export type Marker = 'done' | 'here' | 'ahead';

export const TrailDot = ({
  marker,
  number,
}: {
  marker: Marker;
  number?: number;
}): ReactElement => {
  if (marker === 'done') {
    return (
      <span className="z-1 flex size-8 shrink-0 items-center justify-center rounded-max bg-accent-avocado-default text-white">
        <VIcon className="iq-pop" size={IconSize.Size16} secondary />
      </span>
    );
  }

  if (marker === 'here') {
    return (
      <img
        src={mockUser.image}
        alt="You are here"
        className="z-1 size-8 shrink-0 rounded-max object-cover ring-2 ring-brand-default ring-offset-2 ring-offset-background-default"
      />
    );
  }

  return (
    <span className="iq-tabular z-1 flex size-8 shrink-0 items-center justify-center rounded-max border border-border-subtlest-secondary bg-background-default font-bold text-text-tertiary typo-caption1">
      {number}
    </span>
  );
};

export const TrailLine = ({ filled }: { filled: boolean }): ReactElement => (
  <span
    aria-hidden
    className={classNames(
      'absolute bottom-0 left-4 top-8 w-0.5 -translate-x-1/2',
      filled ? 'bg-accent-avocado-default' : 'bg-border-subtlest-tertiary',
    )}
  />
);

export const JoinedStep = (): ReactElement => (
  <li className="relative flex gap-3 pb-4">
    <TrailLine filled />
    <TrailDot marker="done" />
    <div className="flex min-w-0 flex-1 flex-col">
      <span className="font-bold text-text-primary typo-callout">
        You joined daily.dev{' '}
        <span role="img" aria-label="celebrate">
          🎉
        </span>
      </span>
      <span className="text-text-tertiary typo-caption1">
        Today. Welcome aboard, {mockUser.name}.
      </span>
    </div>
  </li>
);

export const SummitStep = ({
  rewards = totalRewards,
}: {
  rewards?: { xp: number; cores: number };
}): ReactElement => (
  <li className="flex items-center gap-3 pb-2">
    <span className="z-1 flex size-8 shrink-0 items-center justify-center rounded-max bg-accent-cheese-flat text-accent-cheese-default">
      <MedalBadgeIcon size={IconSize.Size16} secondary />
    </span>
    <span className="flex-1 font-bold text-accent-cheese-default typo-callout">
      Fully set up
    </span>
    <span className="iq-tabular font-bold text-accent-cheese-default typo-caption1">
      {rewards.xp} XP · {rewards.cores} Cores
    </span>
  </li>
);

export const TrailStep = ({
  quest,
  number,
  marker,
  isOpen,
  onToggle,
  children,
}: {
  quest: IntroQuest;
  number: number;
  marker: Marker;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}): ReactElement => {
  const sim = useSim();
  const phase = sim.phaseOf(quest.id);
  const claimed = phase === 'claimed';

  return (
    <li className="relative flex gap-3 pb-3">
      <TrailLine filled={marker === 'done'} />
      <TrailDot
        marker={sim.isDone(quest.id) ? 'done' : marker}
        number={number}
      />
      <div
        className={classNames(
          'flex min-w-0 flex-1 flex-col gap-3 rounded-16',
          isOpen && 'border border-border-subtlest-secondary p-4',
        )}
      >
        <div className="flex min-h-8 items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            disabled={claimed}
            className="flex min-w-0 flex-1 flex-col text-left"
          >
            <span
              className={classNames(
                'truncate typo-callout',
                claimed ? 'text-text-tertiary' : 'font-bold text-text-primary',
              )}
            >
              {claimed ? quest.doneLabel : quest.name}
            </span>
            {!isOpen && !claimed && (
              <span className="iq-tabular text-text-quaternary typo-caption1">
                +{quest.xp} XP · {quest.minutes}
                {quest.optional ? ' · Optional' : ''}
              </span>
            )}
          </button>
          {claimed && (
            <span className="iq-tabular text-text-quaternary line-through typo-caption1">
              +{quest.xp} XP
            </span>
          )}
          {!claimed && !isOpen && (
            <FinalCta quest={quest} short onOpen={onToggle} />
          )}
        </div>
        {isOpen && !claimed && (
          <div className="iq-rise flex flex-col gap-3">{children}</div>
        )}
      </div>
    </li>
  );
};
