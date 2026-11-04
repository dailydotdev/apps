import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { IntroQuest } from './data';
import { introQuests, totalRewards } from './data';
import {
  ClaimAllBar,
  CompletionHero,
  HideForever,
  clickRowCta,
  PopupShell,
  ProgressMeter,
  QuestCta,
  QuestDetail,
  QuestGlyph,
  RewardTag,
} from './kit';
import { useSim } from './sim';

// A · Action list. The smallest step from today: same single column, same six
// rows, but every row carries a labeled button with the real verb ("Add to
// Chrome", "Turn on"), the row itself is the hit area, and finished rows fold
// into one line at the bottom so the list only ever shows what is left.

const ListRow = ({
  quest,
  isCompact,
}: {
  quest: IntroQuest;
  isCompact: boolean;
}): ReactElement => {
  const sim = useSim();
  const phase = sim.phaseOf(quest.id);
  const isNext = sim.nextQuest?.id === quest.id;

  return (
    <li
      onClick={clickRowCta}
      className={classNames(
        'iq-press group flex cursor-pointer flex-col gap-2 rounded-16 border p-3',
        phase === 'ready'
          ? 'border-accent-avocado-subtler bg-accent-avocado-flat'
          : 'border-border-subtlest-tertiary hover:border-border-subtlest-secondary hover:bg-surface-hover',
      )}
    >
      <div className="flex items-center gap-3">
        <QuestGlyph quest={quest} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate font-bold text-text-primary typo-callout">
            {quest.name}
          </p>
          <p className="iq-pretty text-text-tertiary typo-footnote">
            {quest.pitch}
          </p>
        </div>
        {!isCompact && (
          <div className="flex shrink-0 flex-col items-end gap-1">
            <QuestCta quest={quest} quiet={!isNext} />
            {phase !== 'ready' && (
              <RewardTag xp={quest.xp} cores={quest.cores} />
            )}
          </div>
        )}
      </div>
      <div className="empty:hidden pl-[3.25rem]">
        <QuestDetail quest={quest} compact={!isNext} />
      </div>
      {isCompact && (
        <div className="flex items-center justify-between gap-2 pl-[3.25rem]">
          <QuestCta quest={quest} quiet={!isNext} />
          {phase !== 'ready' && <RewardTag xp={quest.xp} cores={quest.cores} />}
        </div>
      )}
    </li>
  );
};

const DoneRow = ({ quest }: { quest: IntroQuest }): ReactElement => (
  <li className="flex items-center gap-3 px-3 py-1.5">
    <QuestGlyph quest={quest} size="sm" />
    <p className="min-w-0 flex-1 truncate text-text-tertiary line-through typo-footnote">
      {quest.doneLabel}
    </p>
    <RewardTag xp={quest.xp} cores={quest.cores} tone="done" />
  </li>
);

export const VariantList = ({
  device = 'desktop',
}: {
  device?: 'desktop' | 'mobile';
}): ReactElement => {
  const sim = useSim();
  const [showDone, setShowDone] = useState(false);
  const open = introQuests.filter(({ id }) => sim.phaseOf(id) !== 'claimed');
  const done = introQuests.filter(({ id }) => sim.phaseOf(id) === 'claimed');

  return (
    <PopupShell device={device} width="36rem">
      {open.length === 0 ? (
        <div className="p-6">
          <CompletionHero />
        </div>
      ) : (
        <>
          <header className="flex flex-col gap-4 p-6 pb-4">
            <div className="flex flex-col gap-1 pr-8">
              <h2 className="iq-balance font-bold text-text-primary typo-title3">
                Get the most out of daily.dev
              </h2>
              <p className="text-text-tertiary typo-callout">
                {introQuests.length} quick wins. Earn {totalRewards.xp} XP and{' '}
                {totalRewards.cores} Cores along the way.
              </p>
            </div>
            <ProgressMeter />
          </header>

          <ol className="flex flex-col gap-2 px-4">
            {open.map((quest) => (
              <ListRow
                key={quest.id}
                quest={quest}
                isCompact={device === 'mobile'}
              />
            ))}
          </ol>

          {done.length > 0 && (
            <div className="mt-3 px-4">
              <button
                type="button"
                onClick={() => setShowDone((value) => !value)}
                className="flex w-full items-center gap-1 px-3 py-2 font-bold text-text-tertiary typo-footnote hover:text-text-primary"
              >
                Completed ({done.length})
                <ArrowIcon
                  size={IconSize.Size16}
                  className={classNames(
                    'transition-transform duration-150',
                    showDone ? 'rotate-0' : 'rotate-180',
                  )}
                />
              </button>
              {showDone && (
                <ul className="flex flex-col">
                  {done.map((quest) => (
                    <DoneRow key={quest.id} quest={quest} />
                  ))}
                </ul>
              )}
            </div>
          )}

          <footer className="sticky bottom-0 mt-auto flex flex-col items-center gap-3 bg-background-default p-4 pt-3">
            <ClaimAllBar />
            <HideForever />
          </footer>
        </>
      )}
    </PopupShell>
  );
};
