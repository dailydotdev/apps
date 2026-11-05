import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { IntroQuest } from '../data';
import { introQuests } from '../data';
import {
  ClaimAllBar,
  CompletionHero,
  HideForever,
  QuestGlyph,
  RewardTag,
} from '../kit';
import { useSim } from '../sim';
import type { Frame } from './kit';
import { FinalCta, QuestWork, SetupHeader, Surface } from './kit';

// Finalist 1 · Action cards. Round one B's card, made sharp: every card is
// always open, outline only, with the reward big on the right and one
// full-width button at the foot, so nobody has to guess that a card can be
// tapped. No pictures inside; only what the step needs (the profile fields,
// the key, the command). The step you are on gets the solid button.

const Payout = ({ quest }: { quest: IntroQuest }): ReactElement => (
  <span className="iq-tabular flex shrink-0 flex-col items-end gap-0.5 leading-none">
    <span className="font-bold text-accent-avocado-default typo-title3">
      +{quest.xp} XP
    </span>
    <span className="inline-flex items-center gap-0.5 text-text-tertiary typo-caption1">
      <CoreIcon
        size={IconSize.XXSmall}
        className="text-accent-cheese-default"
      />
      {quest.cores} Cores
    </span>
  </span>
);

const Card = ({ quest }: { quest: IntroQuest }): ReactElement => {
  const sim = useSim();
  const phase = sim.phaseOf(quest.id);
  const isNext = sim.nextQuest?.id === quest.id;

  return (
    <li
      className={classNames(
        'flex flex-col gap-4 rounded-16 border p-4 transition-colors duration-150',
        phase === 'ready' && 'border-accent-avocado-default',
        phase !== 'ready' && isNext && 'border-border-subtlest-primary',
        phase !== 'ready' && !isNext && 'border-border-subtlest-tertiary',
      )}
    >
      <div className="flex items-start gap-3">
        <QuestGlyph quest={quest} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="font-bold text-text-primary typo-callout">
            {quest.name}
          </p>
          <p className="iq-pretty text-text-tertiary typo-footnote">
            {quest.pitch}
          </p>
        </div>
        <Payout quest={quest} />
      </div>
      <div className="empty:hidden">
        <QuestWork quest={quest} />
      </div>
      <FinalCta quest={quest} isPrimary={isNext} />
    </li>
  );
};

export const CardsFinal = ({
  device = 'desktop',
  frame = 'modal',
  onClose,
}: {
  device?: 'desktop' | 'mobile';
  frame?: Frame;
  onClose?: () => void;
}): ReactElement => {
  const sim = useSim();
  const open = introQuests.filter(({ id }) => sim.phaseOf(id) !== 'claimed');
  const done = introQuests.filter(({ id }) => sim.phaseOf(id) === 'claimed');
  const left = introQuests.length - sim.doneCount;

  return (
    <Surface frame={frame} device={device} onClose={onClose}>
      {open.length === 0 ? (
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
          <ul className="flex flex-col gap-3 px-4">
            {open.map((quest) => (
              <Card key={quest.id} quest={quest} />
            ))}
          </ul>
          {done.length > 0 && (
            <section className="mt-4 flex flex-col gap-1 px-5">
              <p className="font-bold text-text-tertiary typo-caption1">
                Completed
              </p>
              {done.map((quest) => (
                <div key={quest.id} className="flex items-center gap-3 py-1">
                  <QuestGlyph quest={quest} size="sm" />
                  <p className="min-w-0 flex-1 truncate text-text-tertiary typo-footnote">
                    {quest.doneLabel}
                  </p>
                  <RewardTag xp={quest.xp} cores={quest.cores} tone="done" />
                </div>
              ))}
            </section>
          )}
          <footer className="mt-auto flex flex-col items-center gap-3 p-5 pt-4">
            <ClaimAllBar />
            <HideForever />
          </footer>
        </>
      )}
    </Surface>
  );
};
