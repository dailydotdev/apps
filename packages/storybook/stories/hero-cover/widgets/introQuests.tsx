import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { VIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { WidgetSize } from './catalog';
import { Stack, WidgetLabel } from './production';
import { Scroll } from './scroll';

/*
 * The intro quests in the language of the popup redesign we are launching
 * (Intro Quests, finalist 2 "Checklist", PR #7049): one avocado accent, a
 * reward line over a count title, a segmented meter, dashed circles that
 * fill green, and only the step you are on open with one button. The
 * action happens in the widget; nothing navigates away. Names, pitches and
 * rewards are the production quests with the redesign's copy. The widget
 * retires itself once every quest is claimed.
 */

type QuestId =
  | 'extension'
  | 'notifications'
  | 'brief'
  | 'profile'
  | 'apiKey'
  | 'apiCall';

type Quest = {
  id: QuestId;
  name: string;
  pitch: string;
  cta: string;
  short: string;
  doneLabel: string;
  minutes: string;
  xp: number;
  cores: number;
};

const quests: Quest[] = [
  {
    id: 'extension',
    name: 'Install the browser extension',
    pitch: 'Every new tab becomes your feed. One click, free.',
    cta: 'Add to Chrome',
    short: 'Add',
    doneLabel: 'Extension installed',
    minutes: '10 sec',
    xp: 10,
    cores: 5,
  },
  {
    id: 'notifications',
    name: 'Turn on notifications',
    pitch: 'Replies, mentions and your streak. Nothing else.',
    cta: 'Turn on',
    short: 'Turn on',
    doneLabel: 'Notifications on',
    minutes: '5 sec',
    xp: 10,
    cores: 5,
  },
  {
    id: 'brief',
    name: 'Generate your first brief',
    pitch: 'Your AI agent reads the day for you. The first one is free.',
    cta: 'Generate for free',
    short: 'Generate',
    doneLabel: 'Brief ready',
    minutes: '1 min',
    xp: 15,
    cores: 5,
  },
  {
    id: 'profile',
    name: 'Complete your profile',
    pitch: 'Five details so other developers know who they are talking to.',
    cta: 'Finish profile',
    short: 'Finish',
    doneLabel: 'Profile complete',
    minutes: '2 min',
    xp: 25,
    cores: 5,
  },
  {
    id: 'apiKey',
    name: 'Grab your API key',
    pitch: 'Plug your feed into scripts, agents and your terminal.',
    cta: 'Create key',
    short: 'Create',
    doneLabel: 'Key created',
    minutes: '10 sec',
    xp: 15,
    cores: 5,
  },
  {
    id: 'apiCall',
    name: 'Hello, API',
    pitch: 'Paste one command in your terminal. We will spot the call.',
    cta: 'Copy command',
    short: 'Copy',
    doneLabel: 'First call received',
    minutes: '30 sec',
    xp: 15,
    cores: 5,
  },
];

type Phase = 'todo' | 'working' | 'ready' | 'claimed';
type Phases = Record<QuestId, Phase>;

export type IntroStage = 'fresh' | 'progress' | 'claimable' | 'done';

const stagePhases: Record<IntroStage, Phase[]> = {
  fresh: ['todo', 'todo', 'todo', 'todo', 'todo', 'todo'],
  progress: ['claimed', 'claimed', 'todo', 'todo', 'todo', 'todo'],
  claimable: ['claimed', 'ready', 'todo', 'todo', 'todo', 'todo'],
  done: ['claimed', 'claimed', 'claimed', 'claimed', 'claimed', 'claimed'],
};

const phasesFor = (stage: IntroStage): Phases =>
  Object.fromEntries(
    quests.map((quest, i) => [quest.id, stagePhases[stage][i]]),
  ) as Phases;

// The redesign's motion: rise and pop with blur, the same curve.
const motionCss = `
@keyframes gsRise { from { opacity: 0; transform: translateY(6px); filter: blur(4px); } to { opacity: 1; transform: none; filter: none; } }
@keyframes gsPop { from { opacity: 0; transform: scale(0.25); filter: blur(4px); } to { opacity: 1; transform: none; filter: none; } }
@keyframes gsSpin { to { transform: rotate(360deg); } }
.gs-rise { animation: gsRise 320ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.gs-pop { animation: gsPop 300ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.gs-spin { animation: gsSpin 800ms linear infinite; }
@media (prefers-reduced-motion: reduce) { .gs-rise, .gs-pop { animation-duration: 1ms; } }
`;

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

const Circle = ({ phase }: { phase: Phase }): ReactElement => {
  if (phase === 'working') {
    return (
      <span className="gs-spin size-5 shrink-0 rounded-max border-2 border-accent-avocado-default border-t-transparent" />
    );
  }
  const isDone = phase === 'ready' || phase === 'claimed';
  return (
    <span
      className={classNames(
        'flex size-5 shrink-0 items-center justify-center rounded-max',
        isDone
          ? 'bg-accent-avocado-default text-white'
          : 'border-2 border-dashed border-border-subtlest-secondary',
      )}
    >
      {isDone && <VIcon className="gs-pop" size={IconSize.XXSmall} secondary />}
    </span>
  );
};

/** One segment per quest: claimed is avocado, claimable a lighter green. */
const Meter = ({
  phases,
  isCompact,
}: {
  phases: Phases;
  isCompact?: boolean;
}): ReactElement => (
  <div className={classNames('flex', isCompact ? 'gap-0.5' : 'gap-1')}>
    {quests.map((quest) => (
      <span
        key={quest.id}
        className={classNames(
          'rounded-max transition-colors duration-300',
          isCompact ? 'h-1 w-2.5' : 'h-1.5 flex-1',
          phases[quest.id] === 'claimed' && 'bg-accent-avocado-default',
          phases[quest.id] === 'ready' && 'bg-accent-avocado-subtler',
          (phases[quest.id] === 'todo' || phases[quest.id] === 'working') &&
            'bg-surface-float',
        )}
      />
    ))}
  </div>
);

const Meta = ({ quest }: { quest: Quest }): ReactElement => (
  <span className="inline-flex items-center gap-1.5 tabular-nums text-text-tertiary typo-caption1">
    <span className="font-bold text-accent-avocado-default">
      +{quest.xp} XP
    </span>
    <span aria-hidden>·</span>
    <span>+{quest.cores} Cores</span>
    <span aria-hidden>·</span>
    <span>{quest.minutes}</span>
  </span>
);

const Cta = ({
  quest,
  phase,
  isShort,
  onStart,
  onClaim,
}: {
  quest: Quest;
  phase: Phase;
  isShort?: boolean;
  onStart: () => void;
  onClaim: () => void;
}): ReactElement | null => {
  const width = isShort ? 'shrink-0' : 'w-full';
  if (phase === 'claimed') {
    return null;
  }
  if (phase === 'ready') {
    return (
      <Button
        variant={ButtonVariant.Primary}
        color={ButtonColor.Avocado}
        size={ButtonSize.Small}
        className={classNames('gs-pop', width)}
        onClick={onClaim}
      >
        {isShort ? 'Claim' : `Claim +${quest.xp} XP`}
      </Button>
    );
  }
  return (
    <Button
      variant={isShort ? ButtonVariant.Float : ButtonVariant.Primary}
      size={ButtonSize.Small}
      className={width}
      disabled={phase === 'working'}
      onClick={onStart}
    >
      {phase === 'working' ? 'Checking…' : isShort ? quest.short : quest.cta}
    </Button>
  );
};

/* ------------------------------------------------------------------ */
/* The widget                                                          */
/* ------------------------------------------------------------------ */

export const IntroQuestsWidget = ({
  size,
  stage = 'progress',
}: {
  size: WidgetSize;
  stage?: IntroStage;
}): ReactElement => {
  const [phases, setPhases] = useState<Phases>(() => phasesFor(stage));
  const [openId, setOpenId] = useState<QuestId | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const setPhase = (id: QuestId, phase: Phase) =>
    setPhases((current) => ({ ...current, [id]: phase }));
  const start = (id: QuestId) => {
    setPhase(id, 'working');
    timers.current.push(window.setTimeout(() => setPhase(id, 'ready'), 1200));
  };
  const claim = (id: QuestId) => {
    setPhase(id, 'claimed');
    setOpenId(null);
  };

  const open = quests.filter((q) => phases[q.id] !== 'claimed');
  const next = open.find((q) => phases[q.id] === 'ready') ?? open[0];
  const active =
    (openId && phases[openId] !== 'claimed'
      ? quests.find((q) => q.id === openId)
      : next) ?? null;
  const xpLeft = open.reduce((sum, q) => sum + q.xp, 0);
  const coresLeft = open.reduce((sum, q) => sum + q.cores, 0);
  const totalXp = quests.reduce((sum, q) => sum + q.xp, 0);
  const totalCores = quests.reduce((sum, q) => sum + q.cores, 0);

  const reward = (
    <span className="font-bold tabular-nums text-accent-avocado-default typo-footnote">
      Earn {xpLeft} XP and {coresLeft} Cores
    </span>
  );
  const title =
    open.length === 1
      ? 'One last thing to set up'
      : `${open.length} things to set up daily.dev`;

  if (!active) {
    return (
      <Stack>
        <style>{motionCss}</style>
        <WidgetLabel kind="introquests" />
        <div className="m-auto flex flex-col items-center gap-2 text-center">
          <span
            className={classNames(
              'gs-pop flex items-center justify-center rounded-max bg-accent-avocado-default text-white',
              size === 's' ? 'size-9' : 'size-12',
            )}
          >
            <VIcon size={IconSize.Small} secondary />
          </span>
          <span className="font-bold text-text-primary typo-callout">
            You’re all set
          </span>
          <span className="font-bold tabular-nums text-accent-avocado-default typo-caption1">
            +{totalXp} XP and {totalCores} Cores earned
          </span>
          {size !== 's' && (
            <span className="text-text-tertiary typo-footnote">
              This widget makes room for another one tomorrow.
            </span>
          )}
        </div>
      </Stack>
    );
  }

  const row = (quest: Quest, canExpand: boolean) => {
    const phase = phases[quest.id];
    const isOpen = canExpand && quest.id === active.id;
    const isClaimed = phase === 'claimed';
    return (
      <li
        key={quest.id}
        className={classNames(
          '-mx-2 rounded-12 transition-colors duration-150',
          isOpen && 'bg-surface-float',
          !isOpen && !isClaimed && 'hover:bg-surface-hover',
          !canExpand && quest.id === active.id && 'bg-surface-float',
        )}
      >
        <div className="flex items-center gap-2 pr-2">
          <button
            type="button"
            disabled={isClaimed}
            aria-expanded={canExpand ? isOpen : undefined}
            onClick={() => setOpenId(quest.id)}
            className="flex min-h-9 min-w-0 flex-1 items-center gap-2.5 py-1.5 pl-2 text-left"
          >
            <Circle phase={phase} />
            <span
              className={classNames(
                'min-w-0 flex-1 truncate typo-footnote',
                isClaimed
                  ? 'text-text-tertiary'
                  : 'font-bold text-text-primary',
              )}
            >
              {isClaimed ? quest.doneLabel : quest.name}
            </span>
            {!isOpen && !isClaimed && phase !== 'ready' && (
              <span className="shrink-0 font-bold tabular-nums text-accent-avocado-default typo-caption1">
                +{quest.xp} XP
              </span>
            )}
          </button>
          {!isOpen && phase === 'ready' && (
            <Cta
              quest={quest}
              phase={phase}
              isShort
              onStart={() => start(quest.id)}
              onClaim={() => claim(quest.id)}
            />
          )}
        </div>
        {isOpen && (
          <div className="gs-rise flex flex-col gap-2.5 pb-3 pl-9 pr-3">
            <p className="text-text-secondary typo-footnote">{quest.pitch}</p>
            <Cta
              quest={quest}
              phase={phase}
              onStart={() => start(quest.id)}
              onClaim={() => claim(quest.id)}
            />
            <Meta quest={quest} />
          </div>
        )}
      </li>
    );
  };

  /* Small: progress shrinks into the header so the step card can lead. */
  if (size === 's') {
    const phase = phases[active.id];
    const claimedCount = quests.length - open.length;
    return (
      <Stack>
        <style>{motionCss}</style>
        <WidgetLabel
          kind="introquests"
          trailing={
            <span className="flex items-center gap-2">
              <Meter phases={phases} isCompact />
              <span className="tabular-nums text-text-tertiary typo-caption1">
                {claimedCount}/{quests.length}
              </span>
            </span>
          }
        />
        <div
          key={active.id}
          className="gs-rise -mx-1 mt-2.5 flex min-h-0 flex-1 flex-col rounded-16 bg-surface-float p-3"
        >
          <span className="flex items-start gap-2">
            <Circle phase={phase} />
            <span className="min-w-0 flex-1 font-bold text-text-primary typo-footnote">
              {active.name}
            </span>
          </span>
          <p className="mt-1 line-clamp-1 pl-7 text-text-tertiary typo-caption1">
            {active.pitch}
          </p>
          <div className="mt-auto pt-2">
            <Cta
              quest={active}
              phase={phase}
              onStart={() => start(active.id)}
              onClaim={() => claim(active.id)}
            />
            <div className="mt-1.5">
              <Meta quest={active} />
            </div>
          </div>
        </div>
      </Stack>
    );
  }

  const header = (titleClassName: string) => (
    <div className="mt-3 flex flex-col gap-2.5">
      <span className="flex flex-col gap-0.5">
        {reward}
        <span
          className={classNames('font-bold text-text-primary', titleClassName)}
        >
          {title}
        </span>
      </span>
      <Meter phases={phases} />
    </div>
  );

  /* Large: the step you are on as a stage on the left, the list on the right. */
  if (size === 'l') {
    const phase = phases[active.id];
    return (
      <Stack>
        <style>{motionCss}</style>
        <WidgetLabel kind="introquests" />
        <div className="mt-1 flex min-h-0 flex-1 gap-6">
          <div className="flex w-1/2 shrink-0 flex-col">
            {header('typo-title3')}
            <div
              key={active.id}
              className="gs-rise mt-auto flex flex-col gap-2.5 rounded-16 bg-surface-float p-4"
            >
              <span className="flex items-center gap-2.5">
                <Circle phase={phase} />
                <span className="min-w-0 flex-1 font-bold text-text-primary typo-callout">
                  {active.name}
                </span>
              </span>
              <p className="text-text-secondary typo-footnote">
                {active.pitch}
              </p>
              <Cta
                quest={active}
                phase={phase}
                onStart={() => start(active.id)}
                onClaim={() => claim(active.id)}
              />
              <Meta quest={active} />
            </div>
          </div>
          <Scroll isUnderHeader={false} className="flex-1">
            <ol className="flex flex-col gap-0.5">
              {quests.map((quest) => row(quest, false))}
            </ol>
          </Scroll>
        </div>
      </Stack>
    );
  }

  return (
    <Stack>
      <style>{motionCss}</style>
      <WidgetLabel kind="introquests" />
      {header('typo-body')}
      <Scroll isUnderHeader={false} className="mt-2">
        <ol className="flex flex-col gap-0.5">
          {quests.map((quest) => row(quest, true))}
        </ol>
      </Scroll>
    </Stack>
  );
};
