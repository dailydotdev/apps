import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { IntroQuest } from './data';
import { introQuests, totalRewards } from './data';
import {
  ClaimAllBar,
  CompletionHero,
  HideForever,
  clickRowCta,
  PopupShell,
  QuestCta,
  QuestDetail,
  QuestGlyph,
  SegmentMeter,
} from './kit';
import { useSim } from './sim';

// B · Action cards. The giveback "Take action" grammar: a grid of self
// contained tiles, the payout set big in the corner, the verb as a full width
// button at the foot of each card. Finished tiles keep their place but go flat
// with a dashed edge, so the grid reads as a board you are clearing. The two
// API steps share one wide card because the second only exists after the first.

const Payout = ({ quest }: { quest: IntroQuest }): ReactElement => {
  const { phaseOf } = useSim();
  const claimed = phaseOf(quest.id) === 'claimed';

  return (
    <span
      className={classNames(
        'iq-tabular flex shrink-0 flex-col items-end leading-none',
        claimed && 'opacity-50',
      )}
    >
      <span
        className={classNames(
          'font-bold typo-title3',
          claimed ? 'text-text-quaternary line-through' : 'text-status-success',
        )}
      >
        +{quest.xp} XP
      </span>
      <span className="mt-1 inline-flex items-center gap-0.5 text-text-tertiary typo-caption1">
        <CoreIcon
          size={IconSize.XXSmall}
          className="text-accent-cheese-default"
        />
        {quest.cores} Cores
      </span>
    </span>
  );
};

const ActionCard = ({ quest }: { quest: IntroQuest }): ReactElement => {
  const sim = useSim();
  const phase = sim.phaseOf(quest.id);
  const claimed = phase === 'claimed';
  const isNext = sim.nextQuest?.id === quest.id;

  return (
    <article
      onClick={clickRowCta}
      className={classNames(
        'iq-press group relative flex cursor-pointer flex-col gap-3 overflow-hidden rounded-16 p-4',
        claimed &&
          'border border-dashed border-border-subtlest-tertiary bg-transparent',
        !claimed &&
          phase === 'ready' &&
          'border border-accent-avocado-subtler bg-accent-avocado-flat',
        !claimed &&
          phase !== 'ready' &&
          'border border-transparent bg-surface-float hover:-translate-y-0.5 hover:bg-surface-hover',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <QuestGlyph quest={quest} muted={claimed} />
        <Payout quest={quest} />
      </div>
      <div className="flex flex-col gap-1">
        <h3
          className={classNames(
            'font-bold typo-callout',
            claimed ? 'text-text-quaternary line-through' : 'text-text-primary',
          )}
        >
          {quest.name}
        </h3>
        {!claimed && (
          <p className="iq-pretty text-text-tertiary typo-footnote">
            {quest.pitch}
          </p>
        )}
      </div>
      <div className="empty:hidden">
        <QuestDetail quest={quest} compact />
      </div>
      <div className="mt-auto">
        <QuestCta
          quest={quest}
          size={ButtonSize.Medium}
          block={!claimed}
          quiet={!isNext}
        />
      </div>
    </article>
  );
};

const BuilderCard = ({ columns }: { columns: string }): ReactElement => {
  const sim = useSim();
  const steps = introQuests.filter(({ group }) => group === 'builders');
  const allClaimed = steps.every(({ id }) => sim.phaseOf(id) === 'claimed');

  return (
    <article
      className={classNames(
        'col-span-full flex flex-col gap-4 rounded-16 p-4',
        allClaimed
          ? 'border border-dashed border-border-subtlest-tertiary'
          : 'border border-border-subtlest-tertiary bg-background-subtle',
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-bold text-text-primary typo-callout">
          Your feed, in code
        </h3>
        <span className="text-text-quaternary typo-caption1">
          Optional · 2 steps
        </span>
      </div>
      <div className={classNames('grid gap-3', columns)}>
        {steps.map((quest, index) => {
          const phase = sim.phaseOf(quest.id);

          return (
            <div key={quest.id} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <QuestGlyph quest={quest} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-text-quaternary typo-caption2">
                    Step {index + 1}
                  </p>
                  <p
                    className={classNames(
                      'truncate font-bold typo-footnote',
                      phase === 'claimed'
                        ? 'text-text-quaternary line-through'
                        : 'text-text-primary',
                    )}
                  >
                    {quest.name}
                  </p>
                </div>
                <span className="iq-tabular font-bold text-status-success typo-footnote">
                  +{quest.xp} XP
                </span>
              </div>
              <div className="empty:hidden">
                <QuestDetail quest={quest} />
              </div>
              <QuestCta quest={quest} quiet block={phase !== 'claimed'} />
            </div>
          );
        })}
      </div>
    </article>
  );
};

export const VariantCards = ({
  device = 'desktop',
}: {
  device?: 'desktop' | 'mobile';
}): ReactElement => {
  const sim = useSim();
  const core = introQuests.filter(({ group }) => group !== 'builders');
  const allClaimed = introQuests.every(
    ({ id }) => sim.phaseOf(id) === 'claimed',
  );
  const left = introQuests.length - sim.doneCount;
  const columns = device === 'mobile' ? 'grid-cols-1' : 'grid-cols-2';

  return (
    <PopupShell device={device} width="46rem">
      {allClaimed ? (
        <div className="p-6">
          <CompletionHero />
        </div>
      ) : (
        <>
          <header className="flex flex-col gap-4 p-6 pb-5">
            <div className="flex flex-col gap-1 pr-8">
              <p className="font-bold text-accent-avocado-default typo-footnote">
                Earn {totalRewards.xp} XP and {totalRewards.cores} Cores
              </p>
              <h2 className="iq-balance font-bold text-text-primary typo-title2">
                {left === 1
                  ? 'One last thing to set up'
                  : `${left} things to set up daily.dev`}
              </h2>
            </div>
            <SegmentMeter />
          </header>

          <div className={classNames('grid gap-3 px-6', columns)}>
            {core.map((quest) => (
              <ActionCard key={quest.id} quest={quest} />
            ))}
            <BuilderCard columns={columns} />
          </div>

          <footer className="sticky bottom-0 mt-auto flex flex-col items-center gap-3 bg-background-default p-6 pt-4">
            <ClaimAllBar />
            <HideForever />
          </footer>
        </>
      )}
    </PopupShell>
  );
};
