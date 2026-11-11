import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  MedalBadgeIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { IntroQuest, QuestId } from './data';
import { introQuests, mockUser, totalRewards } from './data';
import {
  ClaimAllBar,
  CompletionHero,
  HideForever,
  OpenArrow,
  PopupShell,
  QuestCta,
  QuestDetail,
  QuestGlyph,
  RewardTag,
} from './kit';
import { useSim } from './sim';

// D · Journey trail. The giveback reward ladder applied to setup: a vertical
// path with one rule for color. Green is done, your own photo marks where you
// are, gray is ahead, and gold appears exactly once, at the summit. The path
// starts with "Joined daily.dev" already checked (endowed progress) so nobody
// opens it at zero. Only the step you are on is expanded.

type Marker = 'done' | 'here' | 'ahead';

const MarkerDot = ({
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

const Connector = ({ filled }: { filled: boolean }): ReactElement => (
  <span
    aria-hidden
    className={classNames(
      'absolute bottom-0 left-4 top-8 w-0.5 -translate-x-1/2',
      filled ? 'bg-accent-avocado-default' : 'bg-border-subtlest-tertiary',
    )}
  />
);

const Step = ({
  quest,
  number,
  marker,
  isOpen,
  onToggle,
}: {
  quest: IntroQuest;
  number: number;
  marker: Marker;
  isOpen: boolean;
  onToggle: () => void;
}): ReactElement => {
  const sim = useSim();
  const phase = sim.phaseOf(quest.id);

  return (
    <li className="relative flex gap-3 pb-4">
      <Connector filled={marker === 'done'} />
      <MarkerDot marker={phase === 'ready' ? 'done' : marker} number={number} />
      <div
        className={classNames(
          'flex min-w-0 flex-1 flex-col gap-3 rounded-16',
          isOpen &&
            'border border-border-subtlest-tertiary bg-surface-float p-4',
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="group flex min-h-8 w-full items-center gap-2 text-left"
        >
          <span className="min-w-0 flex-1">
            <span
              className={classNames(
                'block truncate font-bold typo-callout',
                phase === 'claimed'
                  ? 'text-text-tertiary'
                  : 'text-text-primary',
              )}
            >
              {phase === 'claimed' ? quest.doneLabel : quest.name}
            </span>
            {quest.optional && !isOpen && phase !== 'claimed' && (
              <span className="text-text-quaternary typo-caption1">
                Optional
              </span>
            )}
          </span>
          {phase === 'claimed' ? (
            <RewardTag xp={quest.xp} cores={quest.cores} tone="done" />
          ) : (
            !isOpen && (
              <>
                <RewardTag xp={quest.xp} cores={quest.cores} />
                <OpenArrow />
              </>
            )
          )}
        </button>
        {isOpen && (
          <div className="iq-rise flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <QuestGlyph quest={quest} showDone={false} />
              <p className="iq-pretty min-w-0 flex-1 text-text-secondary typo-footnote">
                {quest.pitch}
              </p>
            </div>
            <div className="empty:hidden">
              <QuestDetail quest={quest} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <QuestCta quest={quest} />
              <RewardTag xp={quest.xp} cores={quest.cores} />
            </div>
          </div>
        )}
      </div>
    </li>
  );
};

export const VariantJourney = ({
  device = 'desktop',
}: {
  device?: 'desktop' | 'mobile';
}): ReactElement => {
  const sim = useSim();
  const [openId, setOpenId] = useState<QuestId | 'none' | null>(null);
  const hereId = sim.nextQuest?.id ?? null;
  const expandedId = openId === 'none' ? null : openId ?? hereId;
  const allClaimed = introQuests.every(
    ({ id }) => sim.phaseOf(id) === 'claimed',
  );
  const left = introQuests.length - sim.doneCount;

  if (allClaimed) {
    return (
      <PopupShell device={device} width="32rem">
        <div className="p-6">
          <CompletionHero />
        </div>
      </PopupShell>
    );
  }

  return (
    <PopupShell device={device} width="32rem">
      <header className="flex flex-col gap-1 p-6 pb-4 pr-14">
        <h2 className="iq-balance font-bold text-text-primary typo-title3">
          {mockUser.name}, you are {left} {left === 1 ? 'step' : 'steps'} from a
          fully set up daily.dev
        </h2>
        <p className="text-text-tertiary typo-footnote">
          Every step pays out. The summit pays {totalRewards.xp} XP in total.
        </p>
      </header>

      <ol className="flex flex-col px-6">
        <li className="relative flex items-center gap-3 pb-4">
          <Connector filled />
          <MarkerDot marker="done" />
          <span className="text-text-tertiary typo-callout">
            Joined daily.dev
          </span>
        </li>
        {introQuests.map((quest, index) => {
          let marker: Marker = 'ahead';

          if (sim.phaseOf(quest.id) === 'claimed') {
            marker = 'done';
          } else if (quest.id === hereId) {
            marker = 'here';
          }

          return (
            <Step
              key={quest.id}
              quest={quest}
              number={index + 1}
              marker={marker}
              isOpen={expandedId === quest.id}
              onToggle={() =>
                setOpenId(expandedId === quest.id ? 'none' : quest.id)
              }
            />
          );
        })}
        <li className="flex items-center gap-3 pb-2">
          <span className="z-1 flex size-8 shrink-0 items-center justify-center rounded-max bg-accent-cheese-flat text-accent-cheese-default">
            <MedalBadgeIcon size={IconSize.Size16} secondary />
          </span>
          <span className="flex-1 font-bold text-accent-cheese-default typo-callout">
            Fully set up
          </span>
          <RewardTag
            xp={totalRewards.xp}
            cores={totalRewards.cores}
            className="!text-accent-cheese-default"
          />
        </li>
      </ol>

      <footer className="sticky bottom-0 mt-auto flex flex-col items-center gap-3 bg-background-default p-4">
        <ClaimAllBar />
        <HideForever />
      </footer>
    </PopupShell>
  );
};
