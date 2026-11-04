import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon, VIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { IntroQuest } from '../data';
import { introQuests, mockUser, totalRewards } from '../data';
import {
  CompletionHero,
  HideForever,
  PopupShell,
  QuestCta,
  QuestDetail,
  RewardTag,
  Spinner,
} from '../kit';
import { useSim } from '../sim';

// 6 · Merge your setup. Every developer knows the feeling of a pull request
// waiting on checks. Setup is a PR into your own daily.dev: four required
// checks, two optional ones, a merge button that turns green when the
// required ones pass. Merging is the claim, all at once.

const required = introQuests.filter(({ optional }) => !optional);

const CheckIcon = ({ quest }: { quest: IntroQuest }): ReactElement => {
  const sim = useSim();
  const phase = sim.phaseOf(quest.id);

  if (sim.isDone(quest.id)) {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-max text-accent-avocado-default">
        <VIcon size={IconSize.Size16} secondary />
      </span>
    );
  }

  if (phase === 'working') {
    return <Spinner className="shrink-0 text-accent-cheese-default" />;
  }

  return (
    <span className="flex size-5 shrink-0 items-center justify-center">
      <span
        className={classNames(
          'size-2 rounded-max',
          quest.optional ? 'bg-text-quaternary' : 'bg-accent-cheese-default',
        )}
      />
    </span>
  );
};

const CheckRow = ({ quest }: { quest: IntroQuest }): ReactElement => {
  const sim = useSim();
  const [open, setOpen] = useState(false);
  const done = sim.isDone(quest.id);
  const isOpen = open && !done;

  return (
    <li className="border-t border-border-subtlest-tertiary first:border-t-0">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <CheckIcon quest={quest} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-text-primary typo-footnote">
            <span className="font-bold">{quest.name}</span>
            <span className="text-text-tertiary">
              {' '}
              {done ? `· ${quest.doneLabel}` : `· ${quest.description}`}
            </span>
          </p>
        </div>
        <span
          className={classNames(
            'shrink-0 rounded-max border px-1.5 typo-caption2',
            quest.optional
              ? 'border-border-subtlest-tertiary text-text-quaternary'
              : 'border-border-subtlest-secondary text-text-tertiary',
          )}
        >
          {quest.optional ? 'Optional' : 'Required'}
        </span>
        {!done && (
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={isOpen}
            className="flex shrink-0 items-center gap-0.5 font-bold text-text-link typo-caption1 hover:underline"
          >
            {isOpen ? 'Hide' : 'Fix'}
            <ArrowIcon
              size={IconSize.XXSmall}
              className={isOpen ? 'rotate-0' : 'rotate-180'}
            />
          </button>
        )}
      </div>
      {isOpen && (
        <div className="iq-rise flex flex-col gap-3 px-4 pb-3 pl-12">
          <p className="text-text-secondary typo-footnote">{quest.pitch}</p>
          <div className="empty:hidden">
            <QuestDetail quest={quest} compact />
          </div>
          <QuestCta quest={quest} />
        </div>
      )}
    </li>
  );
};

export const MergeChecks = ({
  device = 'desktop',
}: {
  device?: 'desktop' | 'mobile';
}): ReactElement => {
  const sim = useSim();
  const requiredDone = required.filter(({ id }) => sim.isDone(id)).length;
  const canMerge = requiredDone === required.length;
  const claimed = introQuests.every(({ id }) => sim.phaseOf(id) === 'claimed');
  const passing = introQuests.filter(({ id }) => sim.isDone(id)).length;
  const pending = introQuests.length - passing;
  const ready = introQuests.filter(({ id }) => sim.phaseOf(id) === 'ready');
  const readyXp = ready.reduce((acc, quest) => acc + quest.xp, 0);
  const merged =
    required.every(({ id }) => sim.phaseOf(id) === 'claimed') &&
    ready.length === 0;

  if (claimed) {
    return (
      <PopupShell device={device} width="36rem">
        <div className="p-6">
          <CompletionHero />
        </div>
      </PopupShell>
    );
  }

  return (
    <PopupShell device={device} width="36rem">
      <header className="flex flex-col gap-2 p-6 pb-4 pr-14">
        <h2 className="font-bold text-text-primary typo-title3">
          Set up daily.dev{' '}
          <span className="font-normal text-text-tertiary">#1</span>
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-text-tertiary typo-footnote">
          <span
            className={classNames(
              'rounded-max px-2 py-0.5 font-bold text-white typo-caption1',
              merged
                ? 'bg-accent-cabbage-default'
                : 'bg-accent-avocado-default',
            )}
          >
            {merged ? 'Merged' : 'Open'}
          </span>
          <span>
            <span className="font-bold text-text-secondary">
              {mockUser.name.toLowerCase()}
            </span>{' '}
            wants to merge {introQuests.length} setups into{' '}
            <code className="rounded-4 bg-surface-float px-1 font-mono typo-caption1">
              main
            </code>
          </span>
        </div>
      </header>

      <div className="mx-4 overflow-hidden rounded-12 border border-border-subtlest-secondary">
        <div className="flex items-center gap-3 bg-background-subtle px-4 py-3">
          <span
            className={classNames(
              'flex size-8 shrink-0 items-center justify-center rounded-max',
              canMerge
                ? 'bg-accent-avocado-default text-white'
                : 'bg-accent-cheese-flat text-accent-cheese-default',
            )}
          >
            {canMerge ? (
              <VIcon secondary />
            ) : (
              <span className="size-2.5 rounded-max bg-accent-cheese-default" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-text-primary typo-callout">
              {canMerge
                ? 'All required checks have passed'
                : 'Some checks haven’t completed yet'}
            </p>
            <p className="iq-tabular text-text-tertiary typo-caption1">
              {passing} passing, {pending} pending ·{' '}
              {required.length - requiredDone} required left
            </p>
          </div>
        </div>
        <ul className="border-t border-border-subtlest-tertiary">
          {introQuests.map((quest) => (
            <CheckRow key={quest.id} quest={quest} />
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-3 border-t border-border-subtlest-tertiary px-4 py-3">
          <Button
            variant={ButtonVariant.Primary}
            color={ButtonColor.Avocado}
            size={ButtonSize.Medium}
            disabled={!canMerge || ready.length === 0}
            onClick={sim.claimAll}
          >
            {ready.length > 0 && canMerge
              ? `Merge setup · +${readyXp} XP`
              : 'Merge setup'}
          </Button>
          <span className="text-text-tertiary typo-caption1">
            {canMerge
              ? 'Optional checks can land later.'
              : 'Merging is blocked until the required checks pass.'}
          </span>
        </div>
      </div>

      <footer className="mt-auto flex flex-col items-center gap-2 p-4">
        <RewardTag xp={totalRewards.xp} cores={totalRewards.cores} />
        <HideForever />
      </footer>
    </PopupShell>
  );
};
