import type { ChangeEvent, ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ProgressBar } from '@dailydotdev/shared/src/components/fields/ProgressBar';

const VIBE_WORDS = [
  'agent',
  'alignment',
  'api',
  'attention',
  'batch',
  'cache',
  'chain',
  'chunk',
  'context',
  'cuda',
  'dataset',
  'distill',
  'drift',
  'embed',
  'eval',
  'flow',
  'guardrail',
  'hallucinate',
  'latency',
  'logits',
  'lora',
  'memory',
  'metric',
  'multimodal',
  'observe',
  'orchestrate',
  'prompt',
  'proxy',
  'rag',
  'rerank',
  'retry',
  'safety',
  'sampler',
  'sandbox',
  'spec',
  'stream',
  'temperature',
  'token',
  'tooling',
  'tuning',
  'vector',
  'vibe',
];

const INCIDENT_WORDS = [
  'hotfix',
  'rollback',
  'failover',
  'mitigation',
  'recovery',
  'pagerduty',
  'patch',
  'restart',
];

const MAX_TOKENS_TARGET = 260;
const SPEEDRUN_DURATION_MS = 60000;
const BASE_SPEED_RANGE = [12, 20];
const INCIDENT_SPEED_BOOST = 1.6;
const INCIDENT_DURATION_MS = 10000;
const INCIDENT_SPAWN_INTERVAL_MS = 520;
const NORMAL_SPAWN_INTERVAL_MS = 900;
const TOKEN_DROP_PENALTY = 6;
const INCIDENT_BONUS = 18;

const MOCK_LEADERBOARD = [
  { name: 'VectorVera', score: 980 },
  { name: 'LatencyLiam', score: 910 },
  { name: 'PromptPia', score: 840 },
  { name: 'AgentAda', score: 790 },
  { name: 'ChunkyChen', score: 740 },
];

const randomBetween = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

const pickRandom = <T,>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

const sanitizeInput = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9-]/g, '');

const getWordPoints = (word: string): number =>
  Math.max(4, Math.min(14, word.length + 2));

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

type FallingToken = {
  id: number;
  word: string;
  x: number;
  y: number;
  speed: number;
  isIncident?: boolean;
};

type IncidentState = {
  word: string;
  endsAt: number;
};

const findBestMatch = (
  tokens: FallingToken[],
  value: string,
): FallingToken | null => {
  if (!value) {
    return null;
  }

  let bestMatch: FallingToken | null = null;

  for (const token of tokens) {
    if (!token.word.startsWith(value)) {
      continue;
    }

    if (!bestMatch || token.y > bestMatch.y) {
      bestMatch = token;
    }
  }

  return bestMatch;
};

export default function AiVibeEasterEgg(): ReactElement | null {
  const [isOpen, setIsOpen] = useState(false);
  const [tokens, setTokens] = useState<FallingToken[]>([]);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [maxTokens, setMaxTokens] = useState(0);
  const [streak, setStreak] = useState(0);
  const [incident, setIncident] = useState<IncidentState | null>(null);
  const [status, setStatus] = useState<'playing' | 'won' | 'timeup'>('playing');
  const [timeLeftMs, setTimeLeftMs] = useState(SPEEDRUN_DURATION_MS);
  const [notice, setNotice] = useState<string | null>(null);

  const tokenIdRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const spawnAccumulatorRef = useRef(0);
  const nextIncidentAtRef = useRef(0);
  const noticeTimeoutRef = useRef<number | null>(null);
  const runEndsAtRef = useRef(0);
  const lastTimerSecondRef = useRef<number | null>(null);

  const maxTokensProgress = Math.min(1, maxTokens / MAX_TOKENS_TARGET);
  const isHyper = !!incident;
  const isTimeCritical = timeLeftMs <= 10000;
  const timeProgress = Math.max(0, timeLeftMs / SPEEDRUN_DURATION_MS);
  const formattedTime = formatDuration(timeLeftMs);

  const leaderboardEntries = useMemo(() => {
    const topFive = [...MOCK_LEADERBOARD]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    const entries = [...topFive, { name: 'You', score }];

    return entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      isYou: entry.name === 'You',
    }));
  }, [score]);

  const yourRank = leaderboardEntries.find((entry) => entry.isYou)?.rank;

  const showNotice = useCallback((message: string): void => {
    if (noticeTimeoutRef.current) {
      window.clearTimeout(noticeTimeoutRef.current);
    }

    setNotice(message);
    noticeTimeoutRef.current = window.setTimeout(() => {
      setNotice(null);
    }, 2200);
  }, []);

  const createToken = useCallback(
    (overrides: Partial<FallingToken> = {}): FallingToken => {
      const id = tokenIdRef.current;
      tokenIdRef.current += 1;

      return {
        id,
        word: overrides.word ?? pickRandom(VIBE_WORDS),
        x: overrides.x ?? randomBetween(8, 92),
        y: overrides.y ?? randomBetween(-18, -8),
        speed:
          overrides.speed ?? randomBetween(BASE_SPEED_RANGE[0], BASE_SPEED_RANGE[1]),
        isIncident: overrides.isIncident ?? false,
      };
    },
    [],
  );

  const scheduleNextIncident = useCallback((now: number): void => {
    nextIncidentAtRef.current = now + randomBetween(16000, 24000);
  }, []);

  const endIncident = useCallback(
    (message?: string): void => {
      setIncident(null);
      scheduleNextIncident(performance.now());
      if (message) {
        showNotice(message);
      }
    },
    [scheduleNextIncident, showNotice],
  );

  const startIncident = useCallback(
    (now: number): void => {
      const word = pickRandom(INCIDENT_WORDS);
      setIncident({ word, endsAt: now + INCIDENT_DURATION_MS });
      setTokens((prev) => [
        ...prev,
        createToken({
          word,
          isIncident: true,
          speed: randomBetween(BASE_SPEED_RANGE[0] + 2, BASE_SPEED_RANGE[1] + 4),
        }),
      ]);
      showNotice('Service down! Hyper mode engaged.');
    },
    [createToken, showNotice],
  );

  const resetGame = useCallback((): void => {
    tokenIdRef.current = 0;
    const now = performance.now();
    lastTimeRef.current = now;
    spawnAccumulatorRef.current = 0;
    scheduleNextIncident(now);
    runEndsAtRef.current = now + SPEEDRUN_DURATION_MS;
    lastTimerSecondRef.current = null;

    setTokens([
      createToken({ y: randomBetween(-10, 0) }),
      createToken({ y: randomBetween(-18, -6) }),
      createToken({ y: randomBetween(-24, -10) }),
    ]);
    setInput('');
    setScore(0);
    setMaxTokens(0);
    setStreak(0);
    setIncident(null);
    setStatus('playing');
    setNotice(null);
    setTimeLeftMs(SPEEDRUN_DURATION_MS);
  }, [createToken, scheduleNextIncident]);

  const openGame = useCallback((): void => {
    setIsOpen(true);
    resetGame();
  }, [resetGame]);

  const closeGame = useCallback((): void => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented) {
        return;
      }

      const isHotkey =
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === 'k';

      if (isHotkey) {
        event.preventDefault();
        if (isOpen) {
          closeGame();
          return;
        }

        openGame();
        return;
      }

      if (isOpen && (event.key === 'Escape' || event.key === 'Esc')) {
        event.preventDefault();
        closeGame();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [closeGame, isOpen, openGame]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    inputRef.current?.focus();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || status !== 'playing') {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const step = (time: number): void => {
      const deltaMs = time - lastTimeRef.current;
      lastTimeRef.current = time;
      const delta = Math.max(0, deltaMs / 1000);
      const remainingMs = Math.max(0, runEndsAtRef.current - time);
      const remainingSeconds = Math.ceil(remainingMs / 1000);

      if (remainingSeconds !== lastTimerSecondRef.current) {
        lastTimerSecondRef.current = remainingSeconds;
        setTimeLeftMs(remainingMs);
      }

      spawnAccumulatorRef.current += deltaMs;
      const spawnInterval = incident
        ? INCIDENT_SPAWN_INTERVAL_MS
        : NORMAL_SPAWN_INTERVAL_MS;

      while (spawnAccumulatorRef.current >= spawnInterval) {
        spawnAccumulatorRef.current -= spawnInterval;
        setTokens((prev) => [...prev, createToken()]);
      }

      if (!incident && time >= nextIncidentAtRef.current) {
        startIncident(time);
      }

      if (incident && time >= incident.endsAt) {
        endIncident('Incident auto-resolved. Carry on.');
      }

      const speedBoost = incident ? INCIDENT_SPEED_BOOST : 1;

      setTokens((prev) => {
        let dropped = 0;

        const updated = prev
          .map((token) => {
            const nextY = token.y + token.speed * speedBoost * delta;
            if (nextY > 105) {
              dropped += 1;
              return { ...token, y: nextY };
            }

            return { ...token, y: nextY };
          })
          .filter((token) => token.y <= 105);

        if (dropped > 0) {
          setStreak(0);
          setMaxTokens((value) => Math.max(0, value - dropped * TOKEN_DROP_PENALTY));
        }

        return updated;
      });

      if (maxTokensProgress >= 1 && status !== 'won') {
        setStatus('won');
        showNotice('Max tokens reached. Ship it!');
        return;
      }

      if (remainingMs <= 0 && status === 'playing') {
        setStatus('timeup');
        showNotice('Speedrun complete. Time!');
        return;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [
    createToken,
    endIncident,
    incident,
    isOpen,
    maxTokensProgress,
    showNotice,
    startIncident,
    status,
  ]);

  const activeToken = useMemo(
    () => findBestMatch(tokens, input),
    [tokens, input],
  );

  const hasMatch = !input || !!activeToken;

  const resolveToken = useCallback(
    (match: FallingToken): void => {
      const basePoints = getWordPoints(match.word);
      const incidentBoost = incident ? 2 : 1;
      const streakBonus = Math.min(6, streak);

      setTokens((prev) => prev.filter((token) => token.id !== match.id));
      setInput('');
      setScore((value) => value + basePoints * incidentBoost + streakBonus);
      setMaxTokens((value) =>
        Math.min(
          MAX_TOKENS_TARGET,
          value + basePoints + (incident ? 6 : 0),
        ),
      );
      setStreak((value) => value + 1);

      if (match.isIncident) {
        setMaxTokens((value) =>
          Math.min(MAX_TOKENS_TARGET, value + INCIDENT_BONUS),
        );
        endIncident('Incident resolved. Bonus tokens!');
      }
    },
    [endIncident, incident, streak],
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (status !== 'playing') {
      return;
    }

    const nextValue = sanitizeInput(event.target.value);
    setInput(nextValue);

    const match = findBestMatch(tokens, nextValue);
    if (!match) {
      setStreak(0);
      return;
    }

    if (match.word === nextValue) {
      resolveToken(match);
    }
  };

  const handleInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (event.key === 'Escape' || event.key === 'Esc') {
      event.preventDefault();
      closeGame();
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (!input || !activeToken) {
        return;
      }
      if (activeToken.word === input) {
        resolveToken(activeToken);
        return;
      }
      showNotice('Finish the word to submit.');
      return;
    }

    if (event.key === ' ') {
      event.preventDefault();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-max flex h-full w-full flex-col bg-gradient-to-br from-accent-pepper-subtler via-background-default to-accent-blueCheese-subtler text-text-primary"
      onMouseDown={() => {
        inputRef.current?.focus();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="AI vibes typing game"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -left-24 -top-16 size-80 rounded-full bg-accent-cabbage-bolder opacity-25 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 size-96 rounded-full bg-accent-bacon-bolder opacity-20 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 size-72 -translate-x-1/2 rounded-full bg-accent-onion-bolder opacity-20 blur-3xl" />
      </div>

      <header className="relative z-10 flex flex-col gap-4 p-4 tablet:p-6">
        <div className="flex flex-col gap-2">
          <p className="text-text-tertiary typo-caption1">
            secret mode // ai hub overload
          </p>
          <p className="typo-mega1 font-black uppercase tracking-wide text-transparent bg-gradient-to-r from-accent-cabbage-default via-accent-blueCheese-default to-accent-onion-default bg-clip-text">
            Vibe Overdrive
          </p>
          <p className="max-w-[42rem] text-text-secondary typo-callout">
            Type like the model depends on it. Stack tokens, dodge drops, and
            survive the service meltdowns.
          </p>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-stretch gap-4">
            <div className="flex min-w-[14rem] flex-col rounded-16 border border-border-subtlest-tertiary bg-surface-primary p-3 shadow-2 min-h-[9rem] text-surface-invert">
              <p className="opacity-70 typo-caption1">Objective</p>
              <p className="font-bold typo-title3">Max Tokens</p>
              <div className="mt-2">
                <ProgressBar
                  percentage={maxTokensProgress * 100}
                  shouldShowBg
                  className={{
                    wrapper: 'h-2 rounded-6',
                    barColor: isHyper
                      ? 'bg-accent-bacon-default'
                      : 'bg-accent-cabbage-default',
                  }}
                />
              </div>
              <p className="mt-1 opacity-70 typo-footnote">
                {maxTokens}/{MAX_TOKENS_TARGET} tokens
              </p>
            </div>

            <div className="flex min-w-[12rem] flex-col rounded-16 border border-border-subtlest-tertiary bg-surface-primary p-3 shadow-2 min-h-[9rem] text-surface-invert">
              <p className="opacity-70 typo-caption1">Speedrun</p>
              <p
                className={classNames('font-bold typo-title3', {
                  'text-accent-ketchup-default': isTimeCritical,
                })}
              >
                {formattedTime}
              </p>
              <div className="mt-2">
                <ProgressBar
                  percentage={timeProgress * 100}
                  shouldShowBg
                  className={{
                    wrapper: 'h-2 rounded-6',
                    barColor: isTimeCritical
                      ? 'bg-accent-ketchup-default'
                      : 'bg-accent-blueCheese-default',
                  }}
                />
              </div>
              <p className="mt-1 opacity-70 typo-footnote">
                1 run · no pause
              </p>
            </div>

            <div className="flex min-w-[12rem] flex-col rounded-16 border border-border-subtlest-tertiary bg-surface-primary p-3 shadow-2 min-h-[9rem] text-surface-invert">
              <p className="opacity-70 typo-caption1">Score</p>
              <p className="font-bold typo-title3">{score}</p>
              <p className="mt-1 opacity-70 typo-footnote">
                Streak x{streak}
              </p>
            </div>

            <div className="flex min-w-[14rem] flex-col rounded-16 border border-border-subtlest-tertiary bg-surface-primary p-3 shadow-2 min-h-[9rem] text-surface-invert">
              <p className="opacity-70 typo-caption1">Status</p>
              <p
                className={classNames('font-bold typo-title3', {
                  'text-accent-bacon-default': isHyper,
                })}
              >
                {isHyper ? 'Hyper Mode' : 'Stable'}
              </p>
              <p className="mt-1 opacity-70 typo-footnote">
                {isHyper ? `Fix: ${incident?.word ?? ''}` : 'All services green'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
              onClick={closeGame}
            >
              Exit (Esc)
            </Button>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden px-4 pb-4 tablet:px-6">
        <div className="relative flex-1 overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-surface-primary">
          <div className="pointer-events-none absolute inset-0 opacity-30">
            {Array.from({ length: 10 }).map((_, index) => (
              <span
                key={`grid-v-${index}`}
                className="absolute top-0 h-full w-px bg-border-subtlest-tertiary"
                style={{ left: `${(index + 1) * 9}%` }}
              />
            ))}
            {Array.from({ length: 6 }).map((_, index) => (
              <span
                key={`grid-h-${index}`}
                className="absolute left-0 w-full h-px bg-border-subtlest-tertiary"
                style={{ top: `${(index + 1) * 14}%` }}
              />
            ))}
          </div>
          {tokens.map((token) => (
            <div
              key={token.id}
              className="absolute"
              style={{
                left: `${token.x}%`,
                top: `${token.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className={classNames(
                  'rounded-full p-[1px] shadow-2 transition-transform',
                  {
                    'bg-gradient-to-r from-accent-ketchup-default via-accent-bun-default to-accent-bacon-default':
                      token.isIncident,
                    'bg-gradient-to-r from-accent-cabbage-default via-accent-blueCheese-default to-accent-onion-default':
                      activeToken?.id === token.id,
                    'bg-border-subtlest-primary':
                      !token.isIncident && activeToken?.id !== token.id,
                  },
                )}
              >
                <div
                  className={classNames(
                    'flex items-center gap-2 rounded-full border px-3 py-1 text-surface-primary',
                    {
                      'border-accent-ketchup-default bg-accent-ketchup-default animate-pulse':
                        token.isIncident,
                      'border-border-subtlest-secondary bg-surface-invert':
                        !token.isIncident,
                    },
                  )}
                >
                  <span
                    className={classNames(
                      'relative flex size-7 items-center justify-center rounded-full border bg-surface-primary text-surface-invert shadow-2',
                      {
                        'border-accent-ketchup-default': token.isIncident,
                        'border-border-subtlest-primary': !token.isIncident,
                        'border-accent-cabbage-default':
                          activeToken?.id === token.id,
                      },
                    )}
                  >
                    <span className="absolute inset-1 rounded-full bg-surface-invert opacity-70" />
                    <span className="absolute right-1 top-1 size-1.5 rounded-full bg-accent-blueCheese-default opacity-80" />
                    <span className="relative z-10 size-2 rounded-full bg-accent-cabbage-default" />
                  </span>
                  <span className="typo-callout font-semibold tracking-wide">
                    {token.word}
                  </span>
                  {activeToken?.id === token.id && (
                    <span className="typo-caption2 opacity-80">locked</span>
                  )}
                  {token.isIncident && (
                    <span className="typo-caption2 font-semibold text-surface-invert">
                      incident
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {notice && (
            <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-12 border border-border-subtlest-tertiary bg-surface-primary px-4 py-2 text-surface-invert shadow-2 typo-callout">
              {notice}
            </div>
          )}
          {status !== 'playing' && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-primary bg-opacity-90">
              <div className="flex w-full max-w-[30rem] flex-col items-center gap-4 rounded-24 border border-border-subtlest-tertiary bg-surface-primary p-6 text-center text-surface-invert shadow-2">
                <p className="typo-title2 font-bold">
                  {status === 'won'
                    ? 'Max tokens achieved.'
                    : 'Speedrun complete.'}
                </p>
                <p className="opacity-70 typo-body">
                  {status === 'won'
                    ? 'You shipped the AI vibes. The hub is safe (for now).'
                    : 'Time is up. The model survived. For now.'}
                </p>
                <div className="grid w-full gap-3 tablet:grid-cols-2">
                  <div className="rounded-16 border border-border-subtlest-tertiary bg-surface-invert p-3 text-left text-surface-primary">
                    <p className="opacity-70 typo-caption1">Final score</p>
                    <p className="font-bold typo-title3">{score}</p>
                  </div>
                  <div className="rounded-16 border border-border-subtlest-tertiary bg-surface-invert p-3 text-left text-surface-primary">
                    <p className="opacity-70 typo-caption1">Rank</p>
                    <p className="font-bold typo-title3">
                      {yourRank ? `#${yourRank}` : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    size={ButtonSize.Medium}
                    variant={ButtonVariant.Primary}
                    onClick={resetGame}
                  >
                    Run it back
                  </Button>
                  <Button
                    size={ButtonSize.Medium}
                    variant={ButtonVariant.Tertiary}
                    onClick={closeGame}
                  >
                    Exit
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-4 laptop:grid-cols-[1.5fr_0.7fr]">
          <div className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-primary p-3 shadow-2 text-surface-invert">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="opacity-70 typo-caption1">
                Type the falling AI vibe words to rack up max tokens.
              </p>
              <p className="opacity-70 typo-caption1">
                Shortcut: Cmd/Ctrl + Shift + K
              </p>
            </div>
            <input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              placeholder="type to stabilize the vibes"
              className={classNames(
                'w-full rounded-12 border bg-surface-invert px-4 py-3 text-surface-primary typo-body outline-none transition-colors',
                {
                  'border-accent-ketchup-default': !hasMatch,
                  'border-accent-cabbage-default': isHyper,
                  'border-border-subtlest-tertiary': hasMatch && !isHyper,
                },
              )}
            />
          </div>

          <aside className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-invert p-3 text-surface-primary shadow-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold typo-callout">Leaderboard</p>
              <span className="rounded-12 border border-border-subtlest-tertiary bg-surface-primary px-2 py-1 text-surface-invert typo-caption2">
                mocked
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {leaderboardEntries.map((entry) => (
                <div
                  key={`${entry.rank}-${entry.name}`}
                  className={classNames(
                    'flex items-center gap-2 rounded-12 border border-border-subtlest-tertiary bg-surface-primary px-3 py-2 text-surface-invert',
                    {
                      'border-accent-cabbage-default bg-surface-invert text-surface-primary':
                        entry.isYou,
                    },
                  )}
                >
                  <span className="w-6 text-center font-semibold typo-callout">
                    #{entry.rank}
                  </span>
                  <span className="flex-1 font-semibold typo-callout">
                    {entry.name}
                  </span>
                  <span
                    className={classNames('typo-caption1 opacity-70', {
                      'text-surface-invert': !entry.isYou,
                      'text-surface-primary': entry.isYou,
                    })}
                  >
                    {entry.score}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
