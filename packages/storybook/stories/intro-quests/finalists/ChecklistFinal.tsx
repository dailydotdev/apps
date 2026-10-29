import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { VIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { QuestId } from '../data';
import { introQuests } from '../data';
import { ClaimAllBar, CompletionHero, HideForever } from '../kit';
import { useSim } from '../sim';
import type { Frame } from './kit';
import { FinalCta, Meta, QuestWork, SetupHeader, Surface } from './kit';

// Finalist 2 · Checklist. Concept 4's list as it read on a phone, without the
// picture: dashed circles that fill green, the step you are on open with only
// what it needs and the one button. Round one B's header on top.

export const ChecklistFinal = ({
  device = 'desktop',
  frame = 'modal',
  onClose,
}: {
  device?: 'desktop' | 'mobile';
  frame?: Frame;
  onClose?: () => void;
}): ReactElement => {
  const sim = useSim();
  const [openId, setOpenId] = useState<QuestId | null>(null);
  const activeId =
    openId && sim.phaseOf(openId) !== 'claimed'
      ? openId
      : sim.nextQuest?.id ?? null;
  const allClaimed = introQuests.every(
    ({ id }) => sim.phaseOf(id) === 'claimed',
  );
  const left = introQuests.length - sim.doneCount;

  return (
    <Surface frame={frame} device={device} onClose={onClose} fitContent>
      {allClaimed || !activeId ? (
        <div className="p-6">
          <CompletionHero onClose={onClose} />
        </div>
      ) : (
        <>
          <SetupHeader
            title={
              left <= 1
                ? 'One last thing to set up'
                : `${left} things to set up daily.dev`
            }
          />

          <ol className="flex flex-col gap-1 px-2">
            {introQuests.map((quest) => {
              const isOpen = quest.id === activeId;
              const phase = sim.phaseOf(quest.id);
              const done = sim.isDone(quest.id);

              return (
                <li
                  key={quest.id}
                  className={classNames(
                    'rounded-16 transition-colors duration-150',
                    isOpen ? 'bg-surface-float' : 'hover:bg-surface-hover',
                  )}
                >
                  <div className="flex items-center gap-2 pr-3">
                    <button
                      type="button"
                      disabled={phase === 'claimed'}
                      onClick={() => setOpenId(quest.id)}
                      aria-expanded={isOpen}
                      className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left"
                    >
                      <span
                        className={classNames(
                          'flex size-6 shrink-0 items-center justify-center rounded-max',
                          done
                            ? 'bg-accent-avocado-default text-white'
                            : 'border-2 border-dashed border-border-subtlest-secondary',
                        )}
                      >
                        {done && (
                          <VIcon
                            className="iq-pop"
                            size={IconSize.XXSmall}
                            secondary
                          />
                        )}
                      </span>
                      <span
                        className={classNames(
                          'min-w-0 flex-1 truncate typo-callout',
                          phase === 'claimed'
                            ? 'text-text-tertiary'
                            : 'font-bold text-text-primary',
                        )}
                      >
                        {phase === 'claimed' ? quest.doneLabel : quest.name}
                      </span>
                      {!isOpen && phase !== 'claimed' && (
                        <span className="iq-tabular shrink-0 font-bold text-accent-avocado-default typo-caption1">
                          +{quest.xp} XP
                        </span>
                      )}
                    </button>
                    {!isOpen && phase === 'ready' && (
                      <FinalCta quest={quest} short />
                    )}
                  </div>
                  {isOpen && (
                    <div className="iq-rise flex flex-col gap-3 px-3 pb-3 pl-12">
                      <p className="iq-pretty text-text-secondary typo-footnote">
                        {quest.pitch}
                      </p>
                      <div className="empty:hidden">
                        <QuestWork quest={quest} />
                      </div>
                      <FinalCta quest={quest} isPrimary />
                      <Meta quest={quest} />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          <footer className="mt-auto flex flex-col items-center gap-3 p-5 pt-4">
            <ClaimAllBar />
            <HideForever />
          </footer>
        </>
      )}
    </Surface>
  );
};
