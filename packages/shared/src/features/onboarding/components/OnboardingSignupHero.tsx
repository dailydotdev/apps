import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import Logo, { LogoPosition } from '../../../components/Logo';
import { IconSize } from '../../../components/Icon';
import { UpvoteIcon } from '../../../components/icons/Upvote';
import { DiscussIcon } from '../../../components/icons/Discuss';
import { BookmarkIcon } from '../../../components/icons/Bookmark';
import { SquadIcon } from '../../../components/icons/Squad';
import { StarIcon } from '../../../components/icons/Star';
import { PlusIcon } from '../../../components/icons/Plus';
import {
  ThemeMode,
  useSettingsContext,
} from '../../../contexts/SettingsContext';

type AccentKey = 'cabbage' | 'water' | 'onion' | 'bacon' | 'cheese' | 'avocado';

const ACCENT_BG: Record<AccentKey, string> = {
  cabbage: 'bg-accent-cabbage-default',
  water: 'bg-accent-water-default',
  onion: 'bg-accent-onion-default',
  bacon: 'bg-accent-bacon-default',
  cheese: 'bg-accent-cheese-default',
  avocado: 'bg-accent-avocado-default',
};

const ACCENT_TEXT: Record<AccentKey, string> = {
  cabbage: 'text-accent-cabbage-default',
  water: 'text-accent-water-default',
  onion: 'text-accent-onion-default',
  bacon: 'text-accent-bacon-default',
  cheese: 'text-accent-cheese-default',
  avocado: 'text-accent-avocado-default',
};

const unsplash = (id: string, w = 480, h = 280): string =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=72&auto=format`;

const face = (seed: string, size = 64): string =>
  `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(
    seed,
  )}&backgroundColor=transparent&size=${size}`;

const sourceLogo = (seed: string, size = 64): string =>
  `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(
    seed,
  )}&size=${size}`;

const HERO_STYLES = `
.onb-bg {
  background:
    radial-gradient(ellipse 65% 50% at 15% 18%,
      color-mix(in srgb, var(--theme-accent-cabbage-default) 8%, transparent) 0%,
      transparent 65%),
    radial-gradient(ellipse 55% 45% at 88% 32%,
      color-mix(in srgb, var(--theme-accent-water-default) 7%, transparent) 0%,
      transparent 70%),
    var(--theme-background-default);
}
.onb-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(120px);
  mix-blend-mode: screen;
  pointer-events: none;
  opacity: 0.32;
  animation: onb-breathe 22s ease-in-out infinite;
}
.onb-orb--delay { animation-delay: -8s; }
@keyframes onb-breathe {
  0%, 100% { opacity: 0.26; }
  50% { opacity: 0.42; }
}
@media (prefers-reduced-motion: reduce) {
  .onb-orb { animation: none; opacity: 0.32; }
}
.onb-form-halo {
  background:
    radial-gradient(
      ellipse 80% 60% at 50% 92%,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 0.98) 18%,
      rgba(0, 0, 0, 0.9) 32%,
      rgba(0, 0, 0, 0.72) 48%,
      rgba(0, 0, 0, 0.42) 64%,
      rgba(0, 0, 0, 0.15) 80%,
      transparent 92%
    );
}
.onb-bottom-vignette {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 32%,
    rgba(0, 0, 0, 0.45) 56%,
    rgba(0, 0, 0, 0.85) 78%,
    rgba(0, 0, 0, 1) 100%
  );
}
.onb-top-fade {
  background: linear-gradient(
    to bottom,
    rgba(8, 8, 12, 0.55) 0%,
    rgba(8, 8, 12, 0.12) 28%,
    transparent 44%
  );
}
.onb-headline { text-shadow: 0 2px 28px rgba(0, 0, 0, 0.85); }
.onb-card-shadow {
  box-shadow:
    0 24px 56px -16px rgba(0, 0, 0, 0.6),
    0 8px 20px -8px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(255, 255, 255, 0.04);
}
.onb-cover-shade {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 38%,
    rgba(0, 0, 0, 0.55) 100%
  );
}
.onb-grid-mask {
  -webkit-mask-image:
    radial-gradient(
      ellipse 78% 58% at 50% 95%,
      transparent 0%,
      transparent 18%,
      rgba(0, 0, 0, 0.4) 38%,
      rgba(0, 0, 0, 0.95) 65%,
      black 100%
    );
  mask-image:
    radial-gradient(
      ellipse 78% 58% at 50% 95%,
      transparent 0%,
      transparent 18%,
      rgba(0, 0, 0, 0.4) 38%,
      rgba(0, 0, 0, 0.95) 65%,
      black 100%
    );
}
.onb-pulse-dot {
  animation: onb-pulse-dot 2.4s ease-out infinite;
  transform-origin: center;
}
@keyframes onb-pulse-dot {
  0% { box-shadow: 0 0 0 0 rgba(76, 217, 100, 0.5); }
  100% { box-shadow: 0 0 0 10px rgba(76, 217, 100, 0); }
}
@media (prefers-reduced-motion: reduce) {
  .onb-pulse-dot { animation: none; }
}
`;

// =============================================================
// Shared building blocks
// =============================================================

const FaceAvatar = ({
  seed,
  size = 32,
  ring,
}: {
  seed: string;
  size?: number;
  ring?: boolean;
}): ReactElement => (
  <span
    className={classNames(
      'inline-flex shrink-0 overflow-hidden rounded-full bg-surface-float',
      ring && 'border-2 border-background-default',
    )}
    style={{ width: `${size}px`, height: `${size}px` }}
  >
    <img
      src={face(seed, size * 2)}
      alt=""
      className="h-full w-full object-cover"
      loading="lazy"
      decoding="async"
    />
  </span>
);

const SourceBadge = ({
  seed,
  size = 24,
}: {
  seed: string;
  size?: number;
}): ReactElement => (
  <span
    className="inline-flex shrink-0 overflow-hidden rounded-8 bg-surface-float"
    style={{ width: `${size}px`, height: `${size}px` }}
  >
    <img
      src={sourceLogo(seed, size * 2)}
      alt=""
      className="h-full w-full object-cover"
      loading="lazy"
      decoding="async"
    />
  </span>
);

// =============================================================
// Variant A — Cards: feed wall grid (Netflix-style)
// =============================================================

type FeedItem = {
  id: string;
  title: string;
  source: string;
  cover: string;
  upvotes: string;
  comments: string;
  tag: string;
  accent: AccentKey;
  commenterSeed: string;
};

const FEED_ITEMS: FeedItem[] = [
  {
    id: 'f1',
    title: 'Why we rewrote our build system in Rust',
    source: 'Stripe Engineering',
    cover: '1555066931-4365d14bab8c',
    upvotes: '1.4k',
    comments: '184',
    tag: 'rust',
    accent: 'water',
    commenterSeed: 'maya',
  },
  {
    id: 'f2',
    title: 'TypeScript 5.5 — 4 features you will actually use',
    source: 'Fireship',
    cover: '1542831371-29b0f74f9713',
    upvotes: '3.4k',
    comments: '420',
    tag: 'typescript',
    accent: 'bacon',
    commenterSeed: 'oren',
  },
  {
    id: 'f3',
    title: 'How Claude Code changed our review culture',
    source: 'The Pragmatic Engineer',
    cover: '1620712943543-bcc4688e7485',
    upvotes: '2.1k',
    comments: '312',
    tag: 'ai',
    accent: 'onion',
    commenterSeed: 'daria',
  },
  {
    id: 'f4',
    title: 'Edge functions, benchmarked: 14ms vs 280ms',
    source: 'Vercel',
    cover: '1517694712202-14dd9538aa97',
    upvotes: '894',
    comments: '128',
    tag: 'edge',
    accent: 'cabbage',
    commenterSeed: 'theo',
  },
  {
    id: 'f5',
    title: 'Postgres or SQLite in 2026? A pragmatic guide',
    source: 'High Scalability',
    cover: '1581090464777-f3220bbe1b8b',
    upvotes: '2.7k',
    comments: '512',
    tag: 'databases',
    accent: 'cheese',
    commenterSeed: 'kim',
  },
  {
    id: 'f6',
    title: 'Kubernetes is fine. Your YAML is the problem.',
    source: 'CNCF',
    cover: '1535551951406-a19828b0a76b',
    upvotes: '1.9k',
    comments: '240',
    tag: 'devops',
    accent: 'water',
    commenterSeed: 'liam',
  },
  {
    id: 'f7',
    title: 'A one-line trick to debounce async hooks',
    source: 'daily.dev',
    cover: '1633356122544-f134324a6cee',
    upvotes: '824',
    comments: '91',
    tag: 'react',
    accent: 'cabbage',
    commenterSeed: 'sara',
  },
  {
    id: 'f8',
    title: 'The hidden cost of unused indexes in Postgres',
    source: 'Crunchy Data',
    cover: '1607799279861-4dd421887fb3',
    upvotes: '1.2k',
    comments: '156',
    tag: 'postgres',
    accent: 'onion',
    commenterSeed: 'noah',
  },
  {
    id: 'f9',
    title: 'I tried 7 AI code editors so you do not have to',
    source: 'Pragmatic AI',
    cover: '1635070041078-e363dbe005cb',
    upvotes: '4.1k',
    comments: '602',
    tag: 'ai-tools',
    accent: 'bacon',
    commenterSeed: 'eli',
  },
  {
    id: 'f10',
    title: 'Tailwind v4: what changed and what broke for us',
    source: 'TkDodo',
    cover: '1573164574572-cb89e39749b4',
    upvotes: '986',
    comments: '174',
    tag: 'css',
    accent: 'water',
    commenterSeed: 'jules',
  },
  {
    id: 'f11',
    title: 'Bun vs Node in 2026: surprising benchmarks',
    source: 'Bytes',
    cover: '1593642632559-0c6d3fc62b89',
    upvotes: '1.6k',
    comments: '288',
    tag: 'node',
    accent: 'cheese',
    commenterSeed: 'mia',
  },
  {
    id: 'f12',
    title: 'Lessons from scaling Postgres to 1M writes/sec',
    source: 'The Pragmatic Engineer',
    cover: '1517433670267-08bbd4be890f',
    upvotes: '3.2k',
    comments: '388',
    tag: 'scale',
    accent: 'cabbage',
    commenterSeed: 'ari',
  },
];

const FeedCard = ({ item }: { item: FeedItem }): ReactElement => (
  <article className="onb-card-shadow flex w-full flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle">
    <div className="relative aspect-[16/10] w-full overflow-hidden">
      <img
        src={unsplash(item.cover, 400, 240)}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <div className="onb-cover-shade absolute inset-0" />
      <span className="bg-black/55 absolute right-2 top-2 inline-flex items-center rounded-full px-2 py-0.5 text-white backdrop-blur-sm typo-caption2">
        <span className="font-semibold">#{item.tag}</span>
      </span>
    </div>

    <div className="flex flex-col gap-2 px-3 pt-2.5">
      <div className="flex items-center gap-2">
        <SourceBadge seed={item.source} size={20} />
        <span className="truncate text-text-tertiary typo-caption1">
          {item.source}
        </span>
        <span className="text-text-quaternary typo-caption2">· 2h</span>
      </div>
      <h3 className="line-clamp-2 text-balance font-bold leading-snug text-text-primary typo-footnote">
        {item.title}
      </h3>
    </div>

    <div className="mt-2 flex items-center gap-1 border-t border-border-subtlest-tertiary px-2 py-1.5">
      <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-1 text-text-tertiary typo-caption2">
        <UpvoteIcon size={IconSize.XXSmall} secondary />
        <span className="font-semibold tabular-nums">{item.upvotes}</span>
      </span>
      <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-1 text-text-tertiary typo-caption2">
        <DiscussIcon size={IconSize.XXSmall} secondary />
        <span className="font-semibold tabular-nums">{item.comments}</span>
      </span>
      <FaceAvatar seed={item.commenterSeed} size={20} ring />
      <span className="ml-auto inline-flex items-center px-1 py-1 text-text-quaternary">
        <BookmarkIcon size={IconSize.XXSmall} secondary />
      </span>
    </div>
  </article>
);

const CardsBackground = (): ReactElement => (
  <div
    aria-hidden
    className="onb-grid-mask pointer-events-none absolute inset-0 -z-1 select-none overflow-hidden"
  >
    <div className="grid grid-cols-2 gap-3 p-4 tablet:grid-cols-3 tablet:gap-4 tablet:p-6 laptop:grid-cols-4 laptopL:grid-cols-5">
      {FEED_ITEMS.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}
    </div>
  </div>
);

// =============================================================
// Variant B — Squads: directory grid
// =============================================================

type SquadData = {
  id: string;
  name: string;
  handle: string;
  accent: AccentKey;
  description: string;
  members: string;
  posts: string;
  topRank: string;
  banner: string;
  avatarSeeds: string[];
  topic: string;
};

const SQUADS_DATA: SquadData[] = [
  {
    id: 'ai',
    name: 'AI & LLMs',
    handle: 'ai-engineers',
    accent: 'onion',
    description: 'Where engineers ship with LLMs. Real prompts, real agents.',
    members: '12.4k',
    posts: '8.2k',
    topRank: 'Top 1%',
    banner: '1620712943543-bcc4688e7485',
    avatarSeeds: ['maya', 'oren', 'daria', 'theo', 'sara'],
    topic: 'ai',
  },
  {
    id: 'frontend',
    name: 'Frontend',
    handle: 'frontend-devs',
    accent: 'water',
    description: 'CSS tricks, framework rants, and the bleeding edge of UI.',
    members: '34.1k',
    posts: '21.7k',
    topRank: 'Top 5',
    banner: '1542831371-29b0f74f9713',
    avatarSeeds: ['mia', 'jules', 'noah', 'eli', 'kim'],
    topic: 'frontend',
  },
  {
    id: 'devops',
    name: 'DevOps & Cloud',
    handle: 'devops-cloud',
    accent: 'cheese',
    description: 'Pipelines, Kubernetes wars, and fewer 3 a.m. outages.',
    members: '18.6k',
    posts: '11.3k',
    topRank: 'Top 12',
    banner: '1535551951406-a19828b0a76b',
    avatarSeeds: ['liam', 'ari', 'jess', 'ravi', 'paul'],
    topic: 'devops',
  },
  {
    id: 'rust',
    name: 'Rust Builders',
    handle: 'rust-lang',
    accent: 'bacon',
    description: 'Borrow-checker survivors building real production systems.',
    members: '9.2k',
    posts: '6.4k',
    topRank: 'Top 8',
    banner: '1555066931-4365d14bab8c',
    avatarSeeds: ['ben', 'leo', 'nat', 'pia', 'roy'],
    topic: 'rust',
  },
  {
    id: 'startups',
    name: 'Indie Hackers',
    handle: 'indie-hackers',
    accent: 'cabbage',
    description: 'Side projects, MRR milestones, and quitting your day job.',
    members: '22.8k',
    posts: '15.1k',
    topRank: 'Top 3',
    banner: '1517433670267-08bbd4be890f',
    avatarSeeds: ['rin', 'sky', 'ash', 'cal', 'dax'],
    topic: 'startups',
  },
  {
    id: 'design',
    name: 'Design Engineering',
    handle: 'design-eng',
    accent: 'avocado',
    description: 'Where pixels and components meet — for engineers who care.',
    members: '7.6k',
    posts: '4.9k',
    topRank: 'Top 14',
    banner: '1573164574572-cb89e39749b4',
    avatarSeeds: ['ivy', 'tom', 'mae', 'wes', 'zoe'],
    topic: 'design',
  },
];

const SquadCard = ({ squad }: { squad: SquadData }): ReactElement => (
  <article className="onb-card-shadow flex flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle">
    <div className="relative h-20 w-full overflow-hidden">
      <img
        src={unsplash(squad.banner, 480, 160)}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <div
        className={classNames(
          'opacity-70 absolute inset-0 mix-blend-multiply',
          ACCENT_BG[squad.accent],
        )}
      />
      <div className="to-black/45 absolute inset-0 bg-gradient-to-b from-transparent" />
      <div className="bg-black/55 absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-white backdrop-blur-sm typo-caption2">
        <StarIcon size={IconSize.XXSmall} secondary />
        <span className="font-semibold">{squad.topRank}</span>
      </div>
      <div className="absolute -bottom-6 left-3 flex h-12 w-12 items-center justify-center rounded-12 border-4 border-background-default bg-background-subtle">
        <span
          className={classNames(
            'flex h-full w-full items-center justify-center rounded-8 text-white',
            ACCENT_BG[squad.accent],
          )}
        >
          <SquadIcon size={IconSize.Small} secondary />
        </span>
      </div>
    </div>

    <div className="flex flex-1 flex-col gap-2 px-3 pb-3 pt-7">
      <div>
        <h3 className="font-bold text-text-primary typo-callout">
          {squad.name}
        </h3>
        <p className="text-text-tertiary typo-caption2">@{squad.handle}</p>
      </div>
      <p className="line-clamp-2 text-text-secondary typo-caption1">
        {squad.description}
      </p>

      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full border border-border-subtlest-tertiary px-2 py-0.5 text-text-tertiary typo-caption2">
          <span className="font-bold text-text-primary">{squad.members}</span>
          <span>members</span>
        </span>
        <span
          className={classNames(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 typo-caption2',
            'bg-surface-float',
            ACCENT_TEXT[squad.accent],
          )}
        >
          #{squad.topic}
        </span>
      </div>

      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex -space-x-2">
          {squad.avatarSeeds.slice(0, 4).map((seed) => (
            <FaceAvatar key={seed} seed={seed} size={26} ring />
          ))}
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-background-default bg-surface-float font-semibold text-text-tertiary typo-caption2">
            +{Math.max(0, parseInt(squad.members, 10) - 4)}k
          </span>
        </div>
        <button
          type="button"
          className={classNames(
            'inline-flex items-center gap-1 rounded-10 px-2.5 py-1 font-bold text-white typo-caption1',
            ACCENT_BG[squad.accent],
          )}
          tabIndex={-1}
        >
          <PlusIcon size={IconSize.XXSmall} secondary />
          Join
        </button>
      </div>
    </div>
  </article>
);

const SquadsBackground = (): ReactElement => (
  <div
    aria-hidden
    className="onb-grid-mask pointer-events-none absolute inset-0 -z-1 select-none overflow-hidden"
  >
    <div className="grid grid-cols-1 gap-4 p-6 tablet:grid-cols-2 tablet:p-8 laptop:grid-cols-3">
      {SQUADS_DATA.map((squad) => (
        <SquadCard key={squad.id} squad={squad} />
      ))}
    </div>
  </div>
);

// =============================================================
// Variant C — Stream: live activity wall
// =============================================================

type StreamItem = {
  id: string;
  actor: string;
  actorSeed: string;
  actorAccent: AccentKey;
  action:
    | 'upvoted'
    | 'commented on'
    | 'shared'
    | 'started a thread on'
    | 'joined'
    | 'reposted';
  target: string;
  targetMeta?: string;
  time: string;
  preview?: {
    title: string;
    cover: string;
    source: string;
  };
  comment?: string;
  fresh?: boolean;
};

const STREAM_ITEMS: StreamItem[] = [
  {
    id: 's1',
    actor: 'Maya R.',
    actorSeed: 'maya',
    actorAccent: 'cabbage',
    action: 'upvoted',
    target: 'Why we rewrote our build system in Rust',
    time: 'just now',
    preview: {
      title: 'Why we rewrote our build system in Rust',
      cover: '1555066931-4365d14bab8c',
      source: 'Stripe Engineering',
    },
    fresh: true,
  },
  {
    id: 's2',
    actor: 'Oren H.',
    actorSeed: 'oren',
    actorAccent: 'water',
    action: 'commented on',
    target: 'Postgres or SQLite in 2026?',
    time: '42s',
    comment:
      '"At our scale (~50M rows) SQLite WAL + Litestream beat managed Postgres on every metric except writes."',
  },
  {
    id: 's3',
    actor: 'Daria K.',
    actorSeed: 'daria',
    actorAccent: 'onion',
    action: 'shared',
    target: 'I tried 7 AI code editors so you do not have to',
    time: '1m',
    preview: {
      title: 'I tried 7 AI code editors so you do not have to',
      cover: '1635070041078-e363dbe005cb',
      source: 'Pragmatic AI',
    },
  },
  {
    id: 's4',
    actor: 'Theo B.',
    actorSeed: 'theo',
    actorAccent: 'cheese',
    action: 'started a thread on',
    target: 'AI tooling I actually use day-to-day',
    time: '3m',
    comment:
      '"Cursor for refactors, Claude for code review, GH Copilot just for inline. Anyone else?"',
  },
  {
    id: 's5',
    actor: 'Sara P.',
    actorSeed: 'sara',
    actorAccent: 'bacon',
    action: 'upvoted',
    target: 'TypeScript 5.5 — 4 features you will actually use',
    time: '4m',
    preview: {
      title: 'TypeScript 5.5 — 4 features you will actually use',
      cover: '1542831371-29b0f74f9713',
      source: 'Fireship',
    },
  },
  {
    id: 's6',
    actor: 'Liam C.',
    actorSeed: 'liam',
    actorAccent: 'water',
    action: 'joined',
    target: 'DevOps & Cloud',
    targetMeta: 'Squad',
    time: '6m',
  },
  {
    id: 's7',
    actor: 'Kim Y.',
    actorSeed: 'kim',
    actorAccent: 'cabbage',
    action: 'reposted',
    target: 'The hidden cost of unused indexes in Postgres',
    time: '8m',
    preview: {
      title: 'The hidden cost of unused indexes in Postgres',
      cover: '1607799279861-4dd421887fb3',
      source: 'Crunchy Data',
    },
  },
  {
    id: 's8',
    actor: 'Eli M.',
    actorSeed: 'eli',
    actorAccent: 'onion',
    action: 'commented on',
    target: 'Kubernetes is fine. Your YAML is the problem.',
    time: '11m',
    comment:
      '"Honestly Helm + Kustomize finally clicked when I stopped trying to make them friends."',
  },
  {
    id: 's9',
    actor: 'Jules T.',
    actorSeed: 'jules',
    actorAccent: 'cheese',
    action: 'upvoted',
    target: 'Edge functions, benchmarked: 14ms vs 280ms',
    time: '13m',
    preview: {
      title: 'Edge functions, benchmarked: 14ms vs 280ms',
      cover: '1517694712202-14dd9538aa97',
      source: 'Vercel',
    },
  },
];

const ACTION_VERB_COLOR: Record<StreamItem['action'], AccentKey> = {
  upvoted: 'cabbage',
  'commented on': 'water',
  shared: 'onion',
  'started a thread on': 'cheese',
  joined: 'bacon',
  reposted: 'avocado',
};

const StreamCard = ({ item }: { item: StreamItem }): ReactElement => {
  const verbColor = ACTION_VERB_COLOR[item.action];
  return (
    <article className="onb-card-shadow flex break-inside-avoid flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-3">
      <header className="flex items-center gap-2.5">
        <div className="relative">
          <FaceAvatar seed={item.actorSeed} size={40} />
          {item.fresh && (
            <span className="onb-pulse-dot absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background-subtle bg-accent-cabbage-default" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="leading-snug text-text-primary typo-footnote">
            <span className="font-bold">{item.actor}</span>{' '}
            <span className={classNames('font-medium', ACCENT_TEXT[verbColor])}>
              {item.action}
            </span>
          </p>
          <p className="text-text-quaternary typo-caption2">{item.time} ago</p>
        </div>
      </header>

      {item.preview && (
        <div className="flex gap-2.5 overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default p-2">
          <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-8">
            <img
              src={unsplash(item.preview.cover, 160, 110)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
            <p className="line-clamp-2 text-balance font-semibold leading-snug text-text-primary typo-caption1">
              {item.preview.title}
            </p>
            <span className="truncate text-text-tertiary typo-caption2">
              {item.preview.source}
            </span>
          </div>
        </div>
      )}

      {item.comment && (
        <blockquote className="border-l-2 border-border-subtlest-tertiary pl-3 text-text-secondary typo-caption1">
          {item.comment}
        </blockquote>
      )}

      {!item.preview && !item.comment && item.targetMeta && (
        <div className="flex items-center gap-2 rounded-12 bg-surface-float p-2">
          <span
            className={classNames(
              'flex h-9 w-9 items-center justify-center rounded-10 text-white',
              ACCENT_BG[verbColor],
            )}
          >
            <SquadIcon size={IconSize.Small} secondary />
          </span>
          <div className="flex flex-col">
            <span className="font-bold text-text-primary typo-footnote">
              {item.target}
            </span>
            <span className="text-text-tertiary typo-caption2">
              {item.targetMeta}
            </span>
          </div>
        </div>
      )}
    </article>
  );
};

const StreamBackground = (): ReactElement => (
  <div
    aria-hidden
    className="onb-grid-mask pointer-events-none absolute inset-0 -z-1 select-none overflow-hidden"
  >
    <div className="columns-1 gap-3 p-4 tablet:columns-2 tablet:gap-4 tablet:p-6 laptop:columns-3 laptopL:columns-4 [&>*]:mb-3 tablet:[&>*]:mb-4">
      {STREAM_ITEMS.map((item) => (
        <StreamCard key={item.id} item={item} />
      ))}
    </div>
  </div>
);

// =============================================================
// Variant D — Desk: full-cover photo backdrop
// =============================================================

const DeskBackground = (): ReactElement => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 -z-1 select-none"
  >
    <picture>
      <img
        src="/assets/onboarding-hero-desk.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="eager"
        decoding="async"
      />
    </picture>
    <div
      className="absolute inset-0"
      style={{
        background:
          'linear-gradient(180deg, rgba(8,8,12,0.35) 0%, rgba(8,8,12,0.1) 30%, rgba(8,8,12,0.25) 60%, rgba(8,8,12,0.7) 100%)',
      }}
    />
  </div>
);

// =============================================================
// Variant registry & switcher
// =============================================================

type VariantId = 'cards' | 'squads' | 'stream' | 'desk';

type VariantDef = {
  id: VariantId;
  label: string;
  render: () => ReactElement;
};

const VARIANTS: VariantDef[] = [
  { id: 'cards', label: 'Cards', render: () => <CardsBackground /> },
  { id: 'squads', label: 'Squads', render: () => <SquadsBackground /> },
  { id: 'stream', label: 'Stream', render: () => <StreamBackground /> },
  { id: 'desk', label: 'Desk', render: () => <DeskBackground /> },
];

const VARIANT_STORAGE_KEY = 'onb-hero-variant';
const VARIANT_IDS = new Set(VARIANTS.map((v) => v.id));

const isVariantId = (value: string | null): value is VariantId =>
  !!value && VARIANT_IDS.has(value as VariantId);

const readInitialVariant = (): VariantId => {
  if (typeof window === 'undefined') {
    return VARIANTS[0].id;
  }
  const fromUrl = new URLSearchParams(window.location.search).get('variant');
  if (isVariantId(fromUrl)) {
    return fromUrl;
  }
  const fromStorage = window.localStorage.getItem(VARIANT_STORAGE_KEY);
  if (isVariantId(fromStorage)) {
    return fromStorage;
  }
  return VARIANTS[0].id;
};

const VariantSwitcher = ({
  value,
  onChange,
}: {
  value: VariantId;
  onChange: (next: VariantId) => void;
}): ReactElement => (
  <div
    className="bg-raw-pepper-90/85 border-white/10 pointer-events-auto fixed right-4 top-4 flex items-center gap-1 rounded-full border p-1 backdrop-blur-md tablet:right-6 tablet:top-6"
    style={{ zIndex: 50 }}
    role="radiogroup"
    aria-label="Background variant"
  >
    <span className="px-2 text-text-quaternary typo-caption2">Variant</span>
    {VARIANTS.map((variant) => {
      const active = variant.id === value;
      return (
        <button
          key={variant.id}
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onChange(variant.id)}
          className={classNames(
            'pointer-events-auto cursor-pointer rounded-full px-3 py-1 font-medium tracking-tight transition-colors typo-caption2',
            active
              ? 'bg-white/15 text-text-primary'
              : 'text-text-tertiary hover:text-text-primary',
          )}
        >
          {variant.label}
        </button>
      );
    })}
  </div>
);

// =============================================================
// Main hero
// =============================================================

type Props = {
  children: ReactNode;
  isFormExpanded?: boolean;
  headline?: string | null;
};

const DEFAULT_HEADLINE = 'The homepage every developer deserves.';

export const OnboardingSignupHero = ({
  children,
  isFormExpanded = false,
  headline = DEFAULT_HEADLINE,
}: Props): ReactElement => {
  const { applyThemeMode } = useSettingsContext();
  const [variantId, setVariantId] = useState<VariantId>(VARIANTS[0].id);

  useEffect(() => {
    setVariantId(readInitialVariant());
  }, []);

  useEffect(() => {
    applyThemeMode(ThemeMode.Dark);
    return () => {
      applyThemeMode();
    };
  }, [applyThemeMode]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(VARIANT_STORAGE_KEY, variantId);
  }, [variantId]);

  const activeVariant = VARIANTS.find((v) => v.id === variantId) ?? VARIANTS[0];

  return (
    <div className="onb-bg relative isolate flex min-h-dvh w-full overflow-hidden bg-raw-pepper-90 text-text-primary">
      <style dangerouslySetInnerHTML={{ __html: HERO_STYLES }} />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-1 select-none"
      >
        <span
          className="onb-orb bg-accent-cabbage-default"
          style={{
            width: '38rem',
            height: '38rem',
            top: '-10rem',
            left: '-8rem',
          }}
        />
        <span
          className="onb-orb onb-orb--delay bg-accent-water-default"
          style={{
            width: '32rem',
            height: '32rem',
            top: '18%',
            right: '-10rem',
          }}
        />
      </div>

      {activeVariant.render()}

      <div
        aria-hidden
        className="onb-top-fade pointer-events-none absolute inset-x-0 top-0 -z-1 h-40"
      />
      <div
        aria-hidden
        className="onb-bottom-vignette pointer-events-none absolute inset-x-0 bottom-0 -z-1 h-[55vh]"
      />
      <div
        aria-hidden
        className="onb-form-halo pointer-events-none absolute inset-0 -z-1"
      />

      <VariantSwitcher value={variantId} onChange={setVariantId} />

      <main className="relative z-1 flex w-full flex-1 flex-col items-center justify-end px-5 pb-[10vh] pt-10 tablet:pb-[12vh] tablet:pt-14">
        <div className="flex w-full max-w-[26rem] flex-col gap-6 tablet:gap-7">
          <Logo
            position={LogoPosition.Relative}
            className="!left-0 !top-0 !mt-0 !translate-x-0 self-center"
            logoClassName={{ container: 'h-7' }}
          />

          {!isFormExpanded && headline && (
            <h1 className="onb-headline text-balance text-center font-bold leading-[1.05] tracking-tight text-text-primary typo-title2 tablet:typo-mega3">
              {headline}
            </h1>
          )}

          {children}
        </div>
      </main>
    </div>
  );
};

export default OnboardingSignupHero;
