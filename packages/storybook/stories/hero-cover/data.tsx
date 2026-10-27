import type { ReactElement } from 'react';
import React from 'react';
import { BriefGradientIcon } from '@dailydotdev/shared/src/components/icons/BriefGradient';
import { MicrophoneIcon } from '@dailydotdev/shared/src/components/icons/Microphone';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons/Squad';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';

const minutesAgo = (minutes: number): string =>
  new Date(Date.now() - minutes * 60 * 1000).toISOString();

export type AgentUpdate = {
  id: string;
  agent: string;
  /** Letter tile until the real logos are wired. */
  initial: string;
  tone: Tone;
  version?: string;
  /** Bold first line, for updates that come from a highlight. */
  headline?: string;
  /** The source's logo, in place of the letter tile. */
  image?: string;
  change: string;
  at: string;
};

export type Tone =
  | 'cabbage'
  | 'bacon'
  | 'avocado'
  | 'cheese'
  | 'water'
  | 'onion'
  | 'bun';

export const agentUpdates: AgentUpdate[] = [
  {
    id: 'claude-code',
    agent: 'Claude Code',
    initial: 'C',
    tone: 'bacon',
    version: '2.4',
    change:
      'Background tasks keep running after you close the terminal. Long builds, test suites and migrations now survive a dropped SSH session, and `/tasks` shows everything still in flight with its logs. Hooks fire when a task finishes, so you can wire a desktop notification or a Slack ping without polling. Existing sessions pick it up after `claude update`.',
    at: minutesAgo(18),
  },
  {
    id: 'codex',
    agent: 'Codex CLI',
    initial: 'X',
    tone: 'water',
    version: '0.52',
    change:
      'Parallel sub-agents land behind `--experimental-swarm`. The planner splits a task into independent steps and runs up to four workers at once, each in its own sandbox, then merges their diffs. Early numbers show refactors finishing in about half the wall-clock time.',
    at: minutesAgo(64),
  },
  {
    id: 'cursor',
    agent: 'Cursor',
    initial: 'Cu',
    tone: 'onion',
    version: '1.9',
    change:
      'Bugbot now reviews every PR before a human sees it, and leaves fix suggestions you can apply in one click.',
    at: minutesAgo(140),
  },
  {
    id: 'copilot',
    agent: 'GitHub Copilot',
    initial: 'G',
    tone: 'cabbage',
    change:
      'Assign an issue to Copilot and the coding agent opens a draft PR with a plan, the diff and a passing CI run. It asks for review instead of merging, and you can steer it from PR comments. Available on Business and Enterprise plans today, with Pro next month.',
    at: minutesAgo(230),
  },
  {
    id: 'gemini',
    agent: 'Gemini CLI',
    initial: 'Ge',
    tone: 'avocado',
    version: '0.11',
    change:
      'The free tier doubles to 2,000 requests a day, and the 1M-token context window is now available to every account.',
    at: minutesAgo(380),
  },
  {
    id: 'windsurf',
    agent: 'Windsurf',
    initial: 'W',
    tone: 'cheese',
    version: '1.12',
    change:
      'Cascade now picks the model per step: a fast model for search and edits, a reasoning model for planning. You can pin a model per workspace if you prefer.',
    at: minutesAgo(520),
  },
];

export type Promo = {
  id: string;
  eyebrow: string;
  title: string;
  meta: string;
  cta: string;
  tone: Tone;
  /** Shown where a promo has artwork of its own, e.g. a squad cover. */
  image?: string;
  badge?: string;
  icon: (size: IconSize) => ReactElement;
};

export const promos: Promo[] = [
  {
    id: 'briefing',
    eyebrow: 'Presidential briefing',
    title: 'Your morning brief is ready',
    meta: '7 stories · 2 min read',
    cta: 'Read brief',
    tone: 'onion',
    badge: 'New',
    icon: (size) => <BriefGradientIcon secondary size={size} />,
  },
  {
    id: 'podcast',
    eyebrow: 'daily.dev podcast',
    title: 'Ep. 42: Shipping production code with agents',
    meta: '38 min · out today',
    cta: 'Listen',
    tone: 'bacon',
    image: 'https://media.daily.dev/image/upload/f_auto/v1/placeholders/3',
    icon: (size) => <MicrophoneIcon secondary size={size} />,
  },
  {
    id: 'squad',
    eyebrow: 'Promoted squad',
    title: 'Rust Builders',
    meta: '12.4K members · 38 posts this week',
    cta: 'Join',
    tone: 'avocado',
    image: 'https://media.daily.dev/image/upload/f_auto/v1/placeholders/5',
    icon: (size) => <SquadIcon secondary size={size} />,
  },
];

/**
 * Written out, not built: Tailwind only generates the classes it can see.
 */
export const toneClass: Record<
  Tone,
  { fill: string; subtle: string; text: string; wash: string }
> = {
  cabbage: {
    fill: 'bg-accent-cabbage-default',
    subtle: 'bg-accent-cabbage-flat',
    text: 'text-accent-cabbage-default',
    wash: 'from-accent-cabbage-flat',
  },
  bacon: {
    fill: 'bg-accent-bacon-default',
    subtle: 'bg-accent-bacon-flat',
    text: 'text-accent-bacon-default',
    wash: 'from-accent-bacon-flat',
  },
  avocado: {
    fill: 'bg-accent-avocado-default',
    subtle: 'bg-accent-avocado-flat',
    text: 'text-accent-avocado-default',
    wash: 'from-accent-avocado-flat',
  },
  cheese: {
    fill: 'bg-accent-cheese-default',
    subtle: 'bg-accent-cheese-flat',
    text: 'text-accent-cheese-default',
    wash: 'from-accent-cheese-flat',
  },
  water: {
    fill: 'bg-accent-water-default',
    subtle: 'bg-accent-water-flat',
    text: 'text-accent-water-default',
    wash: 'from-accent-water-flat',
  },
  onion: {
    fill: 'bg-accent-onion-default',
    subtle: 'bg-accent-onion-flat',
    text: 'text-accent-onion-default',
    wash: 'from-accent-onion-flat',
  },
  bun: {
    fill: 'bg-accent-bun-default',
    subtle: 'bg-accent-bun-flat',
    text: 'text-accent-bun-default',
    wash: 'from-accent-bun-flat',
  },
};
