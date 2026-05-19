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

type CardType = 'article' | 'video' | 'discussion' | 'code' | 'hero';

type Badge = 'trending' | 'top' | null;

type FeedCard = {
  type: CardType;
  source: string;
  sourceInitial: string;
  sourceAccent: AccentKey;
  title: string;
  upvotes: string;
  comments: string;
  time: string;
  badge?: Badge;
  duration?: string;
};

const ACCENT_BG: Record<AccentKey, string> = {
  cabbage: 'bg-accent-cabbage-default',
  cheese: 'bg-accent-cheese-default',
  water: 'bg-accent-water-default',
  onion: 'bg-accent-onion-default',
  avocado: 'bg-accent-avocado-default',
  bacon: 'bg-accent-bacon-default',
};

const ACCENT_FROM: Record<AccentKey, string> = {
  cabbage: 'from-accent-cabbage-default',
  cheese: 'from-accent-cheese-default',
  water: 'from-accent-water-default',
  onion: 'from-accent-onion-default',
  avocado: 'from-accent-avocado-default',
  bacon: 'from-accent-bacon-default',
};

const ACCENT_TO: Record<AccentKey, string> = {
  cabbage: 'to-accent-water-default',
  cheese: 'to-accent-avocado-default',
  water: 'to-accent-avocado-default',
  onion: 'to-accent-cabbage-default',
  avocado: 'to-accent-cheese-default',
  bacon: 'to-accent-onion-default',
};

const CARDS: FeedCard[] = [
  {
    type: 'article',
    source: 'GitHub Blog',
    sourceInitial: 'GH',
    sourceAccent: 'cabbage',
    title: 'Why we rewrote Git internals in Rust',
    upvotes: '1.2k',
    comments: '184',
    time: '2h',
    badge: 'trending',
  },
  {
    type: 'video',
    source: 'Fireship',
    sourceInitial: 'F',
    sourceAccent: 'bacon',
    title: 'TypeScript 5.5: 4 features you will actually use',
    upvotes: '3.4k',
    comments: '420',
    time: '1d',
    duration: '6:42',
  },
  {
    type: 'discussion',
    source: 'Frontend Squad',
    sourceInitial: 'FS',
    sourceAccent: 'water',
    title: 'What CSS features changed how you ship components?',
    upvotes: '512',
    comments: '198',
    time: '3h',
  },
  {
    type: 'hero',
    source: 'Vercel',
    sourceInitial: 'V',
    sourceAccent: 'water',
    title: 'Edge functions, benchmarked: 14ms vs 280ms',
    upvotes: '987',
    comments: '47',
    time: '4h',
  },
  {
    type: 'code',
    source: 'daily.dev',
    sourceInitial: 'd',
    sourceAccent: 'cabbage',
    title: 'A one-line trick to debounce async hooks',
    upvotes: '824',
    comments: '91',
    time: '8h',
  },
  {
    type: 'article',
    source: 'Pragmatic Engineer',
    sourceInitial: 'PE',
    sourceAccent: 'cheese',
    title: 'The case against microservices in 2026',
    upvotes: '2.4k',
    comments: '256',
    time: '6h',
    badge: 'top',
  },
  {
    type: 'video',
    source: 'ThePrimeagen',
    sourceInitial: 'P',
    sourceAccent: 'avocado',
    title: 'Vim motions cheat sheet you will actually remember',
    upvotes: '1.8k',
    comments: '312',
    time: '1d',
    duration: '12:18',
  },
  {
    type: 'article',
    source: 'Stripe Engineering',
    sourceInitial: 'St',
    sourceAccent: 'onion',
    title: 'How we cut JS bundle size by 60% with islands',
    upvotes: '714',
    comments: '128',
    time: '5h',
  },
  {
    type: 'hero',
    source: 'daily.dev',
    sourceInitial: 'd',
    sourceAccent: 'cabbage',
    title: 'Ship small. Ship often. Ship anyway.',
    upvotes: '4.2k',
    comments: '94',
    time: '1d',
    badge: 'trending',
  },
  {
    type: 'article',
    source: 'Cloudflare',
    sourceInitial: 'Cf',
    sourceAccent: 'bacon',
    title: 'Building a real-time engine on Workers',
    upvotes: '1.4k',
    comments: '203',
    time: '10h',
  },
  {
    type: 'discussion',
    source: 'Backend Squad',
    sourceInitial: 'BS',
    sourceAccent: 'avocado',
    title: 'Postgres or SQLite for your side project in 2026?',
    upvotes: '987',
    comments: '342',
    time: '4h',
    badge: 'trending',
  },
  {
    type: 'article',
    source: 'Linear',
    sourceInitial: 'L',
    sourceAccent: 'water',
    title: 'Designing APIs developers actually like using',
    upvotes: '1.1k',
    comments: '76',
    time: '9h',
  },
  {
    type: 'code',
    source: 'daily.dev',
    sourceInitial: 'd',
    sourceAccent: 'cabbage',
    title: 'Type-safe env vars in 8 lines with Zod',
    upvotes: '654',
    comments: '52',
    time: '11h',
  },
  {
    type: 'article',
    source: 'PlanetScale',
    sourceInitial: 'PS',
    sourceAccent: 'avocado',
    title: 'Branching production databases without losing sleep',
    upvotes: '923',
    comments: '141',
    time: '12h',
  },
  {
    type: 'video',
    source: 'Theo - t3.gg',
    sourceInitial: 'T',
    sourceAccent: 'cheese',
    title: 'I tried 7 React form libraries so you do not have to',
    upvotes: '2.7k',
    comments: '589',
    time: '2d',
    duration: '18:04',
  },
  {
    type: 'article',
    source: 'Notion',
    sourceInitial: 'N',
    sourceAccent: 'cheese',
    title: "Notion's data model, explained in five minutes",
    upvotes: '1.6k',
    comments: '212',
    time: '1d',
  },
  {
    type: 'discussion',
    source: 'AI Squad',
    sourceInitial: 'AI',
    sourceAccent: 'onion',
    title: 'What is the most useful LLM workflow you ship daily?',
    upvotes: '1.9k',
    comments: '687',
    time: '5h',
    badge: 'trending',
  },
  {
    type: 'article',
    source: 'GitHub Blog',
    sourceInitial: 'GH',
    sourceAccent: 'cabbage',
    title: 'Anatomy of a memory leak (and how we caught it)',
    upvotes: '1.3k',
    comments: '174',
    time: '14h',
  },
  {
    type: 'hero',
    source: 'The Overflow',
    sourceInitial: 'O',
    sourceAccent: 'bacon',
    title: '"If you can read a stack trace, you can fix anything."',
    upvotes: '2.1k',
    comments: '88',
    time: '7h',
  },
  {
    type: 'article',
    source: 'Cloudflare',
    sourceInitial: 'Cf',
    sourceAccent: 'bacon',
    title: 'Why your tests are slow and how we fixed ours',
    upvotes: '1.1k',
    comments: '203',
    time: '2d',
  },
  {
    type: 'code',
    source: 'daily.dev',
    sourceInitial: 'd',
    sourceAccent: 'cabbage',
    title: 'A regex that finally validates emails correctly',
    upvotes: '512',
    comments: '267',
    time: '16h',
  },
  {
    type: 'discussion',
    source: 'DevOps Squad',
    sourceInitial: 'DO',
    sourceAccent: 'cheese',
    title: 'Kubernetes for a 3-person startup: yes or no?',
    upvotes: '743',
    comments: '402',
    time: '6h',
  },
  {
    type: 'video',
    source: 'Web Dev Simplified',
    sourceInitial: 'W',
    sourceAccent: 'water',
    title: 'Async patterns I wish I knew before my first job',
    upvotes: '1.5k',
    comments: '189',
    time: '3d',
    duration: '14:21',
  },
  {
    type: 'article',
    source: 'Linear',
    sourceInitial: 'L',
    sourceAccent: 'water',
    title: 'Git internals: how rebase actually works',
    upvotes: '1.8k',
    comments: '156',
    time: '2d',
  },
];

const COLUMNS: Array<{ slice: [number, number]; duration: string }> = [
  { slice: [0, 6], duration: '140s' },
  { slice: [6, 12], duration: '175s' },
  { slice: [12, 18], duration: '155s' },
  { slice: [18, 24], duration: '195s' },
];

const HERO_STYLES = `
.onb-bg {
  background:
    radial-gradient(ellipse 60% 50% at 0% 0%,
      color-mix(in srgb, var(--theme-accent-cabbage-default) 14%, transparent) 0%,
      transparent 60%),
    radial-gradient(ellipse 50% 50% at 100% 100%,
      color-mix(in srgb, var(--theme-accent-water-default) 12%, transparent) 0%,
      transparent 60%),
    var(--theme-background-default);
}
.onb-col {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  animation: onb-scroll var(--onb-dur, 150s) linear infinite;
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
.onb-form-halo {
  background:
    linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.45) 0%,
      rgba(0, 0, 0, 0.18) 12%,
      transparent 28%
    ),
    radial-gradient(
      ellipse 95% 60% at 50% 78%,
      rgba(0, 0, 0, 0.97) 0%,
      rgba(0, 0, 0, 0.9) 22%,
      rgba(0, 0, 0, 0.6) 50%,
      transparent 82%
    );
}
@media (min-width: 656px) {
  .onb-form-halo {
    background:
      linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.4) 0%,
        rgba(0, 0, 0, 0.12) 10%,
        transparent 22%
      ),
      radial-gradient(
        ellipse 75% 55% at 50% 76%,
        rgba(0, 0, 0, 0.96) 0%,
        rgba(0, 0, 0, 0.86) 25%,
        rgba(0, 0, 0, 0.5) 55%,
        transparent 80%
      );
  }
}
.onb-headline {
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.7);
}
.onb-code-lines {
  background-image:
    linear-gradient(to right, rgba(120, 200, 255, 0.55) 22%, transparent 22%),
    linear-gradient(to right, rgba(255, 255, 255, 0.35) 50%, transparent 50%),
    linear-gradient(to right, rgba(255, 200, 120, 0.5) 40%, transparent 40%),
    linear-gradient(to right, rgba(255, 255, 255, 0.3) 60%, transparent 60%),
    linear-gradient(to right, rgba(180, 255, 180, 0.45) 32%, transparent 32%);
  background-size: 100% 14%;
  background-position:
    0 10%, 0 32%, 0 54%, 0 76%, 0 98%;
  background-repeat: no-repeat;
}
`;

type ChildProps = { card: FeedCard };

const SourceRow = ({
  card,
  inverted = false,
}: ChildProps & { inverted?: boolean }): ReactElement => (
  <div
    className={classNames(
      'flex items-center gap-1.5 typo-caption2',
      inverted ? 'text-white/85' : 'text-text-tertiary',
    )}
  >
    <span
      className={classNames(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded-4 text-[8px] font-bold leading-none text-white',
        inverted ? 'bg-white/25' : ACCENT_BG[card.sourceAccent],
      )}
    >
      {card.sourceInitial}
    </span>
    <span className="min-w-0 truncate font-medium">{card.source}</span>
    <span aria-hidden className="opacity-50">
      ·
    </span>
    <span aria-hidden className="opacity-80 shrink-0">
      {card.time}
    </span>
  </div>
);

const EngagementRow = ({
  card,
  inverted = false,
}: ChildProps & { inverted?: boolean }): ReactElement => (
  <div
    className={classNames(
      'flex items-center gap-3 typo-caption2',
      inverted ? 'text-white/85' : 'text-text-tertiary',
    )}
  >
    <span className="inline-flex items-center gap-1">
      <UpvoteIcon size={IconSize.XXSmall} secondary />
      <span className="tabular-nums">{card.upvotes}</span>
    </span>
    <span className="inline-flex items-center gap-1">
      <DiscussIcon size={IconSize.XXSmall} secondary />
      <span className="tabular-nums">{card.comments}</span>
    </span>
    {card.badge === 'trending' && !inverted && (
      <span className="ml-auto inline-flex items-center gap-1 text-accent-cabbage-default">
        <TrendingIcon size={IconSize.XXSmall} secondary />
        <span>Trending</span>
      </span>
    )}
    {card.badge === 'top' && !inverted && (
      <span className="ml-auto inline-flex items-center gap-1 text-accent-cheese-default">
        <StarIcon size={IconSize.XXSmall} secondary />
        <span>Top</span>
      </span>
    )}
    {card.badge && inverted && (
      <span className="ml-auto inline-flex items-center gap-1 text-white">
        {card.badge === 'trending' ? (
          <TrendingIcon size={IconSize.XXSmall} secondary />
        ) : (
          <StarIcon size={IconSize.XXSmall} secondary />
        )}
        <span className="font-semibold">
          {card.badge === 'trending' ? 'Trending' : 'Top'}
        </span>
      </span>
    )}
  </div>
);

const VideoCard = ({ card }: ChildProps): ReactElement => (
  <article className="overflow-hidden rounded-12 border border-white/[0.08] bg-white/[0.045] shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
    <div
      className={classNames(
        'relative h-20 bg-gradient-to-br',
        ACCENT_FROM[card.sourceAccent],
        ACCENT_TO[card.sourceAccent],
      )}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="bg-black/55 flex h-9 w-9 items-center justify-center rounded-full text-white backdrop-blur-sm">
          <PlayIcon size={IconSize.XSmall} secondary />
        </span>
      </div>
      {card.duration && (
        <span className="bg-black/70 absolute bottom-1.5 right-1.5 rounded-4 px-1.5 py-0.5 font-bold tabular-nums text-white typo-caption2">
          {card.duration}
        </span>
      )}
    </div>
    <div className="flex flex-col gap-2 p-3">
      <SourceRow card={card} />
      <h3 className="line-clamp-3 font-bold leading-snug text-text-primary typo-callout">
        {card.title}
      </h3>
      <EngagementRow card={card} />
    </div>
  </article>
);

const CodeCard = ({ card }: ChildProps): ReactElement => (
  <article className="overflow-hidden rounded-12 border border-white/[0.08] bg-white/[0.045] shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
    <div className="relative h-16 bg-raw-pepper-90">
      <div className="onb-code-lines opacity-65 absolute inset-3" />
      <span className="absolute right-2 top-2 inline-flex items-center gap-1 text-text-tertiary typo-caption2">
        <TerminalIcon size={IconSize.XXSmall} secondary />
        <span>snippet</span>
      </span>
    </div>
    <div className="flex flex-col gap-2 p-3">
      <SourceRow card={card} />
      <h3 className="line-clamp-3 font-bold leading-snug text-text-primary typo-callout">
        {card.title}
      </h3>
      <EngagementRow card={card} />
    </div>
  </article>
);

const HeroCard = ({ card }: ChildProps): ReactElement => (
  <article
    className={classNames(
      'overflow-hidden rounded-12 border border-transparent shadow-[0_10px_32px_rgba(0,0,0,0.45)]',
      ACCENT_BG[card.sourceAccent],
    )}
  >
    <div className="flex flex-col gap-3 p-3">
      <SourceRow card={card} inverted />
      <h3 className="text-balance font-bold leading-tight text-white typo-callout">
        {card.title}
      </h3>
      <EngagementRow card={card} inverted />
    </div>
  </article>
);

const DiscussionCard = ({ card }: ChildProps): ReactElement => (
  <article className="overflow-hidden rounded-12 border border-white/[0.08] bg-white/[0.045] shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
    <div
      className={classNames(
        'flex items-center gap-1.5 px-3 py-1.5 text-white typo-caption2',
        ACCENT_BG[card.sourceAccent],
      )}
    >
      <SquadIcon size={IconSize.XXSmall} secondary />
      <span className="font-semibold uppercase tracking-wide">Squad</span>
    </div>
    <div className="flex flex-col gap-2 p-3">
      <SourceRow card={card} />
      <h3 className="line-clamp-3 font-bold leading-snug text-text-primary typo-callout">
        {card.title}
      </h3>
      <EngagementRow card={card} />
    </div>
  </article>
);

const ArticleCard = ({ card }: ChildProps): ReactElement => (
  <article className="overflow-hidden rounded-12 border border-white/[0.08] bg-white/[0.045] shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
    <div className={classNames('h-1', ACCENT_BG[card.sourceAccent])} />
    <div className="flex flex-col gap-2 p-3">
      <SourceRow card={card} />
      <h3 className="line-clamp-3 font-bold leading-snug text-text-primary typo-callout">
        {card.title}
      </h3>
      <EngagementRow card={card} />
    </div>
  </article>
);

const FeedCardTile = ({ card }: ChildProps): ReactElement => {
  if (card.type === 'video') {
    return <VideoCard card={card} />;
  }
  if (card.type === 'code') {
    return <CodeCard card={card} />;
  }
  if (card.type === 'hero') {
    return <HeroCard card={card} />;
  }
  if (card.type === 'discussion') {
    return <DiscussionCard card={card} />;
  }
  return <ArticleCard card={card} />;
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
        <div className="grid h-full w-full grid-cols-2 gap-2.5 px-3 tablet:grid-cols-3 tablet:gap-3 tablet:px-5 laptop:grid-cols-4 laptop:px-6">
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
        className="onb-form-halo pointer-events-none absolute inset-0 -z-1"
      />

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
