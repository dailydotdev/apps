import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import { VIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { IntroQuest, QuestGroup, QuestId } from './data';
import { groupMeta, introQuests, totalRewards } from './data';
import {
  ClaimAllBar,
  CompletionHero,
  HideForever,
  PopupShell,
  ProgressRing,
  QuestCta,
  QuestDetail,
  RewardTag,
} from './kit';
import { useSim } from './sim';

// E · Header popover, grouped. Setup should not cost a modal: this drops out of
// the header button the user clicked and leaves the feed visible behind it.
// Quests are grouped by what they get you, the API pair is labeled optional,
// and rows are an accordion with the next open step already expanded. A
// collapsed row still carries its action on the right, so a one-click quest
// never needs the expand at all.

const groups: QuestGroup[] = ['setup', 'yours', 'builders'];

const StatusCircle = ({ quest }: { quest: IntroQuest }): ReactElement => {
  const { phaseOf } = useSim();
  const phase = phaseOf(quest.id);

  if (phase === 'claimed' || phase === 'ready') {
    return (
      <span
        className={classNames(
          'flex size-5 shrink-0 items-center justify-center rounded-max',
          phase === 'claimed'
            ? 'bg-accent-avocado-default text-white'
            : 'border-2 border-accent-avocado-default text-accent-avocado-default',
        )}
      >
        <VIcon className="iq-pop" size={IconSize.XXSmall} secondary />
      </span>
    );
  }

  return (
    <span
      className={classNames(
        'size-5 shrink-0 rounded-max border-2',
        phase === 'working'
          ? 'iq-pulse border-text-tertiary'
          : 'border-border-subtlest-secondary',
      )}
    />
  );
};

const Row = ({
  quest,
  isOpen,
  onToggle,
}: {
  quest: IntroQuest;
  isOpen: boolean;
  onToggle: () => void;
}): ReactElement => {
  const sim = useSim();
  const phase = sim.phaseOf(quest.id);
  const claimed = phase === 'claimed';

  return (
    <li
      className={classNames(
        'rounded-12 transition-colors duration-150',
        isOpen ? 'bg-surface-float' : 'hover:bg-surface-hover',
      )}
    >
      <div className="flex items-center gap-3 px-3 py-2">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <StatusCircle quest={quest} />
          <span
            className={classNames(
              'min-w-0 flex-1 truncate typo-callout',
              claimed
                ? 'text-text-tertiary line-through'
                : 'font-bold text-text-primary',
            )}
          >
            {quest.name}
          </span>
        </button>
        {!isOpen && !claimed && (
          <QuestCta
            quest={quest}
            size={ButtonSize.XSmall}
            quiet
            onOpenDetail={onToggle}
          />
        )}
        {claimed && <RewardTag xp={quest.xp} cores={quest.cores} tone="done" />}
      </div>
      {isOpen && (
        <div className="iq-rise flex flex-col gap-3 px-3 pb-3 pl-11">
          <p className="iq-pretty text-text-secondary typo-footnote">
            {quest.pitch}
          </p>
          <div className="empty:hidden">
            <QuestDetail quest={quest} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <QuestCta quest={quest} />
            <RewardTag xp={quest.xp} cores={quest.cores} />
          </div>
        </div>
      )}
    </li>
  );
};

export const VariantPopover = ({
  device = 'desktop',
}: {
  device?: 'desktop' | 'mobile';
}): ReactElement => {
  const sim = useSim();
  const [openId, setOpenId] = useState<QuestId | 'none' | null>(null);
  const expandedId =
    openId === 'none' ? null : openId ?? sim.nextQuest?.id ?? null;
  const allClaimed = introQuests.every(
    ({ id }) => sim.phaseOf(id) === 'claimed',
  );

  return (
    <PopupShell
      device={device}
      width="28rem"
      className={
        device === 'desktop' ? '!max-h-[42rem] !rounded-16' : undefined
      }
    >
      {allClaimed ? (
        <div className="p-4">
          <CompletionHero />
        </div>
      ) : (
        <>
          <header className="flex items-center gap-3 p-4 pr-12">
            <ProgressRing size={40} />
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-text-primary typo-body">
                Set up daily.dev
              </h2>
              <p className="iq-tabular text-text-tertiary typo-caption1">
                {sim.doneCount} of {introQuests.length} done · {sim.earned.xp}/
                {totalRewards.xp} XP earned
              </p>
            </div>
          </header>

          <div className="flex flex-col gap-4 px-2 pb-2">
            {groups.map((group) => {
              const quests = introQuests.filter(
                (quest) => quest.group === group,
              );

              return (
                <section key={group} className="flex flex-col gap-0.5">
                  <div className="flex items-baseline justify-between gap-2 px-3 pb-1">
                    <p className="font-bold text-text-tertiary typo-caption1">
                      {groupMeta[group].title}
                    </p>
                    {group === 'builders' && (
                      <span className="text-text-quaternary typo-caption2">
                        Optional
                      </span>
                    )}
                  </div>
                  <ul className="flex flex-col gap-0.5">
                    {quests.map((quest) => (
                      <Row
                        key={quest.id}
                        quest={quest}
                        isOpen={expandedId === quest.id}
                        onToggle={() =>
                          setOpenId(expandedId === quest.id ? 'none' : quest.id)
                        }
                      />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>

          <footer className="sticky bottom-0 mt-auto flex flex-col items-center gap-2 border-t border-border-subtlest-tertiary bg-background-default p-3">
            <ClaimAllBar />
            <HideForever />
          </footer>
        </>
      )}
    </PopupShell>
  );
};
