import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { introQuests } from '../data';
import {
  ClaimAllBar,
  CompletionHero,
  ProgressRing,
  QuestCta,
  QuestDetail,
  QuestGlyph,
  RewardTag,
} from '../kit';
import { useSim } from '../sim';

// 8 · Floating dock. Setup that never blocks the feed. Intercom and Appcues
// put the checklist in a launcher in the corner: it opens over the page,
// minimizes to a progress pill, and stays out of the way while you read.
// Apple's rule from "Finish setting up" applies: defer, never dead end.

export const FloatingDock = ({
  device = 'desktop',
}: {
  device?: 'desktop' | 'mobile';
}): ReactElement => {
  const sim = useSim();
  const [open, setOpen] = useState(true);
  const next = sim.nextQuest;
  const rest = introQuests.filter(
    (quest) => quest.id !== next?.id && sim.phaseOf(quest.id) !== 'claimed',
  );
  const allClaimed = introQuests.every(
    ({ id }) => sim.phaseOf(id) === 'claimed',
  );
  const isMobile = device === 'mobile';

  const pill = (
    <button
      type="button"
      onClick={() => setOpen((value) => !value)}
      aria-expanded={open}
      className="iq-press iq-elevated flex h-12 items-center gap-2 self-end rounded-max border border-border-subtlest-tertiary bg-background-popover pl-2 pr-4 font-bold text-text-primary typo-callout"
    >
      <ProgressRing size={32} />
      <span className="iq-tabular">
        {allClaimed
          ? 'All set'
          : `Set up daily.dev · ${sim.doneCount}/${introQuests.length}`}
      </span>
      <ArrowIcon
        size={IconSize.Size16}
        className={classNames(
          'transition-transform duration-200',
          open ? 'rotate-180' : 'rotate-0',
        )}
      />
    </button>
  );

  return (
    <div
      className={classNames(
        'flex flex-col gap-3',
        isMobile ? 'w-full' : 'w-[23rem]',
      )}
    >
      {open && (
        <section
          role="dialog"
          aria-label="Set up daily.dev"
          className="iq-rise iq-elevated flex max-h-[34rem] flex-col overflow-hidden rounded-20 border border-border-subtlest-tertiary bg-background-default"
        >
          {allClaimed ? (
            <div className="p-4">
              <CompletionHero onClose={() => setOpen(false)} />
            </div>
          ) : (
            <>
              <header className="flex items-start justify-between gap-2 p-4 pb-2">
                <div>
                  <p className="font-bold text-text-primary typo-body">
                    Finish setting up
                  </p>
                  <p className="iq-tabular text-text-tertiary typo-caption1">
                    {introQuests.length - sim.doneCount} left · keep reading,
                    this stays here
                  </p>
                </div>
                <Button
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.XSmall}
                  onClick={() => setOpen(false)}
                >
                  Minimize
                </Button>
              </header>
              <div className="flex min-h-0 flex-col gap-3 overflow-y-auto p-4 pt-2">
                {next && (
                  <div
                    key={next.id}
                    className="iq-rise flex flex-col gap-3 rounded-16 bg-surface-float p-3"
                  >
                    <div className="flex items-center gap-3">
                      <QuestGlyph quest={next} showDone={false} />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-text-tertiary typo-caption2">
                          Up next
                        </p>
                        <p className="truncate font-bold text-text-primary typo-callout">
                          {next.name}
                        </p>
                      </div>
                      <RewardTag xp={next.xp} cores={next.cores} />
                    </div>
                    <p className="iq-pretty text-text-secondary typo-footnote">
                      {next.pitch}
                    </p>
                    <div className="empty:hidden">
                      <QuestDetail quest={next} compact />
                    </div>
                    <QuestCta quest={next} size={ButtonSize.Medium} block />
                  </div>
                )}
                {rest.map((quest) => (
                  <div key={quest.id} className="flex items-center gap-3 px-1">
                    <QuestGlyph quest={quest} size="sm" />
                    <p className="min-w-0 flex-1 truncate text-text-primary typo-footnote">
                      {quest.name}
                    </p>
                    <QuestCta quest={quest} size={ButtonSize.XSmall} quiet />
                  </div>
                ))}
                <ClaimAllBar />
              </div>
              <footer className="flex items-center justify-between border-t border-border-subtlest-tertiary px-4 py-2 text-text-quaternary typo-caption1">
                <button type="button" className="hover:text-text-tertiary">
                  Remind me tomorrow
                </button>
                <button type="button" className="hover:text-text-tertiary">
                  Don&apos;t show again
                </button>
              </footer>
            </>
          )}
        </section>
      )}
      {pill}
    </div>
  );
};
