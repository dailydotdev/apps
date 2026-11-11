import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { QuestId } from './data';
import { introQuests } from './data';
import {
  CompletionHero,
  HideForever,
  PopupShell,
  QuestCta,
  QuestDetail,
  QuestGlyph,
  RewardTag,
  SegmentMeter,
} from './kit';
import { useSim } from './sim';

// C · One step at a time. One quest owns the popup: big icon, one sentence on
// why, the rich inline action, one large button. Everything else shrinks to a
// row of small chips you can jump to. Claiming advances to the next open step
// on its own, so the whole set can be cleared without ever choosing what to do.

export const VariantFocus = ({
  device = 'desktop',
}: {
  device?: 'desktop' | 'mobile';
}): ReactElement => {
  const sim = useSim();
  const [currentId, setCurrentId] = useState<QuestId | null>(
    sim.nextQuest?.id ?? null,
  );
  const lastNext = useRef(sim.nextQuest?.id);

  useEffect(() => {
    const nextId = sim.nextQuest?.id;

    if (nextId === lastNext.current) {
      return undefined;
    }

    lastNext.current = nextId;
    const timer = window.setTimeout(() => setCurrentId(nextId ?? null), 450);

    return () => window.clearTimeout(timer);
  }, [sim.nextQuest?.id]);

  const current = introQuests.find(({ id }) => id === currentId) ?? null;
  const allClaimed = introQuests.every(
    ({ id }) => sim.phaseOf(id) === 'claimed',
  );

  if (allClaimed || !current) {
    return (
      <PopupShell device={device} width="30rem">
        <div className="p-6">
          <CompletionHero />
        </div>
      </PopupShell>
    );
  }

  const index = introQuests.indexOf(current);
  const skipTo = introQuests.find(
    (quest, questIndex) =>
      questIndex > index &&
      sim.phaseOf(quest.id) !== 'claimed' &&
      !sim.isBlockedBy(quest),
  );

  return (
    <PopupShell device={device} width="30rem">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2 pr-10">
          <p className="iq-tabular font-bold text-text-tertiary typo-caption1">
            Step {index + 1} of {introQuests.length}
            {current.optional && ' · Optional'}
          </p>
          <SegmentMeter />
        </div>

        <div key={current.id} className="iq-rise flex flex-col gap-4">
          <QuestGlyph quest={current} size="lg" showDone={false} />
          <div className="flex flex-col gap-1.5">
            <h2 className="iq-balance font-bold text-text-primary typo-title2">
              {current.name}
            </h2>
            <p className="iq-pretty text-text-secondary typo-callout">
              {current.pitch}
            </p>
          </div>
          <div className="empty:hidden">
            <QuestDetail quest={current} />
          </div>
          <div className="flex flex-col gap-2">
            <QuestCta quest={current} size={ButtonSize.Large} block />
            <div className="flex items-center justify-between gap-2">
              <RewardTag xp={current.xp} cores={current.cores} />
              <span className="text-text-quaternary typo-caption1">
                About {current.minutes}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3 border-t border-border-subtlest-tertiary p-4">
        <div className="flex flex-wrap gap-1.5">
          {introQuests.map((quest) => {
            const isCurrent = quest.id === current.id;
            const phase = sim.phaseOf(quest.id);

            return (
              <button
                key={quest.id}
                type="button"
                aria-label={quest.name}
                aria-current={isCurrent ? 'step' : undefined}
                title={quest.name}
                onClick={() => setCurrentId(quest.id)}
                className={classNames(
                  'iq-press rounded-12 p-0.5',
                  isCurrent
                    ? 'ring-2 ring-text-primary'
                    : 'opacity-70 hover:opacity-100',
                  phase === 'ready' &&
                    !isCurrent &&
                    'ring-2 ring-accent-avocado-default',
                )}
              >
                <QuestGlyph quest={quest} size="sm" />
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between gap-2">
          <HideForever />
          {skipTo && (
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              onClick={() => setCurrentId(skipTo.id)}
            >
              Skip for now
            </Button>
          )}
        </div>
      </div>
    </PopupShell>
  );
};
