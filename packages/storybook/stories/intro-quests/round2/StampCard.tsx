import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import { VIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import type { QuestId } from '../data';
import { introQuests, totalRewards } from '../data';
import {
  CompletionHero,
  HideForever,
  PopupShell,
  QuestCta,
  QuestDetail,
  QuestGlyph,
  RewardTag,
} from '../kit';
import { useSim } from '../sim';

// 1 · Stamp card. Kivetz's coffee card, literally: eight slots, two already
// stamped for things the user really did in signup (joined, picked topics), so
// the head start is honest. Claiming a quest is pressing the stamp. People
// speed up as the card fills, so the remaining count is the headline.

const endowed = ['Joined', 'Topics'];

const Slot = ({
  id,
  isSelected,
  onSelect,
}: {
  id: QuestId;
  isSelected: boolean;
  onSelect: () => void;
}): ReactElement => {
  const sim = useSim();
  const quest = introQuests.find((item) => item.id === id)!;
  const phase = sim.phaseOf(id);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      aria-label={quest.name}
      className={classNames(
        'iq-press relative flex aspect-square flex-col items-center justify-center gap-1 rounded-max border-2',
        phase === 'claimed' && 'border-transparent bg-accent-avocado-default',
        phase === 'ready' &&
          'iq-pulse border-accent-avocado-default bg-accent-avocado-flat',
        (phase === 'todo' || phase === 'working') &&
          'border-dashed border-border-subtlest-secondary hover:border-text-tertiary',
        isSelected &&
          'ring-2 ring-text-primary ring-offset-2 ring-offset-background-subtle',
      )}
    >
      {phase === 'claimed' ? (
        <span className="iq-pop -rotate-12 text-white">
          <LogoIcon
            className={{ container: 'size-7 [&_g]:[fill:currentColor]' }}
          />
        </span>
      ) : (
        <QuestGlyph quest={quest} size="sm" showDone={false} />
      )}
    </button>
  );
};

export const StampCard = ({
  device = 'desktop',
}: {
  device?: 'desktop' | 'mobile';
}): ReactElement => {
  const sim = useSim();
  const [selectedId, setSelectedId] = useState<QuestId | null>(null);
  const claimed = introQuests.filter(
    ({ id }) => sim.phaseOf(id) === 'claimed',
  ).length;
  const stamps = claimed + endowed.length;
  const total = introQuests.length + endowed.length;
  const left = total - stamps;
  const selected =
    introQuests.find(({ id }) => id === (selectedId ?? sim.nextQuest?.id)) ??
    null;

  if (left === 0) {
    return (
      <PopupShell device={device} width="30rem">
        <div className="p-6">
          <CompletionHero />
        </div>
      </PopupShell>
    );
  }

  return (
    <PopupShell device={device} width="30rem">
      <div className="flex flex-col gap-5 p-6">
        <header className="flex flex-col gap-1 pr-8">
          <h2 className="iq-balance font-bold text-text-primary typo-title2">
            {left === 1 ? 'One stamp to go' : `${left} stamps to go`}
          </h2>
          <p className="text-text-tertiary typo-callout">
            Fill the card, get {totalRewards.xp} XP and {totalRewards.cores}{' '}
            Cores.
          </p>
        </header>

        <div className="relative overflow-hidden rounded-20 border border-border-subtlest-tertiary bg-background-subtle p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-text-primary typo-footnote">
              <LogoIcon className={{ container: 'size-4' }} />
              daily.dev setup card
            </span>
            <span className="iq-tabular font-bold text-text-tertiary typo-caption1">
              {stamps}/{total}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {endowed.map((label) => (
              <span
                key={label}
                className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-max bg-accent-avocado-default text-white"
              >
                <VIcon size={IconSize.Size16} secondary />
                <span className="font-bold typo-caption2">{label}</span>
              </span>
            ))}
            {introQuests.map((quest) => (
              <Slot
                key={quest.id}
                id={quest.id}
                isSelected={selected?.id === quest.id}
                onSelect={() => setSelectedId(quest.id)}
              />
            ))}
          </div>
        </div>

        {selected && (
          <div key={selected.id} className="iq-rise flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-text-primary typo-callout">
                  {selected.name}
                </p>
                <p className="iq-pretty text-text-tertiary typo-footnote">
                  {selected.pitch}
                </p>
              </div>
              <RewardTag xp={selected.xp} cores={selected.cores} />
            </div>
            <div className="empty:hidden">
              <QuestDetail quest={selected} />
            </div>
            <QuestCta quest={selected} size={ButtonSize.Large} block />
          </div>
        )}
      </div>
      <footer className="mt-auto flex justify-center p-4 pt-0">
        <HideForever />
      </footer>
    </PopupShell>
  );
};
