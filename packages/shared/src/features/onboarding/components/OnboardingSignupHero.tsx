import type { ReactElement, ReactNode } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import Logo, { LogoPosition } from '../../../components/Logo';
import { IconSize } from '../../../components/Icon';
import { UpvoteIcon } from '../../../components/icons/Upvote';
import {
  ThemeMode,
  useSettingsContext,
} from '../../../contexts/SettingsContext';

type FeedCard = {
  source: string;
  title: string;
  upvotes: string;
  time: string;
};

const CARDS: FeedCard[] = [
  {
    source: 'GitHub Blog',
    title: 'Why we rewrote Git internals in Rust',
    upvotes: '1.2k',
    time: '2h',
  },
  {
    source: 'Vercel',
    title: 'Edge functions, benchmarked: 14ms vs 280ms',
    upvotes: '987',
    time: '4h',
  },
  {
    source: 'Pragmatic Engineer',
    title: 'The case against microservices in 2026',
    upvotes: '2.4k',
    time: '6h',
  },
  {
    source: 'Stripe Engineering',
    title: 'How we cut JS bundle size by 60% with islands',
    upvotes: '714',
    time: '5h',
  },
  {
    source: 'Frontend Squad',
    title: 'What CSS features changed how you ship components?',
    upvotes: '512',
    time: '3h',
  },
  {
    source: 'daily.dev',
    title: 'A one-line trick to debounce async hooks',
    upvotes: '824',
    time: '8h',
  },
  {
    source: 'Cloudflare',
    title: 'Building a real-time engine on Workers',
    upvotes: '1.4k',
    time: '10h',
  },
  {
    source: 'Linear',
    title: 'Designing APIs developers actually like using',
    upvotes: '1.1k',
    time: '9h',
  },
  {
    source: 'PlanetScale',
    title: 'Branching production databases without losing sleep',
    upvotes: '923',
    time: '12h',
  },
  {
    source: 'Notion',
    title: "Notion's data model, explained in five minutes",
    upvotes: '1.6k',
    time: '1d',
  },
  {
    source: 'Backend Squad',
    title: 'Postgres or SQLite for your side project in 2026?',
    upvotes: '987',
    time: '4h',
  },
  {
    source: 'GitHub Blog',
    title: 'Anatomy of a memory leak (and how we caught it)',
    upvotes: '1.3k',
    time: '14h',
  },
  {
    source: 'daily.dev',
    title: 'Type-safe env vars in 8 lines with Zod',
    upvotes: '654',
    time: '11h',
  },
  {
    source: 'Linear',
    title: 'Git internals: how rebase actually works',
    upvotes: '1.8k',
    time: '2d',
  },
  {
    source: 'AI Squad',
    title: 'What is the most useful LLM workflow you ship daily?',
    upvotes: '1.9k',
    time: '5h',
  },
  {
    source: 'Cloudflare',
    title: 'Why your tests are slow and how we fixed ours',
    upvotes: '1.1k',
    time: '2d',
  },
  {
    source: 'The Overflow',
    title: 'If you can read a stack trace, you can fix anything',
    upvotes: '2.1k',
    time: '7h',
  },
  {
    source: 'daily.dev',
    title: 'Ship small. Ship often. Ship anyway.',
    upvotes: '4.2k',
    time: '1d',
  },
];

const COLUMNS: Array<{ slice: [number, number]; duration: string }> = [
  { slice: [0, 6], duration: '210s' },
  { slice: [6, 12], duration: '260s' },
  { slice: [12, 18], duration: '235s' },
];

const HERO_STYLES = `
.onb-bg {
  background:
    radial-gradient(ellipse 70% 55% at 12% 18%,
      color-mix(in srgb, var(--theme-accent-cabbage-default) 10%, transparent) 0%,
      transparent 65%),
    radial-gradient(ellipse 55% 45% at 88% 32%,
      color-mix(in srgb, var(--theme-accent-water-default) 9%, transparent) 0%,
      transparent 70%),
    radial-gradient(ellipse 60% 40% at 30% 88%,
      color-mix(in srgb, var(--theme-accent-onion-default) 7%, transparent) 0%,
      transparent 70%),
    var(--theme-background-default);
}
.onb-col {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  animation: onb-scroll var(--onb-dur, 220s) linear infinite;
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
    radial-gradient(
      ellipse 100% 70% at 50% 80%,
      rgba(8, 8, 12, 0.94) 0%,
      rgba(8, 8, 12, 0.78) 22%,
      rgba(8, 8, 12, 0.45) 50%,
      transparent 82%
    );
}
.onb-top-fade {
  background: linear-gradient(
    to bottom,
    rgba(8, 8, 12, 0.55) 0%,
    rgba(8, 8, 12, 0.15) 18%,
    transparent 32%
  );
}
.onb-headline {
  text-shadow: 0 2px 28px rgba(0, 0, 0, 0.65);
}
.onb-glow {
  position: absolute;
  border-radius: 9999px;
  filter: blur(72px);
  opacity: 0.55;
  pointer-events: none;
  mix-blend-mode: screen;
}
`;

const FeedCardTile = ({ card }: { card: FeedCard }): ReactElement => (
  <article className="flex flex-col gap-2.5 rounded-12 border border-white/[0.05] bg-white/[0.025] p-3 shadow-[0_4px_18px_rgba(0,0,0,0.25)] backdrop-blur-[2px]">
    <div className="flex items-center gap-1.5 text-text-quaternary typo-caption2">
      <span className="min-w-0 truncate font-medium">{card.source}</span>
      <span aria-hidden className="opacity-60">
        ·
      </span>
      <span aria-hidden className="shrink-0">
        {card.time}
      </span>
    </div>
    <h3 className="line-clamp-3 text-balance font-medium leading-snug text-text-secondary typo-callout">
      {card.title}
    </h3>
    <div className="flex items-center gap-1 text-text-quaternary typo-caption2">
      <UpvoteIcon size={IconSize.XXSmall} secondary />
      <span className="tabular-nums">{card.upvotes}</span>
    </div>
  </article>
);

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
        className="pointer-events-none absolute inset-0 -z-2 select-none"
      >
        <span
          className="onb-glow bg-accent-cabbage-default"
          style={{
            width: '36rem',
            height: '36rem',
            top: '-8rem',
            left: '-6rem',
          }}
        />
        <span
          className="onb-glow bg-accent-water-default"
          style={{
            width: '30rem',
            height: '30rem',
            top: '20%',
            right: '-8rem',
          }}
        />
        <span
          className="onb-glow bg-accent-onion-default"
          style={{
            width: '28rem',
            height: '28rem',
            bottom: '-6rem',
            left: '20%',
            opacity: 0.35,
          }}
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-1 select-none"
      >
        <div className="mx-auto grid h-full max-w-7xl grid-cols-2 gap-3 px-4 tablet:grid-cols-3 tablet:gap-4 tablet:px-8">
          {COLUMNS.map(({ slice, duration }, idx) => {
            const cards = CARDS.slice(slice[0], slice[1]);
            const doubled = [...cards, ...cards];
            const hideOnMobile = idx === 2;
            return (
              <div
                key={`col-${slice[0]}`}
                className={classNames(
                  'onb-col -mt-16',
                  idx % 2 === 1 && 'onb-col--reverse',
                  hideOnMobile && 'hidden tablet:flex',
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
        className="onb-top-fade pointer-events-none absolute inset-x-0 top-0 -z-1 h-40"
      />
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
