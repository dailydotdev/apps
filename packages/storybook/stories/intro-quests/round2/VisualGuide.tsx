import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import { VIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { QuestId } from '../data';
import { introQuests } from '../data';
import {
  ClaimAllBar,
  CompletionHero,
  HideForever,
  PopupShell,
  ProgressMeter,
  QuestCta,
  QuestDetail,
  RewardTag,
} from '../kit';
import { useSim } from '../sim';
import { QuestPreview } from './previews';

// 4 · Show, then do. Shopify's setup guide: one step open at a time with a
// picture of the result next to it, and steps that mark themselves done. The
// picture is live: the profile card fills in field by field, the new tab turns
// into your feed, the terminal prints the response when the call lands.

export const VisualGuide = ({
  device = 'desktop',
}: {
  device?: 'desktop' | 'mobile';
}): ReactElement => {
  const sim = useSim();
  const [openId, setOpenId] = useState<QuestId | null>(null);
  const activeId = openId ?? sim.nextQuest?.id ?? null;
  const isMobile = device === 'mobile';
  const allClaimed = introQuests.every(
    ({ id }) => sim.phaseOf(id) === 'claimed',
  );

  if (allClaimed || !activeId) {
    return (
      <PopupShell device={device} width="30rem">
        <div className="p-6">
          <CompletionHero />
        </div>
      </PopupShell>
    );
  }

  return (
    <PopupShell device={device} width="50rem">
      <div
        className={classNames('flex min-h-0 flex-1', isMobile && 'flex-col')}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex flex-col gap-3 p-6 pb-3 pr-14">
            <h2 className="font-bold text-text-primary typo-title3">
              Setup guide
            </h2>
            <ProgressMeter />
          </header>
          {isMobile && (
            <div className="mx-4 mb-2 flex min-h-[9rem] items-center justify-center overflow-hidden rounded-16 bg-background-subtle p-4 [&>*]:min-w-0">
              <QuestPreview id={activeId} />
            </div>
          )}
          <ol className="flex flex-col gap-1 px-3 pb-3">
            {introQuests.map((quest) => {
              const isOpen = quest.id === activeId;
              const phase = sim.phaseOf(quest.id);
              const done = sim.isDone(quest.id);

              return (
                <li
                  key={quest.id}
                  className={classNames(
                    'rounded-14 transition-colors duration-150',
                    isOpen ? 'bg-surface-float' : 'hover:bg-surface-hover',
                  )}
                >
                  <div className="flex items-center gap-2 pr-3">
                    <button
                      type="button"
                      onClick={() => setOpenId(quest.id)}
                      aria-expanded={isOpen}
                      className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left"
                    >
                      <span
                        className={classNames(
                          'flex size-5 shrink-0 items-center justify-center rounded-max',
                          done
                            ? 'bg-accent-avocado-default text-white'
                            : 'border-2 border-dashed border-border-subtlest-secondary',
                        )}
                      >
                        {done && <VIcon size={IconSize.XXSmall} secondary />}
                      </span>
                      <span
                        className={classNames(
                          'min-w-0 flex-1 truncate typo-callout',
                          phase === 'claimed'
                            ? 'text-text-tertiary'
                            : 'font-bold text-text-primary',
                        )}
                      >
                        {quest.name}
                      </span>
                      {!isOpen && quest.optional && phase !== 'claimed' && (
                        <span className="text-text-quaternary typo-caption1">
                          Optional
                        </span>
                      )}
                    </button>
                    {!isOpen && phase === 'ready' && (
                      <QuestCta quest={quest} size={ButtonSize.XSmall} />
                    )}
                  </div>
                  {isOpen && (
                    <div className="iq-rise flex flex-col gap-3 px-3 pb-3 pl-11">
                      <p className="iq-pretty text-text-secondary typo-footnote">
                        {quest.pitch}
                      </p>
                      <div className="empty:hidden">
                        <QuestDetail quest={quest} compact />
                      </div>
                      <div className="flex items-center gap-3">
                        <QuestCta quest={quest} />
                        <RewardTag xp={quest.xp} cores={quest.cores} />
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
          <footer className="mt-auto flex flex-col items-center gap-2 p-4 pt-0">
            <ClaimAllBar />
            <HideForever />
          </footer>
        </div>
        {!isMobile && (
          <aside className="flex w-[20rem] shrink-0 flex-col justify-center gap-3 border-l border-border-subtlest-tertiary bg-background-subtle p-6">
            <div key={activeId} className="iq-rise flex flex-col gap-3">
              <p className="font-bold text-text-tertiary typo-caption1">
                {sim.isDone(activeId)
                  ? 'Done. This is yours now'
                  : 'What you get'}
              </p>
              <QuestPreview id={activeId} />
            </div>
          </aside>
        )}
      </div>
    </PopupShell>
  );
};
