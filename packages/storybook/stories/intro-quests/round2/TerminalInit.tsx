import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { IntroQuest, QuestId } from '../data';
import { introQuests, maskedToken, mockUser, totalRewards } from '../data';
import { HideForever, PopupShell, QuestCta, QuestDetail } from '../kit';
import { useSim } from '../sim';

// 7 · npx daily init. Our users live in a terminal, so setup reads like one:
// a script that asks one question at a time, prints what it did, and keeps
// going. The buttons are still real buttons (Y and n work on the keyboard
// too), and the API steps finally feel at home.

const prompts: Record<QuestId, string> = {
  extension: 'Install the browser extension?',
  notifications: 'Turn on notifications?',
  brief: 'Generate your first brief? (free)',
  profile: 'Finish your profile?',
  apiKey: 'Create an API key?',
  apiCall: 'Say hello to the API?',
  read3: 'Read three posts?',
  reminder: 'Set a daily reminder?',
  story: 'Follow a story?',
};

const Out = ({
  children,
  tone = 'default',
}: {
  children: ReactNode;
  tone?: 'default' | 'ok' | 'skip' | 'dim' | 'accent';
}): ReactElement => (
  <p
    className={classNames(
      'iq-rise whitespace-pre-wrap break-all',
      tone === 'default' && 'text-text-primary',
      tone === 'ok' && 'text-accent-avocado-default',
      tone === 'skip' && 'text-text-quaternary',
      tone === 'dim' && 'text-text-tertiary',
      tone === 'accent' && 'text-accent-cabbage-default',
    )}
  >
    {children}
  </p>
);

const Result = ({ quest }: { quest: IntroQuest }): ReactElement => {
  const sim = useSim();

  return (
    <>
      <Out tone="ok">
        ✔ {quest.doneLabel}{' '}
        <span className="text-text-quaternary">
          (+{quest.xp} XP, +{quest.cores} Cores)
        </span>
      </Out>
      {quest.id === 'apiKey' && sim.state.token && (
        <Out tone="dim"> token: {maskedToken}</Out>
      )}
      {quest.id === 'apiCall' && (
        <Out tone="dim">{`  { "name": "${mockUser.name}", "reputation": 10 }`}</Out>
      )}
    </>
  );
};

export const TerminalInit = ({
  device = 'desktop',
}: {
  device?: 'desktop' | 'mobile';
}): ReactElement => {
  const sim = useSim();
  const [skipped, setSkipped] = useState<QuestId[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const current = introQuests.find(
    (quest) =>
      sim.phaseOf(quest.id) !== 'claimed' &&
      !skipped.includes(quest.id) &&
      !sim.isBlockedBy(quest),
  );
  const handled = introQuests.filter(
    ({ id }) => sim.phaseOf(id) === 'claimed' || skipped.includes(id),
  );
  const allClaimed = introQuests.every(
    ({ id }) => sim.phaseOf(id) === 'claimed',
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  });

  useEffect(() => {
    if (!current) {
      return undefined;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'n' || event.key === 'N') {
        setSkipped((value) => [...value, current.id]);
      }

      if (event.key === 'y' || event.key === 'Y' || event.key === 'Enter') {
        document
          .querySelector<HTMLElement>('[data-terminal-current] [data-cta]')
          ?.click();
      }
    };

    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);
  }, [current]);

  return (
    <PopupShell device={device} width="38rem" className="tablet:h-[38rem]">
      <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary bg-background-subtle px-4 py-3 pr-14">
        <span className="flex gap-1.5">
          <span className="size-3 rounded-max bg-accent-ketchup-default" />
          <span className="size-3 rounded-max bg-accent-cheese-default" />
          <span className="size-3 rounded-max bg-accent-avocado-default" />
        </span>
        <span className="flex-1 text-center font-mono text-text-tertiary typo-caption1">
          {mockUser.name.toLowerCase()}@daily.dev: ~
        </span>
      </div>
      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-4 font-mono typo-footnote"
      >
        <Out>
          <span className="text-accent-cabbage-default">~</span> $ npx daily
          init
        </Out>
        <Out tone="ok">✔ Account created</Out>
        <Out tone="ok">✔ Topics picked</Out>
        {handled.map((quest) =>
          sim.phaseOf(quest.id) === 'claimed' ? (
            <Result key={quest.id} quest={quest} />
          ) : (
            <Out key={quest.id} tone="skip">
              – Skipped: {quest.name.toLowerCase()}
            </Out>
          ),
        )}
        {current && (
          <div
            key={current.id}
            data-terminal-current
            className="iq-rise mt-2 flex flex-col gap-2 rounded-10 border border-border-subtlest-tertiary p-3"
          >
            <Out>
              <span className="text-accent-cabbage-default">?</span>{' '}
              <span className="font-bold">{prompts[current.id]}</span>{' '}
              <span className="text-text-quaternary">(Y/n)</span>
            </Out>
            <Out tone="dim"> {current.pitch}</Out>
            <div className="empty:hidden font-sans">
              <QuestDetail quest={current} compact />
            </div>
            <div className="flex flex-wrap items-center gap-2 font-sans">
              <QuestCta quest={current} />
              {sim.phaseOf(current.id) === 'todo' && (
                <Button
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Small}
                  onClick={() => setSkipped((value) => [...value, current.id])}
                >
                  n, skip
                </Button>
              )}
              <span className="ml-auto text-text-quaternary typo-caption2">
                +{current.xp} XP
              </span>
            </div>
          </div>
        )}
        {!current && allClaimed && (
          <>
            <Out tone="accent">
              ✨ daily.dev is fully set up. +{totalRewards.xp} XP, +
              {totalRewards.cores} Cores
            </Out>
            <Out>
              <span className="text-accent-cabbage-default">~</span> $
              <span className="iq-pulse ml-1 inline-block h-4 w-2 translate-y-0.5 bg-text-primary" />
            </Out>
          </>
        )}
        {!current && !allClaimed && (
          <div className="mt-2 flex flex-col gap-2">
            <Out tone="dim">
              Done for now. Run it again any time from the header.
            </Out>
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              className="w-fit font-sans"
              onClick={() => setSkipped([])}
            >
              Run again
            </Button>
          </div>
        )}
      </div>
      <footer className="flex justify-center border-t border-border-subtlest-tertiary p-3">
        <HideForever />
      </footer>
    </PopupShell>
  );
};
