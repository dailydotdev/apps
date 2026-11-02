import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { LockIcon, VIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { IntroQuest } from '../data';
import { introQuests } from '../data';
import {
  ClaimAllBar,
  CompletionHero,
  HideForever,
  PopupShell,
  QuestCta,
  QuestDetail,
  QuestGlyph,
  RewardTag,
  clickRowCta,
} from '../kit';
import { useSim } from '../sim';

// 3 · Chapters. Appcues took checklist completion from 2% to 25% by cutting
// one long list into short ones that unlock each other. Here day one is four
// essentials. The builder pair is a second chapter, visible as a locked
// teaser so it reads as a reward for finishing, not as more homework.

const essentials = introQuests.filter(({ group }) => group !== 'builders');
const builders = introQuests.filter(({ group }) => group === 'builders');

const Row = ({ quest }: { quest: IntroQuest }): ReactElement => {
  const sim = useSim();
  const phase = sim.phaseOf(quest.id);
  const isNext = sim.nextQuest?.id === quest.id;

  return (
    <li
      onClick={clickRowCta}
      className={classNames(
        'iq-press flex cursor-pointer flex-col gap-3 rounded-16 border p-3',
        isNext
          ? 'border-border-subtlest-secondary bg-surface-float'
          : 'border-transparent hover:bg-surface-hover',
        phase === 'claimed' && 'cursor-default opacity-60',
      )}
    >
      <div className="flex items-center gap-3">
        <QuestGlyph quest={quest} />
        <div className="min-w-0 flex-1">
          <p
            className={classNames(
              'truncate font-bold typo-callout',
              phase === 'claimed'
                ? 'text-text-tertiary line-through'
                : 'text-text-primary',
            )}
          >
            {quest.name}
          </p>
          {isNext && (
            <p className="iq-pretty text-text-tertiary typo-footnote">
              {quest.pitch}
            </p>
          )}
        </div>
        <QuestCta quest={quest} quiet={!isNext} />
      </div>
      {isNext && (
        <div className="empty:hidden pl-[3.25rem]">
          <QuestDetail quest={quest} />
        </div>
      )}
    </li>
  );
};

export const Chapters = ({
  device = 'desktop',
}: {
  device?: 'desktop' | 'mobile';
}): ReactElement => {
  const sim = useSim();
  const essentialsDone = essentials.every(
    ({ id }) => sim.phaseOf(id) === 'claimed',
  );
  const allDone = introQuests.every(({ id }) => sim.phaseOf(id) === 'claimed');
  const chapter = essentialsDone ? builders : essentials;
  const chapterDone = chapter.filter(({ id }) => sim.isDone(id)).length;

  if (allDone) {
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
      <header className="flex flex-col gap-3 p-6 pb-4 pr-14">
        <div className="flex gap-1.5">
          {[essentials, builders].map((group, index) => (
            <span
              key={group[0].id}
              className={classNames(
                'h-1 w-8 rounded-max',
                (index === 0 || essentialsDone) && 'bg-text-primary',
                index === 1 && !essentialsDone && 'bg-surface-float',
              )}
            />
          ))}
        </div>
        <p className="font-bold text-text-tertiary typo-footnote">
          Chapter {essentialsDone ? 2 : 1} of 2
        </p>
        <h2 className="iq-balance font-bold text-text-primary typo-title2">
          {essentialsDone ? 'Your feed, in code' : 'The essentials'}
        </h2>
        <p className="iq-tabular text-text-tertiary typo-callout">
          {chapterDone} of {chapter.length} done
          {essentialsDone && ' · optional'}
        </p>
      </header>

      {essentialsDone && (
        <div className="iq-rise mx-6 mb-3 flex items-center gap-2 rounded-12 bg-accent-avocado-flat px-3 py-2 text-accent-avocado-default typo-footnote">
          <VIcon size={IconSize.Size16} secondary />
          <span className="font-bold">Essentials done.</span>
          <span className="text-text-secondary">Chapter 2 unlocked.</span>
        </div>
      )}

      <ol
        key={essentialsDone ? 'builders' : 'essentials'}
        className="iq-rise flex flex-col gap-1 px-4"
      >
        {chapter.map((quest) => (
          <Row key={quest.id} quest={quest} />
        ))}
      </ol>

      {!essentialsDone && (
        <div className="mx-6 mt-4 flex items-center gap-3 rounded-16 border border-dashed border-border-subtlest-secondary p-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-surface-float text-text-tertiary">
            <LockIcon />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-text-secondary typo-footnote">
              Chapter 2 · Your feed, in code
            </p>
            <p className="text-text-tertiary typo-caption1">
              Unlocks after the essentials. API key and your first call.
            </p>
          </div>
          <RewardTag
            xp={builders.reduce((acc, quest) => acc + quest.xp, 0)}
            cores={builders.reduce((acc, quest) => acc + quest.cores, 0)}
          />
        </div>
      )}

      <footer className="sticky bottom-0 mt-auto flex flex-col items-center gap-3 bg-background-default p-4">
        <ClaimAllBar />
        <HideForever />
      </footer>
    </PopupShell>
  );
};
