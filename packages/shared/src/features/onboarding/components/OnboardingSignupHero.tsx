import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import Logo, { LogoPosition } from '../../../components/Logo';
import { IconSize } from '../../../components/Icon';
import { UpvoteIcon } from '../../../components/icons/Upvote';
import { DiscussIcon } from '../../../components/icons/Discuss';
import { ShareIcon } from '../../../components/icons/Share';
import { BookmarkIcon } from '../../../components/icons/Bookmark';
import { PlayIcon } from '../../../components/icons/Play';
import { TerminalIcon } from '../../../components/icons/Terminal';
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

const HERO_STYLES = `
.onb-bg {
  background:
    radial-gradient(ellipse 65% 50% at 15% 18%,
      color-mix(in srgb, var(--theme-accent-cabbage-default) 9%, transparent) 0%,
      transparent 65%),
    radial-gradient(ellipse 55% 45% at 88% 32%,
      color-mix(in srgb, var(--theme-accent-water-default) 8%, transparent) 0%,
      transparent 70%),
    var(--theme-background-default);
}
.onb-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(96px);
  mix-blend-mode: screen;
  pointer-events: none;
  animation: onb-breathe 18s ease-in-out infinite;
}
.onb-orb--delay { animation-delay: -6s; }
@keyframes onb-breathe {
  0%, 100% { opacity: 0.32; }
  50% { opacity: 0.5; }
}
@media (prefers-reduced-motion: reduce) {
  .onb-orb { animation: none; opacity: 0.4; }
}
.onb-form-halo {
  background: radial-gradient(
    ellipse 90% 65% at 50% 82%,
    rgba(8, 8, 12, 0.95) 0%,
    rgba(8, 8, 12, 0.78) 22%,
    rgba(8, 8, 12, 0.4) 52%,
    transparent 82%
  );
}
.onb-top-fade {
  background: linear-gradient(
    to bottom,
    rgba(8, 8, 12, 0.45) 0%,
    rgba(8, 8, 12, 0.1) 22%,
    transparent 38%
  );
}
.onb-headline { text-shadow: 0 2px 28px rgba(0, 0, 0, 0.7); }
.onb-card-shadow {
  box-shadow:
    0 32px 64px -16px rgba(0, 0, 0, 0.55),
    0 12px 28px -8px rgba(0, 0, 0, 0.42),
    0 0 0 1px rgba(255, 255, 255, 0.03);
}
.onb-card-shadow--soft {
  box-shadow:
    0 20px 40px -12px rgba(0, 0, 0, 0.42),
    0 6px 14px -6px rgba(0, 0, 0, 0.32);
}
.onb-tilt { transform-origin: center center; }
.onb-cover-pattern {
  background-image:
    radial-gradient(120% 90% at 0% 0%, rgba(255, 255, 255, 0.16) 0%, transparent 50%),
    radial-gradient(80% 70% at 100% 100%, rgba(0, 0, 0, 0.32) 0%, transparent 60%);
}
.onb-code-lines {
  background-image:
    linear-gradient(to right, rgba(120, 200, 255, 0.7) 22%, transparent 22%),
    linear-gradient(to right, rgba(255, 255, 255, 0.55) 50%, transparent 50%),
    linear-gradient(to right, rgba(255, 200, 120, 0.65) 40%, transparent 40%),
    linear-gradient(to right, rgba(255, 255, 255, 0.45) 60%, transparent 60%),
    linear-gradient(to right, rgba(180, 255, 180, 0.6) 32%, transparent 32%);
  background-size: 100% 14%;
  background-position: 0 12%, 0 32%, 0 52%, 0 72%, 0 92%;
  background-repeat: no-repeat;
}
.onb-pulse-dot {
  animation: onb-pulse-dot 2.4s ease-out infinite;
  transform-origin: center;
}
@keyframes onb-pulse-dot {
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
  100% { box-shadow: 0 0 0 12px rgba(255, 255, 255, 0); }
}
@media (prefers-reduced-motion: reduce) {
  .onb-pulse-dot { animation: none; }
}
`;

// =============================================================
// Shared building blocks
// =============================================================

const SourceAvatar = ({
  initials,
  accent,
  size = 'md',
}: {
  initials: string;
  accent: AccentKey;
  size?: 'sm' | 'md';
}): ReactElement => (
  <span
    className={classNames(
      'flex shrink-0 items-center justify-center rounded-8 font-bold leading-none text-white',
      ACCENT_BG[accent],
      size === 'sm' ? 'h-6 w-6 typo-caption2' : 'h-8 w-8 typo-callout',
    )}
  >
    {initials}
  </span>
);

const Avatar = ({
  initial,
  accent,
  size = 28,
}: {
  initial: string;
  accent: AccentKey;
  size?: number;
}): ReactElement => (
  <span
    className={classNames(
      'flex shrink-0 items-center justify-center rounded-full border-2 border-background-default font-bold leading-none text-white',
      ACCENT_BG[accent],
    )}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      fontSize: `${Math.round(size * 0.42)}px`,
    }}
  >
    {initial}
  </span>
);

// =============================================================
// Variant A — Cards: floating realistic feed cards
// =============================================================

type CardKind = 'article' | 'video' | 'code';

type FeedCardData = {
  id: string;
  kind: CardKind;
  source: string;
  sourceInitials: string;
  sourceAccent: AccentKey;
  badge?: string;
  title: string;
  tag: string;
  upvotes: string;
  comments: string;
  duration?: string;
  coverAccent: AccentKey;
  position: { left?: string; right?: string; top: string };
  rotate: number;
  scale?: number;
  opacity?: number;
  blur?: number;
};

const FEED_CARDS: FeedCardData[] = [
  {
    id: 'stripe',
    kind: 'article',
    source: 'Stripe Engineering',
    sourceInitials: 'St',
    sourceAccent: 'water',
    badge: 'Featured',
    title: 'How we cut JavaScript bundle size by 60% with islands',
    tag: 'Frontend',
    upvotes: '1.2k',
    comments: '184',
    coverAccent: 'water',
    position: { left: '6%', top: '14%' },
    rotate: -3.5,
  },
  {
    id: 'fireship',
    kind: 'video',
    source: 'Fireship',
    sourceInitials: 'F',
    sourceAccent: 'bacon',
    title: 'TypeScript 5.5 — 4 features you will actually use',
    tag: 'Video',
    upvotes: '3.4k',
    comments: '420',
    duration: '6:42',
    coverAccent: 'bacon',
    position: { right: '7%', top: '10%' },
    rotate: 4.5,
  },
  {
    id: 'snippet',
    kind: 'code',
    source: 'daily.dev',
    sourceInitials: 'd',
    sourceAccent: 'cabbage',
    title: 'A one-line trick to debounce async hooks',
    tag: 'Snippet',
    upvotes: '824',
    comments: '91',
    coverAccent: 'cabbage',
    position: { left: '14%', top: '54%' },
    rotate: -2,
    scale: 0.9,
    opacity: 0.85,
    blur: 0.4,
  },
];

const ArticleCover = ({
  accent,
  title,
}: {
  accent: AccentKey;
  title: string;
}): ReactElement => (
  <div
    className={classNames(
      'relative aspect-[16/9] overflow-hidden',
      ACCENT_BG[accent],
    )}
  >
    <div className="onb-cover-pattern absolute inset-0" />
    <div className="absolute inset-0 flex flex-col justify-end p-4">
      <span className="text-balance font-bold leading-tight text-white typo-subhead">
        {title.split(' ').slice(0, 4).join(' ')}…
      </span>
    </div>
    <div className="bg-white/15 absolute right-3 top-3 rounded-full px-2 py-0.5 text-white typo-caption2">
      <span className="font-semibold">Read</span>
    </div>
  </div>
);

const VideoCover = ({
  accent,
  duration,
}: {
  accent: AccentKey;
  duration?: string;
}): ReactElement => (
  <div
    className={classNames(
      'relative aspect-[16/9] overflow-hidden',
      ACCENT_BG[accent],
    )}
  >
    <div className="onb-cover-pattern absolute inset-0" />
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="bg-black/55 flex h-12 w-12 items-center justify-center rounded-full text-white backdrop-blur-sm">
        <PlayIcon size={IconSize.Small} secondary />
      </span>
    </div>
    {duration && (
      <span className="bg-black/75 absolute bottom-3 right-3 rounded-4 px-1.5 py-0.5 font-bold tabular-nums text-white typo-caption2">
        {duration}
      </span>
    )}
  </div>
);

const CodeCover = ({ accent }: { accent: AccentKey }): ReactElement => (
  <div className="relative aspect-[16/9] overflow-hidden bg-raw-pepper-90">
    <div
      className={classNames(
        'absolute -left-8 -top-8 h-32 w-32 rounded-full opacity-40 blur-3xl',
        ACCENT_BG[accent],
      )}
    />
    <div className="onb-code-lines opacity-75 absolute inset-4" />
    <span className="bg-white/8 border-white/10 absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-text-tertiary typo-caption2">
      <TerminalIcon size={IconSize.XXSmall} secondary />
      <span className="font-mono">snippet</span>
    </span>
  </div>
);

const FeedCard = ({ card }: { card: FeedCardData }): ReactElement => {
  const tilt = card.rotate;
  const scale = card.scale ?? 1;
  const opacity = card.opacity ?? 1;
  const blur = card.blur ?? 0;
  return (
    <article
      className="onb-card-shadow absolute w-72 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle tablet:w-80"
      style={{
        ...(card.position.left
          ? { left: card.position.left }
          : { right: card.position.right }),
        top: card.position.top,
        transform: `rotate(${tilt}deg) scale(${scale})`,
        opacity,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
      }}
    >
      <div className="flex items-center gap-2.5 px-3 pt-3">
        <SourceAvatar
          initials={card.sourceInitials}
          accent={card.sourceAccent}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-text-primary typo-footnote">
            {card.source}
          </div>
          <div className="text-text-quaternary typo-caption2">2h</div>
        </div>
        {card.badge && (
          <span className="bg-accent-cabbage-default/15 rounded-full px-2 py-0.5 font-semibold text-accent-cabbage-default typo-caption2">
            {card.badge}
          </span>
        )}
      </div>

      <div className="mt-3">
        {card.kind === 'article' && (
          <ArticleCover accent={card.coverAccent} title={card.title} />
        )}
        {card.kind === 'video' && (
          <VideoCover accent={card.coverAccent} duration={card.duration} />
        )}
        {card.kind === 'code' && <CodeCover accent={card.coverAccent} />}
      </div>

      <div className="flex flex-col gap-2 px-3 py-3">
        <h3 className="line-clamp-2 text-balance font-bold leading-snug text-text-primary typo-callout">
          {card.title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-surface-float px-2 py-0.5 font-medium text-text-tertiary typo-caption2">
            #{card.tag.toLowerCase()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 border-t border-border-subtlest-tertiary px-2 py-1.5">
        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-text-tertiary typo-caption1">
          <UpvoteIcon size={IconSize.XSmall} secondary />
          <span className="font-semibold tabular-nums">{card.upvotes}</span>
        </span>
        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-text-tertiary typo-caption1">
          <DiscussIcon size={IconSize.XSmall} secondary />
          <span className="font-semibold tabular-nums">{card.comments}</span>
        </span>
        <span className="inline-flex items-center rounded-full px-2 py-1 text-text-tertiary typo-caption1">
          <BookmarkIcon size={IconSize.XSmall} secondary />
        </span>
        <span className="ml-auto inline-flex items-center rounded-full px-2 py-1 text-text-tertiary typo-caption1">
          <ShareIcon size={IconSize.XSmall} secondary />
        </span>
      </div>
    </article>
  );
};

const CardsBackground = (): ReactElement => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 -z-1 select-none"
  >
    {FEED_CARDS.map((card) => (
      <FeedCard key={card.id} card={card} />
    ))}
  </div>
);

// =============================================================
// Variant B — Squads: real squad profile panels
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
  avatars: Array<{ initial: string; accent: AccentKey }>;
  position: { left?: string; right?: string; top: string };
  rotate: number;
  scale?: number;
  opacity?: number;
  blur?: number;
  highlighted?: boolean;
};

const SQUADS_DATA: SquadData[] = [
  {
    id: 'ai',
    name: 'AI & LLMs',
    handle: 'ai-engineers',
    accent: 'onion',
    description:
      'Where engineers ship with LLMs. Real prompts, real agents, real production.',
    members: '12.4k',
    posts: '8.2k',
    topRank: 'Top 1%',
    avatars: [
      { initial: 'D', accent: 'onion' },
      { initial: 'R', accent: 'cabbage' },
      { initial: 'T', accent: 'water' },
      { initial: 'L', accent: 'cheese' },
      { initial: 'P', accent: 'bacon' },
    ],
    position: { left: '50%', top: '15%' },
    rotate: 0,
    highlighted: true,
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
    avatars: [
      { initial: 'M', accent: 'water' },
      { initial: 'J', accent: 'cabbage' },
      { initial: 'S', accent: 'cheese' },
      { initial: 'A', accent: 'bacon' },
    ],
    position: { left: '5%', top: '22%' },
    rotate: -6,
    scale: 0.86,
    opacity: 0.85,
    blur: 0.3,
  },
  {
    id: 'devops',
    name: 'DevOps',
    handle: 'devops-cloud',
    accent: 'cheese',
    description:
      'Pipelines, Kubernetes wars, and the never-ending chase for fewer outages.',
    members: '18.6k',
    posts: '11.3k',
    topRank: 'Top 12',
    avatars: [
      { initial: 'C', accent: 'cheese' },
      { initial: 'B', accent: 'avocado' },
      { initial: 'F', accent: 'water' },
      { initial: 'N', accent: 'bacon' },
    ],
    position: { right: '5%', top: '22%' },
    rotate: 6,
    scale: 0.86,
    opacity: 0.85,
    blur: 0.3,
  },
];

const SquadCard = ({ squad }: { squad: SquadData }): ReactElement => {
  const baseTranslate = squad.position.left === '50%' ? '-50%, 0' : '0, 0';
  return (
    <article
      className={classNames(
        'absolute w-[20rem] overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle tablet:w-[22rem]',
        squad.highlighted ? 'onb-card-shadow' : 'onb-card-shadow--soft',
      )}
      style={{
        ...(squad.position.left
          ? { left: squad.position.left }
          : { right: squad.position.right }),
        top: squad.position.top,
        transform: `translate(${baseTranslate}) rotate(${
          squad.rotate
        }deg) scale(${squad.scale ?? 1})`,
        opacity: squad.opacity ?? 1,
        filter: squad.blur ? `blur(${squad.blur}px)` : undefined,
      }}
    >
      <div
        className={classNames(
          'onb-cover-pattern relative h-20',
          ACCENT_BG[squad.accent],
        )}
      >
        <div className="bg-black/30 absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-white backdrop-blur-sm typo-caption2">
          <StarIcon size={IconSize.XXSmall} secondary />
          <span className="font-semibold">{squad.topRank}</span>
        </div>
        <div className="absolute -bottom-7 left-4 flex h-14 w-14 items-center justify-center rounded-16 border-4 border-background-default bg-background-subtle">
          <span
            className={classNames(
              'flex h-full w-full items-center justify-center rounded-12 text-white',
              ACCENT_BG[squad.accent],
            )}
          >
            <SquadIcon size={IconSize.Medium} secondary />
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4 pt-9">
        <div>
          <h3 className="font-bold text-text-primary typo-title3">
            {squad.name}
          </h3>
          <p className="text-text-tertiary typo-caption2">@{squad.handle}</p>
        </div>
        <p className="line-clamp-2 text-text-secondary typo-footnote">
          {squad.description}
        </p>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-border-subtlest-tertiary px-2.5 py-1 text-text-secondary typo-caption2">
            <span className="font-bold text-text-primary">{squad.members}</span>
            members
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border-subtlest-tertiary px-2.5 py-1 text-text-secondary typo-caption2">
            <span className="font-bold text-text-primary">{squad.posts}</span>
            posts
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex -space-x-2">
            {squad.avatars.map((avatar, i) => (
              <Avatar
                // eslint-disable-next-line react/no-array-index-key
                key={`${squad.id}-${avatar.initial}-${i}`}
                initial={avatar.initial}
                accent={avatar.accent}
                size={28}
              />
            ))}
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background-default bg-surface-float font-semibold text-text-tertiary typo-caption2">
              +{Math.floor(parseInt(squad.members, 10) - 4)}k
            </span>
          </div>
          <button
            type="button"
            className={classNames(
              'shadow-sm inline-flex items-center gap-1 rounded-12 px-3 py-1.5 font-bold text-white typo-callout',
              ACCENT_BG[squad.accent],
            )}
            tabIndex={-1}
          >
            <PlusIcon size={IconSize.XSmall} secondary />
            Join
          </button>
        </div>
      </div>
    </article>
  );
};

const SquadsBackground = (): ReactElement => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 -z-1 select-none"
  >
    {SQUADS_DATA.map((squad) => (
      <SquadCard key={squad.id} squad={squad} />
    ))}
  </div>
);

// =============================================================
// Variant C — Stream: live community activity
// =============================================================

type ActivityItem = {
  id: string;
  kind: 'upvote' | 'comment' | 'share' | 'squad' | 'milestone' | 'trending';
  actor?: string;
  actorAccent?: AccentKey;
  actorInitial?: string;
  text: ReactNode;
  time: string;
  position: { left?: string; right?: string; top: string };
  rotate: number;
  scale?: number;
  fresh?: boolean;
};

const ACTIVITY_ITEMS: ActivityItem[] = [
  {
    id: 'a1',
    kind: 'upvote',
    actor: 'Maya R.',
    actorAccent: 'cabbage',
    actorInitial: 'M',
    text: (
      <>
        upvoted{' '}
        <span className="font-semibold text-text-primary">
          Why we rewrote Git internals in Rust
        </span>
      </>
    ),
    time: 'just now',
    position: { left: '7%', top: '12%' },
    rotate: -2,
    fresh: true,
  },
  {
    id: 'a2',
    kind: 'milestone',
    text: (
      <>
        <span className="font-semibold text-text-primary">Frontend Squad</span>{' '}
        just passed{' '}
        <span className="font-semibold text-accent-water-default">
          34,000 members
        </span>
      </>
    ),
    time: '42s',
    position: { right: '5%', top: '8%' },
    rotate: 3.5,
  },
  {
    id: 'a3',
    kind: 'comment',
    actor: 'Oren',
    actorAccent: 'water',
    actorInitial: 'O',
    text: (
      <>
        commented on{' '}
        <span className="font-semibold text-text-primary">
          Postgres or SQLite in 2026?
        </span>
      </>
    ),
    time: '1m',
    position: { left: '4%', top: '38%' },
    rotate: -3,
  },
  {
    id: 'a4',
    kind: 'trending',
    text: (
      <>
        <span className="font-semibold text-accent-onion-default">
          AI Agents
        </span>{' '}
        is trending — 1,284 new reads this hour
      </>
    ),
    time: '3m',
    position: { right: '8%', top: '34%' },
    rotate: 2,
  },
  {
    id: 'a5',
    kind: 'share',
    actor: 'Daria K.',
    actorAccent: 'onion',
    actorInitial: 'D',
    text: (
      <>
        shared a post in{' '}
        <span className="font-semibold text-text-primary">DevOps Squad</span>
      </>
    ),
    time: '5m',
    position: { left: '10%', top: '62%' },
    rotate: -1.5,
    scale: 0.92,
  },
  {
    id: 'a6',
    kind: 'squad',
    actor: 'Theo B.',
    actorAccent: 'cheese',
    actorInitial: 'T',
    text: (
      <>
        joined{' '}
        <span className="font-semibold text-text-primary">
          Indie Hackers Squad
        </span>
      </>
    ),
    time: '8m',
    position: { right: '6%', top: '60%' },
    rotate: 2.5,
    scale: 0.92,
  },
];

const ACTIVITY_ICON: Record<
  ActivityItem['kind'],
  { icon: ReactElement; tint: AccentKey }
> = {
  upvote: {
    icon: <UpvoteIcon size={IconSize.XSmall} secondary />,
    tint: 'cabbage',
  },
  comment: {
    icon: <DiscussIcon size={IconSize.XSmall} secondary />,
    tint: 'water',
  },
  share: {
    icon: <ShareIcon size={IconSize.XSmall} secondary />,
    tint: 'onion',
  },
  squad: {
    icon: <SquadIcon size={IconSize.XSmall} secondary />,
    tint: 'cheese',
  },
  milestone: {
    icon: <StarIcon size={IconSize.XSmall} secondary />,
    tint: 'cheese',
  },
  trending: {
    icon: <UpvoteIcon size={IconSize.XSmall} secondary />,
    tint: 'onion',
  },
};

const ActivityCard = ({ item }: { item: ActivityItem }): ReactElement => {
  const meta = ACTIVITY_ICON[item.kind];
  return (
    <article
      className="onb-card-shadow--soft absolute flex w-72 items-start gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-3"
      style={{
        ...(item.position.left
          ? { left: item.position.left }
          : { right: item.position.right }),
        top: item.position.top,
        transform: `rotate(${item.rotate}deg) scale(${item.scale ?? 1})`,
      }}
    >
      <div className="relative">
        {item.actor && item.actorAccent && item.actorInitial ? (
          <Avatar
            initial={item.actorInitial}
            accent={item.actorAccent}
            size={36}
          />
        ) : (
          <span
            className={classNames(
              'flex h-9 w-9 items-center justify-center rounded-full text-white',
              ACCENT_BG[meta.tint],
            )}
          >
            {meta.icon}
          </span>
        )}
        {item.actor && (
          <span
            className={classNames(
              'absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background-subtle text-white',
              ACCENT_BG[meta.tint],
            )}
          >
            {meta.icon}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 leading-snug text-text-secondary typo-footnote">
          {item.actor && (
            <span className="font-semibold text-text-primary">
              {item.actor}{' '}
            </span>
          )}
          {item.text}
        </p>
        <div className="mt-1 flex items-center gap-2 text-text-quaternary typo-caption2">
          {item.fresh && (
            <span className="onb-pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-accent-cabbage-default" />
          )}
          <span>{item.time}</span>
        </div>
      </div>
    </article>
  );
};

const StreamBackground = (): ReactElement => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 -z-1 select-none"
  >
    {ACTIVITY_ITEMS.map((item) => (
      <ActivityCard key={item.id} item={item} />
    ))}
  </div>
);

// =============================================================
// Variant registry & switcher
// =============================================================

type VariantId = 'cards' | 'squads' | 'stream';

type VariantDef = {
  id: VariantId;
  label: string;
  render: () => ReactElement;
};

const VARIANTS: VariantDef[] = [
  { id: 'cards', label: 'Cards', render: () => <CardsBackground /> },
  { id: 'squads', label: 'Squads', render: () => <SquadsBackground /> },
  { id: 'stream', label: 'Stream', render: () => <StreamBackground /> },
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
        <span
          className="onb-orb bg-accent-onion-default"
          style={{
            width: '26rem',
            height: '26rem',
            top: '36%',
            left: '38%',
            opacity: 0.22,
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
        className="onb-form-halo pointer-events-none absolute inset-0 -z-1"
      />

      <VariantSwitcher value={variantId} onChange={setVariantId} />

      <main className="relative z-1 flex w-full flex-1 flex-col items-center justify-end px-5 pb-[12vh] pt-10 tablet:pb-[14vh] tablet:pt-14">
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
