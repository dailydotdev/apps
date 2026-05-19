import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import Logo, { LogoPosition } from '../../../components/Logo';

type FeedCard = {
  source: string;
  sourceInitial: string;
  sourceAccent: 'cabbage' | 'cheese' | 'water' | 'onion' | 'avocado' | 'bacon';
  title: string;
  heroAccent: 'cabbage' | 'cheese' | 'water' | 'onion' | 'avocado' | 'bacon';
  layout: 'cover' | 'text';
};

const ACCENT_FROM: Record<FeedCard['heroAccent'], string> = {
  cabbage: 'from-accent-cabbage-default',
  cheese: 'from-accent-cheese-default',
  water: 'from-accent-water-default',
  onion: 'from-accent-onion-default',
  avocado: 'from-accent-avocado-default',
  bacon: 'from-accent-bacon-default',
};

const ACCENT_TO: Record<FeedCard['heroAccent'], string> = {
  cabbage: 'to-accent-onion-default',
  cheese: 'to-accent-bacon-default',
  water: 'to-accent-cabbage-default',
  onion: 'to-accent-water-default',
  avocado: 'to-accent-water-default',
  bacon: 'to-accent-cheese-default',
};

const ACCENT_DOT: Record<FeedCard['sourceAccent'], string> = {
  cabbage: 'bg-accent-cabbage-default',
  cheese: 'bg-accent-cheese-default',
  water: 'bg-accent-water-default',
  onion: 'bg-accent-onion-default',
  avocado: 'bg-accent-avocado-default',
  bacon: 'bg-accent-bacon-default',
};

const CARDS: FeedCard[] = [
  {
    source: 'GitHub Blog',
    sourceInitial: 'GH',
    sourceAccent: 'cabbage',
    title: 'Inside the rewrite of git internals in Rust',
    heroAccent: 'cabbage',
    layout: 'cover',
  },
  {
    source: 'Vercel',
    sourceInitial: 'V',
    sourceAccent: 'water',
    title: 'Edge functions are faster than you think',
    heroAccent: 'water',
    layout: 'text',
  },
  {
    source: 'Pragmatic Engineer',
    sourceInitial: 'PE',
    sourceAccent: 'cheese',
    title: 'What we learned moving Stripe-scale services to typed RPC',
    heroAccent: 'cheese',
    layout: 'cover',
  },
  {
    source: 'Stripe Engineering',
    sourceInitial: 'St',
    sourceAccent: 'onion',
    title: 'How we cut JS bundle size by 60% with islands',
    heroAccent: 'onion',
    layout: 'text',
  },
  {
    source: 'Cloudflare',
    sourceInitial: 'Cf',
    sourceAccent: 'bacon',
    title: 'Building a real-time engine on Workers',
    heroAccent: 'bacon',
    layout: 'cover',
  },
  {
    source: 'daily.dev',
    sourceInitial: 'd',
    sourceAccent: 'cabbage',
    title: 'The architecture behind a personalized feed for 1M devs',
    heroAccent: 'cabbage',
    layout: 'text',
  },
  {
    source: 'Linear',
    sourceInitial: 'L',
    sourceAccent: 'water',
    title: 'Designing APIs developers actually like',
    heroAccent: 'water',
    layout: 'cover',
  },
  {
    source: 'PlanetScale',
    sourceInitial: 'PS',
    sourceAccent: 'avocado',
    title: 'Branching production databases without losing your mind',
    heroAccent: 'avocado',
    layout: 'text',
  },
  {
    source: 'Notion',
    sourceInitial: 'N',
    sourceAccent: 'cheese',
    title: "Notion's data model in five minutes",
    heroAccent: 'cheese',
    layout: 'cover',
  },
  {
    source: 'GitHub Blog',
    sourceInitial: 'GH',
    sourceAccent: 'cabbage',
    title: 'Anatomy of a memory leak (and how we caught it)',
    heroAccent: 'onion',
    layout: 'text',
  },
  {
    source: 'Pragmatic Engineer',
    sourceInitial: 'PE',
    sourceAccent: 'cheese',
    title: 'The case against microservices in 2026',
    heroAccent: 'bacon',
    layout: 'cover',
  },
  {
    source: 'Vercel',
    sourceInitial: 'V',
    sourceAccent: 'water',
    title: 'TypeScript 5.5: what is actually useful',
    heroAccent: 'water',
    layout: 'text',
  },
  {
    source: 'Cloudflare',
    sourceInitial: 'Cf',
    sourceAccent: 'bacon',
    title: 'Why your tests are slow and how we fixed ours',
    heroAccent: 'cabbage',
    layout: 'cover',
  },
  {
    source: 'daily.dev',
    sourceInitial: 'd',
    sourceAccent: 'cabbage',
    title: 'How GitHub handles 100M repositories',
    heroAccent: 'avocado',
    layout: 'text',
  },
  {
    source: 'Linear',
    sourceInitial: 'L',
    sourceAccent: 'water',
    title: 'Git internals: how rebase actually works',
    heroAccent: 'cheese',
    layout: 'cover',
  },
  {
    source: 'Stripe Engineering',
    sourceInitial: 'St',
    sourceAccent: 'onion',
    title: 'A pragmatic look at multi-tenant SaaS architecture',
    heroAccent: 'onion',
    layout: 'text',
  },
];

const COLUMNS: Array<{ slice: [number, number]; duration: string }> = [
  { slice: [0, 4], duration: '70s' },
  { slice: [4, 8], duration: '95s' },
  { slice: [8, 12], duration: '80s' },
  { slice: [12, 16], duration: '105s' },
];

const FeedCardTile = ({ card }: { card: FeedCard }): ReactElement => (
  <article className="onb-card overflow-hidden rounded-16 border border-white/[0.08] bg-white/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
    {card.layout === 'cover' ? (
      <div
        className={classNames(
          'aspect-[16/10] bg-gradient-to-br',
          ACCENT_FROM[card.heroAccent],
          ACCENT_TO[card.heroAccent],
        )}
      />
    ) : null}
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center gap-2 text-text-tertiary typo-caption2">
        <span
          className={classNames(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-6 font-bold text-white typo-caption2',
            ACCENT_DOT[card.sourceAccent],
          )}
        >
          {card.sourceInitial}
        </span>
        <span className="truncate">{card.source}</span>
      </div>
      <h3
        className={classNames(
          'font-bold leading-snug text-text-primary',
          card.layout === 'text' ? 'typo-title3' : 'typo-callout',
        )}
      >
        {card.title}
      </h3>
    </div>
  </article>
);

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
  gap: 1rem;
  animation: onb-scroll var(--onb-dur, 80s) linear infinite;
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
.onb-overlay-h {
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.25) 0%,
    rgba(0, 0, 0, 0.4) 40%,
    rgba(0, 0, 0, 0.85) 70%,
    rgba(0, 0, 0, 0.96) 100%
  );
}
.onb-overlay-v {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.6) 40%,
    rgba(0, 0, 0, 0.92) 100%
  );
}
.onb-vignette {
  background: radial-gradient(
    ellipse 55% 80% at 82% 50%,
    rgba(0, 0, 0, 0.55) 0%,
    transparent 75%
  );
}
.onb-headline {
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.6);
}
`;

type Props = {
  children: ReactNode;
  isFormExpanded?: boolean;
};

export const OnboardingSignupHero = ({
  children,
  isFormExpanded = false,
}: Props): ReactElement => (
  <div className="onb-bg relative flex min-h-dvh w-full overflow-hidden bg-raw-pepper-90 text-text-primary">
    <style dangerouslySetInnerHTML={{ __html: HERO_STYLES }} />

    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-1 select-none"
    >
      <div className="grid h-full w-full grid-cols-2 gap-4 px-4 tablet:grid-cols-3 tablet:px-6 laptop:grid-cols-4 laptop:px-8">
        {COLUMNS.map(({ slice, duration }, idx) => {
          const cards = CARDS.slice(slice[0], slice[1]);
          const doubled = [...cards, ...cards];
          const hideOnMobile = idx >= 2;
          const hideOnTablet = idx === 3;
          return (
            <div
              key={`col-${slice[0]}`}
              className={classNames(
                'onb-col -mt-16',
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
      className="onb-overlay-v pointer-events-none absolute inset-0 -z-1 tablet:hidden"
    />
    <div
      aria-hidden
      className="onb-overlay-h pointer-events-none absolute inset-0 -z-1 hidden tablet:block"
    />
    <div
      aria-hidden
      className="onb-vignette pointer-events-none absolute inset-0 -z-1 hidden tablet:block"
    />

    <main className="relative z-1 flex w-full flex-1 flex-col items-center justify-center px-5 py-10 tablet:justify-end tablet:px-10 laptop:py-14 laptop:pr-[8vw]">
      <div className="flex w-full max-w-[26rem] flex-col gap-7">
        <Logo
          position={LogoPosition.Relative}
          className="!left-0 !top-0 !mt-0 !translate-x-0"
          logoClassName={{ container: 'h-7' }}
        />

        {!isFormExpanded && (
          <h1 className="onb-headline text-balance font-bold leading-[1.05] tracking-tight text-text-primary typo-large-title tablet:typo-mega3">
            The homepage every developer deserves.
          </h1>
        )}

        {children}
      </div>
    </main>
  </div>
);

export default OnboardingSignupHero;
