import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import type { IntroQuest, QuestId } from '../data';
import { introQuests } from '../data';
import {
  CompletionHero,
  HideForever,
  PopupShell,
  QuestCta,
  QuestDetail,
  QuestGlyph,
} from '../kit';
import { useSim } from '../sim';

// 2 · Setup strength. LinkedIn's profile meter: a level, not a to-do list.
// Every step says how much it moves the meter, the biggest mover is offered
// as the one "next best step", and the meter starts at 10% because joining
// counts. Tiers give two earlier finish lines than 100%.

const BASE = 10;

export const strengthWeight: Record<QuestId, number> = {
  extension: 20,
  notifications: 15,
  profile: 20,
  brief: 15,
  apiKey: 10,
  apiCall: 10,
  read3: 0,
  reminder: 0,
  story: 0,
};

const tiers = [
  { name: 'Starter', from: 0 },
  { name: 'Regular', from: 45 },
  { name: 'All-star', from: 100 },
];

const getTier = (value: number) =>
  [...tiers].reverse().find((tier) => value >= tier.from) ?? tiers[0];

const Gain = ({ quest }: { quest: IntroQuest }): ReactElement => (
  <span className="iq-tabular shrink-0 rounded-max bg-accent-avocado-flat px-2 py-0.5 font-bold text-accent-avocado-default typo-caption1">
    +{strengthWeight[quest.id]}%
  </span>
);

export const StrengthMeter = ({
  device = 'desktop',
}: {
  device?: 'desktop' | 'mobile';
}): ReactElement => {
  const sim = useSim();
  const strength =
    BASE +
    introQuests
      .filter(({ id }) => sim.isDone(id))
      .reduce((acc, { id }) => acc + strengthWeight[id], 0);
  const tier = getTier(strength);
  const nextTier = tiers.find((item) => item.from > strength);
  const open = introQuests
    .filter(({ id }) => sim.phaseOf(id) !== 'claimed')
    .sort((a, b) => {
      const aReady = sim.phaseOf(a.id) === 'ready' ? 1 : 0;
      const bReady = sim.phaseOf(b.id) === 'ready' ? 1 : 0;

      if (aReady !== bReady) {
        return bReady - aReady;
      }

      const aBlocked = sim.isBlockedBy(a) ? 1 : 0;
      const bBlocked = sim.isBlockedBy(b) ? 1 : 0;

      return aBlocked - bBlocked || strengthWeight[b.id] - strengthWeight[a.id];
    });
  const [best, ...rest] = open;

  if (!best) {
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
      <div className="flex flex-col gap-6 p-6">
        <header className="flex flex-col gap-3 pr-8">
          <p className="font-bold text-text-tertiary typo-footnote">
            Setup strength
          </p>
          <div className="flex items-baseline gap-2">
            <h2 className="font-bold text-text-primary typo-title1">
              {tier.name}
            </h2>
            <span className="iq-tabular text-text-tertiary typo-callout">
              {strength}%
            </span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-max bg-surface-float">
            <div
              className="iq-bar absolute inset-0 rounded-max bg-accent-avocado-default"
              style={{ transform: `scaleX(${strength / 100})` }}
            />
            <span className="absolute inset-y-0 left-[45%] w-0.5 bg-background-default" />
          </div>
          <div className="relative h-4 text-text-quaternary typo-caption2">
            {tiers.map((item) => (
              <span
                key={item.name}
                className={classNames(
                  'absolute top-0',
                  item.from === 0 && 'left-0',
                  item.from === 100 && 'right-0',
                  item.name === tier.name && 'font-bold text-text-primary',
                )}
                style={
                  item.from > 0 && item.from < 100
                    ? { left: `${item.from}%`, transform: 'translateX(-50%)' }
                    : undefined
                }
              >
                {item.name}
              </span>
            ))}
          </div>
          {nextTier && (
            <p className="text-text-secondary typo-footnote">
              {nextTier.from - strength}% more to {nextTier.name}.
            </p>
          )}
        </header>

        <section className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-text-tertiary typo-caption1">
              Next best step
            </p>
            <Gain quest={best} />
          </div>
          <div key={best.id} className="iq-rise flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <QuestGlyph quest={best} showDone={false} />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-text-primary typo-body">
                  {best.name}
                </p>
                <p className="iq-pretty text-text-tertiary typo-footnote">
                  {best.pitch}
                </p>
              </div>
            </div>
            <div className="empty:hidden">
              <QuestDetail quest={best} />
            </div>
            <QuestCta quest={best} size={ButtonSize.Medium} block />
          </div>
        </section>

        {rest.length > 0 && (
          <section className="flex flex-col gap-1">
            <p className="pb-1 font-bold text-text-tertiary typo-caption1">
              More ways to level up
            </p>
            {rest.map((quest) => (
              <div
                key={quest.id}
                className="flex items-center gap-3 rounded-12 px-2 py-2 hover:bg-surface-hover"
              >
                <QuestGlyph quest={quest} size="sm" />
                <p className="min-w-0 flex-1 truncate font-bold text-text-primary typo-footnote">
                  {quest.name}
                </p>
                <Gain quest={quest} />
                <QuestCta quest={quest} size={ButtonSize.XSmall} quiet />
              </div>
            ))}
          </section>
        )}
      </div>
      <footer className="mt-auto flex justify-center p-4 pt-0">
        <HideForever />
      </footer>
    </PopupShell>
  );
};
