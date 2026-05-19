import type { ReactElement, ReactNode } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import Logo, { LogoPosition } from '../../../components/Logo';
import { IconSize } from '../../../components/Icon';
import { UpvoteIcon } from '../../../components/icons/Upvote';
import { DiscussIcon } from '../../../components/icons/Discuss';
import { TrendingIcon } from '../../../components/icons/Trending';
import { PlayIcon } from '../../../components/icons/Play';
import { SquadIcon } from '../../../components/icons/Squad';
import { TerminalIcon } from '../../../components/icons/Terminal';
import { StarIcon } from '../../../components/icons/Star';
import {
  ThemeMode,
  useSettingsContext,
} from '../../../contexts/SettingsContext';

type AccentKey = 'cabbage' | 'cheese' | 'water' | 'onion' | 'avocado' | 'bacon';

type CardType = 'article' | 'video' | 'discussion' | 'code' | 'text';

type Badge = 'trending' | 'top' | null;

type FeedCard = {
  type: CardType;
  source: string;
  sourceInitial: string;
  sourceAccent: AccentKey;
  title: string;
  heroAccent: AccentKey;
  upvotes: string;
  comments: string;
  author: string;
  authorInitial: string;
  time: string;
  badge?: Badge;
  duration?: string;
};

const ACCENT_FROM: Record<AccentKey, string> = {
  cabbage: 'from-accent-cabbage-default',
  cheese: 'from-accent-cheese-default',
  water: 'from-accent-water-default',
  onion: 'from-accent-onion-default',
  avocado: 'from-accent-avocado-default',
  bacon: 'from-accent-bacon-default',
};

const ACCENT_VIA: Record<AccentKey, string> = {
  cabbage: 'via-accent-onion-default',
  cheese: 'via-accent-bacon-default',
  water: 'via-accent-cabbage-default',
  onion: 'via-accent-water-default',
  avocado: 'via-accent-water-default',
  bacon: 'via-accent-cheese-default',
};

const ACCENT_TO: Record<AccentKey, string> = {
  cabbage: 'to-accent-water-default',
  cheese: 'to-accent-avocado-default',
  water: 'to-accent-avocado-default',
  onion: 'to-accent-cabbage-default',
  avocado: 'to-accent-cheese-default',
  bacon: 'to-accent-onion-default',
};

const ACCENT_BG: Record<AccentKey, string> = {
  cabbage: 'bg-accent-cabbage-default',
  cheese: 'bg-accent-cheese-default',
  water: 'bg-accent-water-default',
  onion: 'bg-accent-onion-default',
  avocado: 'bg-accent-avocado-default',
  bacon: 'bg-accent-bacon-default',
};

const ACCENT_TEXT: Record<AccentKey, string> = {
  cabbage: 'text-accent-cabbage-default',
  cheese: 'text-accent-cheese-default',
  water: 'text-accent-water-default',
  onion: 'text-accent-onion-default',
  avocado: 'text-accent-avocado-default',
  bacon: 'text-accent-bacon-default',
};

const CARDS: FeedCard[] = [
  {
    type: 'article',
    source: 'GitHub Blog',
    sourceInitial: 'GH',
    sourceAccent: 'cabbage',
    title: 'Why we rewrote Git internals in Rust',
    heroAccent: 'cabbage',
    upvotes: '1.2k',
    comments: '184',
    author: 'Maya R.',
    authorInitial: 'M',
    time: '2h',
    badge: 'trending',
  },
  {
    type: 'video',
    source: 'Fireship',
    sourceInitial: 'F',
    sourceAccent: 'bacon',
    title: 'TypeScript 5.5: 4 features you will actually use',
    heroAccent: 'bacon',
    upvotes: '3.4k',
    comments: '420',
    author: 'Jeff D.',
    authorInitial: 'J',
    time: '1d',
    duration: '6:42',
  },
  {
    type: 'discussion',
    source: 'Frontend Squad',
    sourceInitial: 'FS',
    sourceAccent: 'water',
    title: 'What CSS features actually changed how you ship components?',
    heroAccent: 'onion',
    upvotes: '512',
    comments: '198',
    author: 'Daria K.',
    authorInitial: 'D',
    time: '3h',
  },
  {
    type: 'article',
    source: 'Vercel',
    sourceInitial: 'V',
    sourceAccent: 'water',
    title: 'Edge functions, benchmarked: 14ms vs 280ms',
    heroAccent: 'water',
    upvotes: '987',
    comments: '47',
    author: 'Lee J.',
    authorInitial: 'L',
    time: '4h',
  },
  {
    type: 'code',
    source: 'daily.dev',
    sourceInitial: 'd',
    sourceAccent: 'cabbage',
    title: 'A one-line trick to debounce async hooks',
    heroAccent: 'avocado',
    upvotes: '824',
    comments: '91',
    author: 'Idan G.',
    authorInitial: 'I',
    time: '8h',
  },
  {
    type: 'article',
    source: 'Pragmatic Engineer',
    sourceInitial: 'PE',
    sourceAccent: 'cheese',
    title: 'The case against microservices in 2026',
    heroAccent: 'cheese',
    upvotes: '2.4k',
    comments: '256',
    author: 'Gergely O.',
    authorInitial: 'G',
    time: '6h',
    badge: 'top',
  },
  {
    type: 'video',
    source: 'ThePrimeagen',
    sourceInitial: 'P',
    sourceAccent: 'avocado',
    title: 'Vim motions cheat sheet you will actually remember',
    heroAccent: 'avocado',
    upvotes: '1.8k',
    comments: '312',
    author: 'Michael P.',
    authorInitial: 'M',
    time: '1d',
    duration: '12:18',
  },
  {
    type: 'article',
    source: 'Stripe Engineering',
    sourceInitial: 'St',
    sourceAccent: 'onion',
    title: 'How we cut JS bundle size by 60% with islands',
    heroAccent: 'onion',
    upvotes: '714',
    comments: '128',
    author: 'Hana W.',
    authorInitial: 'H',
    time: '5h',
  },
  {
    type: 'text',
    source: 'The Overflow',
    sourceInitial: 'O',
    sourceAccent: 'cabbage',
    title: '"If you can read a stack trace, you can fix anything."',
    heroAccent: 'cabbage',
    upvotes: '2.1k',
    comments: '88',
    author: 'Anya S.',
    authorInitial: 'A',
    time: '7h',
  },
  {
    type: 'article',
    source: 'Cloudflare',
    sourceInitial: 'Cf',
    sourceAccent: 'bacon',
    title: 'Building a real-time engine on Workers',
    heroAccent: 'bacon',
    upvotes: '1.4k',
    comments: '203',
    author: 'Owen T.',
    authorInitial: 'O',
    time: '10h',
  },
  {
    type: 'discussion',
    source: 'Backend Squad',
    sourceInitial: 'BS',
    sourceAccent: 'avocado',
    title: 'Postgres or SQLite for your side project in 2026?',
    heroAccent: 'avocado',
    upvotes: '987',
    comments: '342',
    author: 'Rina M.',
    authorInitial: 'R',
    time: '4h',
    badge: 'trending',
  },
  {
    type: 'article',
    source: 'Linear',
    sourceInitial: 'L',
    sourceAccent: 'water',
    title: 'Designing APIs developers actually like using',
    heroAccent: 'water',
    upvotes: '1.1k',
    comments: '76',
    author: 'Karri S.',
    authorInitial: 'K',
    time: '9h',
  },
  {
    type: 'code',
    source: 'daily.dev',
    sourceInitial: 'd',
    sourceAccent: 'cabbage',
    title: 'Type-safe env vars in 8 lines with Zod',
    heroAccent: 'water',
    upvotes: '654',
    comments: '52',
    author: 'Sasha L.',
    authorInitial: 'S',
    time: '11h',
  },
  {
    type: 'article',
    source: 'PlanetScale',
    sourceInitial: 'PS',
    sourceAccent: 'avocado',
    title: 'Branching production databases without losing sleep',
    heroAccent: 'avocado',
    upvotes: '923',
    comments: '141',
    author: 'Aman R.',
    authorInitial: 'A',
    time: '12h',
  },
  {
    type: 'video',
    source: 'Theo - t3.gg',
    sourceInitial: 'T',
    sourceAccent: 'cheese',
    title: 'I tried 7 React form libraries so you do not have to',
    heroAccent: 'cheese',
    upvotes: '2.7k',
    comments: '589',
    author: 'Theo B.',
    authorInitial: 'T',
    time: '2d',
    duration: '18:04',
  },
  {
    type: 'article',
    source: 'Notion',
    sourceInitial: 'N',
    sourceAccent: 'cheese',
    title: "Notion's data model in five minutes",
    heroAccent: 'cheese',
    upvotes: '1.6k',
    comments: '212',
    author: 'Ivan Z.',
    authorInitial: 'I',
    time: '1d',
  },
  {
    type: 'discussion',
    source: 'AI Squad',
    sourceInitial: 'AI',
    sourceAccent: 'onion',
    title: 'What is the most useful LLM workflow you ship daily?',
    heroAccent: 'cabbage',
    upvotes: '1.9k',
    comments: '687',
    author: 'Priya N.',
    authorInitial: 'P',
    time: '5h',
    badge: 'trending',
  },
  {
    type: 'article',
    source: 'GitHub Blog',
    sourceInitial: 'GH',
    sourceAccent: 'cabbage',
    title: 'Anatomy of a memory leak (and how we caught it)',
    heroAccent: 'onion',
    upvotes: '1.3k',
    comments: '174',
    author: 'Eric S.',
    authorInitial: 'E',
    time: '14h',
  },
  {
    type: 'text',
    source: 'daily.dev',
    sourceInitial: 'd',
    sourceAccent: 'cabbage',
    title: 'Ship small. Ship often. Ship anyway.',
    heroAccent: 'bacon',
    upvotes: '4.2k',
    comments: '94',
    author: 'Nimrod K.',
    authorInitial: 'N',
    time: '1d',
  },
  {
    type: 'article',
    source: 'Cloudflare',
    sourceInitial: 'Cf',
    sourceAccent: 'bacon',
    title: 'Why your tests are slow and how we fixed ours',
    heroAccent: 'cabbage',
    upvotes: '1.1k',
    comments: '203',
    author: 'Joao P.',
    authorInitial: 'J',
    time: '2d',
  },
  {
    type: 'code',
    source: 'daily.dev',
    sourceInitial: 'd',
    sourceAccent: 'cabbage',
    title: 'A regex that finally validates emails correctly',
    heroAccent: 'cheese',
    upvotes: '512',
    comments: '267',
    author: 'Lila V.',
    authorInitial: 'L',
    time: '16h',
  },
  {
    type: 'discussion',
    source: 'DevOps Squad',
    sourceInitial: 'DO',
    sourceAccent: 'cheese',
    title: 'Kubernetes for a 3-person startup: yes or no?',
    heroAccent: 'avocado',
    upvotes: '743',
    comments: '402',
    author: 'Tomas H.',
    authorInitial: 'T',
    time: '6h',
  },
  {
    type: 'video',
    source: 'Web Dev Simplified',
    sourceInitial: 'W',
    sourceAccent: 'water',
    title: 'Async patterns I wish I knew before my first job',
    heroAccent: 'water',
    upvotes: '1.5k',
    comments: '189',
    author: 'Kyle C.',
    authorInitial: 'K',
    time: '3d',
    duration: '14:21',
  },
  {
    type: 'article',
    source: 'Linear',
    sourceInitial: 'L',
    sourceAccent: 'water',
    title: 'Git internals: how rebase actually works',
    heroAccent: 'cabbage',
    upvotes: '1.8k',
    comments: '156',
    author: 'Aria T.',
    authorInitial: 'A',
    time: '2d',
  },
];

const COLUMNS: Array<{ slice: [number, number]; duration: string }> = [
  { slice: [0, 6], duration: '120s' },
  { slice: [6, 12], duration: '155s' },
  { slice: [12, 18], duration: '135s' },
  { slice: [18, 24], duration: '170s' },
];

const HERO_STYLES = `
.onb-bg {
  background:
    radial-gradient(ellipse 60% 50% at 0% 0%,
      color-mix(in srgb, var(--theme-accent-cabbage-default) 16%, transparent) 0%,
      transparent 60%),
    radial-gradient(ellipse 50% 50% at 100% 100%,
      color-mix(in srgb, var(--theme-accent-water-default) 12%, transparent) 0%,
      transparent 60%),
    var(--theme-background-default);
}
.onb-col {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  animation: onb-scroll var(--onb-dur, 120s) linear infinite;
  will-change: transform;
}
.onb-col--reverse {
  animation-direction: reverse;
}
@keyframes onb-scroll {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(0, -50%, 0); }
}
@media (prefers-reduced-motion: reduce) {
  .onb-col {
    animation: none;
  }
}
.onb-mobile-overlay {
  background:
    linear-gradient(
      to bottom,
      rgba(10, 10, 14, 0.35) 0%,
      rgba(10, 10, 14, 0.35) 30%,
      transparent 55%
    ),
    radial-gradient(
      ellipse 140% 58% at 50% 108%,
      rgba(0, 0, 0, 0.98) 0%,
      rgba(0, 0, 0, 0.92) 22%,
      rgba(0, 0, 0, 0.65) 50%,
      transparent 85%
    );
}
.onb-desktop-overlay {
  background:
    linear-gradient(
      to right,
      transparent 0%,
      rgba(0, 0, 0, 0.25) 35%,
      rgba(0, 0, 0, 0.82) 68%,
      rgba(0, 0, 0, 0.95) 100%
    ),
    radial-gradient(
      ellipse 45% 70% at 85% 55%,
      rgba(0, 0, 0, 0.55) 0%,
      transparent 70%
    );
}
.onb-headline {
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.6);
}
.onb-cover-mesh {
  background-image:
    radial-gradient(120% 90% at 0% 0%, rgba(255, 255, 255, 0.18) 0%, transparent 50%),
    radial-gradient(80% 70% at 100% 100%, rgba(0, 0, 0, 0.28) 0%, transparent 60%);
}
.onb-code-pattern {
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.85) 30%, transparent 30%),
    linear-gradient(to right, rgba(255,255,255,0.55) 60%, transparent 60%),
    linear-gradient(to right, rgba(255,255,255,0.7) 45%, transparent 45%),
    linear-gradient(to right, rgba(255,255,255,0.4) 70%, transparent 70%),
    linear-gradient(to right, rgba(255,255,255,0.6) 35%, transparent 35%);
  background-size: 100% 8%, 100% 8%, 100% 8%, 100% 8%, 100% 8%;
  background-position:
    0 12%, 0 28%, 0 44%, 0 60%, 0 76%;
  background-repeat: no-repeat;
}
`;

const SourceRow = ({ card }: { card: FeedCard }): ReactElement => (
  <div className="flex items-center gap-1.5 text-text-tertiary typo-caption2">
    <span
      className={classNames(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded-4 text-[8px] font-bold leading-none text-white',
        ACCENT_BG[card.sourceAccent],
      )}
    >
      {card.sourceInitial}
    </span>
    <span className="min-w-0 truncate">{card.source}</span>
    <span aria-hidden className="text-text-quaternary">
      ·
    </span>
    <span aria-hidden className="shrink-0">
      {card.time}
    </span>
  </div>
);

const EngagementRow = ({ card }: { card: FeedCard }): ReactElement => (
  <div className="flex items-center gap-3 text-text-tertiary typo-caption2">
    <span className="inline-flex items-center gap-1">
      <UpvoteIcon size={IconSize.XXSmall} secondary />
      <span className="tabular-nums">{card.upvotes}</span>
    </span>
    <span className="inline-flex items-center gap-1">
      <DiscussIcon size={IconSize.XXSmall} secondary />
      <span className="tabular-nums">{card.comments}</span>
    </span>
    {card.badge === 'trending' && (
      <span className="ml-auto inline-flex items-center gap-1 text-accent-cabbage-default">
        <TrendingIcon size={IconSize.XXSmall} secondary />
        <span className="typo-caption2">Trending</span>
      </span>
    )}
    {card.badge === 'top' && (
      <span className="ml-auto inline-flex items-center gap-1 text-accent-cheese-default">
        <StarIcon size={IconSize.XXSmall} secondary />
        <span className="typo-caption2">Top</span>
      </span>
    )}
  </div>
);

const CardCover = ({ card }: { card: FeedCard }): ReactElement | null => {
  if (card.type === 'video') {
    return (
      <div
        className={classNames(
          'relative aspect-[16/10] bg-gradient-to-br',
          ACCENT_FROM[card.heroAccent],
          ACCENT_VIA[card.heroAccent],
          ACCENT_TO[card.heroAccent],
        )}
      >
        <div className="onb-cover-mesh absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-black/55 flex h-9 w-9 items-center justify-center rounded-full text-white backdrop-blur-sm">
            <PlayIcon size={IconSize.XSmall} secondary />
          </span>
        </div>
        {card.duration && (
          <span className="bg-black/70 absolute bottom-2 right-2 rounded-4 px-1.5 py-0.5 font-bold tabular-nums text-white typo-caption2">
            {card.duration}
          </span>
        )}
      </div>
    );
  }
  if (card.type === 'code') {
    return (
      <div className="relative aspect-[16/10] bg-raw-pepper-90">
        <div className="onb-code-pattern absolute inset-3 opacity-50" />
        <span className="absolute right-2 top-2 inline-flex items-center gap-1 text-text-tertiary typo-caption2">
          <TerminalIcon size={IconSize.XXSmall} secondary />
          <span>snippet</span>
        </span>
      </div>
    );
  }
  if (card.type === 'discussion') {
    return null;
  }
  if (card.type === 'text') {
    return (
      <div
        className={classNames(
          'relative aspect-[16/10] bg-gradient-to-br',
          ACCENT_FROM[card.heroAccent],
          ACCENT_VIA[card.heroAccent],
          ACCENT_TO[card.heroAccent],
        )}
      >
        <div className="onb-cover-mesh absolute inset-0" />
        <p className="absolute inset-0 flex items-center justify-center text-balance p-4 text-center font-bold leading-tight text-white typo-callout">
          {card.title}
        </p>
      </div>
    );
  }
  return (
    <div
      className={classNames(
        'relative aspect-[16/10] bg-gradient-to-br',
        ACCENT_FROM[card.heroAccent],
        ACCENT_VIA[card.heroAccent],
        ACCENT_TO[card.heroAccent],
      )}
    >
      <div className="onb-cover-mesh absolute inset-0" />
    </div>
  );
};

const FeedCardTile = ({ card }: { card: FeedCard }): ReactElement => {
  const isDiscussion = card.type === 'discussion';
  return (
    <article className="overflow-hidden rounded-12 border border-white/[0.07] bg-white/[0.045] shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
      <CardCover card={card} />
      <div className="flex flex-col gap-2 p-3">
        <SourceRow card={card} />
        {card.type !== 'text' && (
          <h3
            className={classNames(
              'font-bold leading-snug text-text-primary',
              isDiscussion ? 'typo-callout' : 'typo-footnote',
            )}
          >
            {isDiscussion && (
              <span
                className={classNames(
                  'mr-1.5 inline-flex items-center gap-1 align-middle',
                  ACCENT_TEXT[card.sourceAccent],
                )}
              >
                <SquadIcon size={IconSize.XXSmall} secondary />
              </span>
            )}
            {card.title}
          </h3>
        )}
        <EngagementRow card={card} />
      </div>
    </article>
  );
};

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

  useEffect(() => {
    applyThemeMode(ThemeMode.Dark);
    return () => {
      applyThemeMode();
    };
  }, [applyThemeMode]);

  return (
    <div className="onb-bg relative isolate flex min-h-dvh w-full overflow-hidden bg-raw-pepper-90 text-text-primary">
      <style dangerouslySetInnerHTML={{ __html: HERO_STYLES }} />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-1 select-none"
      >
        <div className="grid h-full w-full grid-cols-2 gap-3 px-3 tablet:grid-cols-3 tablet:gap-4 tablet:px-5 laptop:grid-cols-4 laptop:px-6">
          {COLUMNS.map(({ slice, duration }, idx) => {
            const cards = CARDS.slice(slice[0], slice[1]);
            const doubled = [...cards, ...cards];
            const hideOnMobile = idx >= 2;
            const hideOnTablet = idx === 3;
            return (
              <div
                key={`col-${slice[0]}`}
                className={classNames(
                  'onb-col -mt-12',
                  idx % 2 === 1 && 'onb-col--reverse',
                  hideOnMobile && 'hidden tablet:flex',
                  hideOnTablet && 'tablet:hidden laptop:flex',
                )}
                style={{ ['--onb-dur' as string]: duration }}
              >
                {doubled.map((card, j) => (
                  <FeedCardTile
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${slice[0]}-${card.title}-${j}`}
                    card={card}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div
        aria-hidden
        className="onb-mobile-overlay pointer-events-none absolute inset-0 -z-1 tablet:hidden"
      />
      <div
        aria-hidden
        className="onb-desktop-overlay pointer-events-none absolute inset-0 -z-1 hidden tablet:block"
      />

      <main className="relative z-1 flex w-full flex-1 flex-col items-center justify-end px-5 pb-10 pt-8 tablet:items-end tablet:justify-center tablet:px-10 tablet:pb-10 laptop:pr-[8vw]">
        <div className="flex w-full max-w-[26rem] flex-col gap-6 tablet:gap-7">
          <Logo
            position={LogoPosition.Relative}
            className="!left-0 !top-0 !mt-0 !translate-x-0"
            logoClassName={{ container: 'h-7' }}
          />

          {!isFormExpanded && headline && (
            <h1 className="onb-headline text-balance font-bold leading-[1.05] tracking-tight text-text-primary typo-title2 tablet:typo-mega3">
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
