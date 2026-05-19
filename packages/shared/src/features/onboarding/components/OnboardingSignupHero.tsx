import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import Logo, { LogoPosition } from '../../../components/Logo';
import { IconSize } from '../../../components/Icon';
import { StarIcon } from '../../../components/icons/Star';
import { UpvoteIcon } from '../../../components/icons/Upvote';
import { DiscussIcon } from '../../../components/icons/Discuss';
import { ArrowIcon } from '../../../components/icons/Arrow';
import { GitHubIcon } from '../../../components/icons/GitHub';
import { ChromeIcon } from '../../../components/icons/Browser/Chrome';
import { TrendingIcon } from '../../../components/icons/Trending';
import { SparkleIcon } from '../../../components/icons/Sparkle';

type PreviewCard = {
  source: string;
  initial: string;
  accent: 'cabbage' | 'cheese' | 'water' | 'onion' | 'bacon';
  posted: string;
  title: string;
  upvotes: string;
  comments: string;
  trending?: boolean;
};

const PREVIEW_CARDS: PreviewCard[] = [
  {
    source: 'GitHub Blog',
    initial: 'GH',
    accent: 'cabbage',
    posted: '2h',
    title: 'Inside the rewrite of git internals in Rust',
    upvotes: '1.2k',
    comments: '184',
    trending: true,
  },
  {
    source: 'The Pragmatic Engineer',
    initial: 'PE',
    accent: 'cheese',
    posted: '6h',
    title: 'What we learned moving Stripe-scale services to typed RPC',
    upvotes: '2.4k',
    comments: '256',
  },
  {
    source: 'Vercel',
    initial: 'V',
    accent: 'water',
    posted: '9h',
    title: 'Edge functions are faster than you think — here is proof',
    upvotes: '987',
    comments: '47',
  },
];

const ACCENT_BG: Record<PreviewCard['accent'], string> = {
  cabbage: 'bg-accent-cabbage-default',
  cheese: 'bg-accent-cheese-default',
  water: 'bg-accent-water-default',
  onion: 'bg-accent-onion-default',
  bacon: 'bg-accent-bacon-default',
};

const VALUE_DOTS: Array<{ color: string; label: string }> = [
  {
    color: 'bg-accent-cabbage-default',
    label: 'Personalized to your stack from the first tab.',
  },
  {
    color: 'bg-accent-cheese-default',
    label: 'Ranked by what 1M+ developers actually read.',
  },
  {
    color: 'bg-accent-water-default',
    label: 'Open source. No spam. Your data stays yours.',
  },
];

const PROOF_BAND: Array<{ headline: string; sub: string }> = [
  { headline: '400,000+', sub: 'developers signed up' },
  { headline: '4.8 ★', sub: '52.8K Chrome reviews' },
  { headline: '18,000+', sub: 'GitHub stars' },
  { headline: '2,000+', sub: 'trusted sources curated' },
];

const HERO_STYLES = `
.onb-signup {
  background:
    radial-gradient(ellipse 70% 55% at 12% -10%,
      color-mix(in srgb, var(--theme-accent-cabbage-default) 18%, transparent) 0%,
      transparent 60%),
    radial-gradient(ellipse 60% 50% at 95% 20%,
      color-mix(in srgb, var(--theme-accent-onion-default) 14%, transparent) 0%,
      transparent 65%),
    radial-gradient(ellipse 55% 50% at 85% 95%,
      color-mix(in srgb, var(--theme-accent-water-default) 10%, transparent) 0%,
      transparent 65%),
    var(--theme-background-default);
}
.onb-signup__grid {
  background-image: radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px);
  background-size: 24px 24px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 5%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 5%, transparent 75%);
}
.onb-signup__headline-accent {
  background-image: linear-gradient(92deg,
    var(--theme-accent-cabbage-default) 0%,
    var(--theme-accent-onion-default) 55%,
    var(--theme-accent-water-default) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.onb-signup__preview {
  background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}
.onb-signup__card {
  background: rgba(255,255,255,0.035);
  border: 1px solid rgba(255,255,255,0.07);
}
.onb-signup__live-dot::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 9999px;
  background: var(--theme-accent-avocado-default);
  opacity: 0.35;
  filter: blur(3px);
}
@media (prefers-reduced-motion: no-preference) {
  .onb-signup__live-dot::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    background: var(--theme-accent-avocado-default);
    animation: onb-signup-pulse 2.4s ease-out infinite;
    opacity: 0;
  }
  @keyframes onb-signup-pulse {
    0% { transform: scale(1); opacity: 0.55; }
    100% { transform: scale(2.4); opacity: 0; }
  }
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
  <div className="onb-signup relative flex min-h-dvh w-full flex-col overflow-x-hidden bg-raw-pepper-90 text-text-primary">
    <style dangerouslySetInnerHTML={{ __html: HERO_STYLES }} />

    <div
      aria-hidden
      className="onb-signup__grid pointer-events-none absolute inset-0"
    />

    <header className="relative z-1 mx-auto flex w-full max-w-[80rem] items-center justify-between px-4 py-5 tablet:px-8 tablet:py-7">
      <Logo
        position={LogoPosition.Relative}
        className="!left-0 !top-0 !mt-0 !translate-x-0"
        logoClassName={{ container: 'h-6 tablet:h-7' }}
      />
      <div className="flex items-center gap-3 text-text-tertiary typo-caption1">
        <span
          aria-hidden
          className="onb-signup__live-dot relative hidden h-1.5 w-1.5 rounded-full bg-accent-avocado-default tablet:inline-flex"
        />
        <span className="hidden tablet:inline">
          Live · ranked by developers, every minute
        </span>
      </div>
    </header>

    <main
      className={classNames(
        'relative z-1 mx-auto flex w-full max-w-[80rem] flex-1 flex-col px-4 pb-10 pt-2 tablet:px-8 tablet:pt-6 laptop:pt-10',
        isFormExpanded && 'items-center justify-center',
      )}
    >
      {isFormExpanded ? (
        <div className="flex w-full max-w-[30rem] flex-col items-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-subtlest-tertiary bg-surface-float px-3 py-1 text-text-tertiary typo-caption2">
            <SparkleIcon
              size={IconSize.XXSmall}
              secondary
              className="text-accent-cheese-default"
            />
            <span className="uppercase tracking-[0.18em]">Almost there</span>
          </div>
          {children}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 items-start gap-10 laptop:grid-cols-[1.08fr_0.92fr] laptop:gap-16">
            <div className="flex w-full max-w-[34rem] flex-col">
              <div className="mb-6 inline-flex items-center gap-2 self-start rounded-full border border-border-subtlest-tertiary bg-surface-float px-3 py-1 text-text-tertiary typo-caption2 tablet:mb-7">
                <SparkleIcon
                  size={IconSize.XXSmall}
                  secondary
                  className="text-accent-cheese-default"
                />
                <span className="uppercase tracking-[0.18em]">
                  Welcome · daily.dev
                </span>
              </div>

              <h1 className="font-bold leading-[1.05] tracking-tight text-text-primary typo-large-title tablet:typo-mega3">
                <span className="onb-signup__headline-accent">
                  400,000 developers
                </span>
                <br />
                start their day here.
              </h1>

              <p className="mt-5 max-w-[28rem] text-text-secondary typo-body tablet:mt-6 tablet:typo-title3">
                Sign up to get a feed curated from 2,000+ sources, ranked by
                what developers actually read.
              </p>

              <ul className="mt-7 flex flex-col gap-3 tablet:mt-8">
                {VALUE_DOTS.map(({ color, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-3 text-text-secondary typo-callout tablet:typo-body"
                  >
                    <span
                      aria-hidden
                      className={classNames(
                        'h-2 w-2 shrink-0 rounded-full',
                        color,
                      )}
                    />
                    <span>{label}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 w-full max-w-[26rem] tablet:mt-10">
                {children}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-text-tertiary typo-caption1">
                <span className="inline-flex items-center gap-1.5">
                  <StarIcon
                    size={IconSize.XXSmall}
                    secondary
                    className="text-accent-cheese-default"
                  />
                  <span className="font-bold tabular-nums text-text-secondary">
                    4.8
                  </span>
                  <span>·</span>
                  <span className="tabular-nums">52.8K reviews</span>
                </span>
                <span aria-hidden className="text-text-quaternary">
                  ·
                </span>
                <span>
                  <span className="font-bold tabular-nums text-text-secondary">
                    400,000+
                  </span>{' '}
                  developers
                </span>
                <span aria-hidden className="text-text-quaternary">
                  ·
                </span>
                <span>Open source</span>
              </div>
            </div>

            <aside
              aria-hidden
              className="onb-signup__preview relative hidden w-full overflow-hidden rounded-24 border border-border-subtlest-tertiary p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] laptop:block laptop:p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="bg-accent-bacon-default/70 h-2.5 w-2.5 rounded-full"
                  />
                  <span
                    aria-hidden
                    className="bg-accent-cheese-default/70 h-2.5 w-2.5 rounded-full"
                  />
                  <span
                    aria-hidden
                    className="bg-accent-avocado-default/70 h-2.5 w-2.5 rounded-full"
                  />
                  <span className="ml-2 inline-flex items-center gap-1.5 text-text-tertiary typo-caption2">
                    <ChromeIcon size={IconSize.XXSmall} aria-hidden />
                    new tab · app.daily.dev
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-text-tertiary typo-caption2">
                  <TrendingIcon
                    size={IconSize.XXSmall}
                    secondary
                    className="text-accent-cabbage-default"
                  />
                  Today&apos;s top reads
                </span>
              </div>

              <ul className="flex flex-col gap-3">
                {PREVIEW_CARDS.map((card) => (
                  <li
                    key={card.title}
                    className="onb-signup__card flex flex-col gap-3 rounded-16 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          aria-hidden
                          className={classNames(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-10 font-bold text-white typo-caption2',
                            ACCENT_BG[card.accent],
                          )}
                        >
                          {card.initial}
                        </span>
                        <span className="min-w-0 truncate text-text-tertiary typo-caption1">
                          {card.source}
                        </span>
                        <span
                          aria-hidden
                          className="shrink-0 text-text-quaternary typo-caption2"
                        >
                          · {card.posted}
                        </span>
                      </div>
                      {card.trending && (
                        <span className="bg-accent-cabbage-default/15 inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-accent-cabbage-default typo-caption2">
                          <TrendingIcon size={IconSize.XXSmall} secondary />
                          Trending
                        </span>
                      )}
                    </div>
                    <p className="font-bold leading-snug text-text-primary typo-callout">
                      {card.title}
                    </p>
                    <div className="flex items-center gap-4 text-text-tertiary typo-caption1">
                      <span className="inline-flex items-center gap-1">
                        <UpvoteIcon size={IconSize.XXSmall} secondary />
                        <span className="tabular-nums">{card.upvotes}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <DiscussIcon size={IconSize.XXSmall} secondary />
                        <span className="tabular-nums">{card.comments}</span>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center justify-between rounded-12 border border-dashed border-border-subtlest-tertiary px-4 py-3 text-text-tertiary typo-caption1">
                <span className="inline-flex items-center gap-2">
                  <span
                    aria-hidden
                    className="onb-signup__live-dot relative h-1.5 w-1.5 rounded-full bg-accent-avocado-default"
                  />
                  <span>184 developers signed up in the last hour</span>
                </span>
                <ArrowIcon
                  size={IconSize.XXSmall}
                  className="rotate-90 text-text-quaternary"
                />
              </div>
            </aside>
          </div>

          <section className="relative z-1 mt-12 grid grid-cols-2 gap-6 border-t border-border-subtlest-tertiary pt-8 tablet:grid-cols-4 tablet:gap-8 tablet:pt-10">
            {PROOF_BAND.map(({ headline, sub }) => (
              <div key={sub} className="flex flex-col gap-1">
                <span className="font-bold tabular-nums text-text-primary typo-title2">
                  {headline}
                </span>
                <span className="text-text-tertiary typo-caption1">{sub}</span>
              </div>
            ))}
          </section>

          <section className="relative z-1 mt-10 flex flex-col items-start gap-4 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-6 tablet:mt-12 tablet:flex-row tablet:items-center tablet:gap-6 tablet:p-8">
            <div className="flex shrink-0 items-center gap-3 text-accent-cheese-default">
              <StarIcon size={IconSize.XSmall} secondary />
              <StarIcon size={IconSize.XSmall} secondary />
              <StarIcon size={IconSize.XSmall} secondary />
              <StarIcon size={IconSize.XSmall} secondary />
              <StarIcon size={IconSize.XSmall} secondary />
            </div>
            <blockquote className="text-text-secondary typo-body tablet:typo-title3">
              &ldquo;Replaced 8 tabs in my morning routine. I open a new tab and
              half the day&apos;s reading is already there, ranked.&rdquo;
              <footer className="mt-2 text-text-tertiary typo-caption1">
                — staff engineer ·{' '}
                <span className="inline-flex items-center gap-1">
                  <GitHubIcon
                    size={IconSize.XXSmall}
                    secondary
                    className="text-text-quaternary"
                  />
                  shared via Chrome Web Store
                </span>
              </footer>
            </blockquote>
          </section>
        </>
      )}
    </main>
  </div>
);

export default OnboardingSignupHero;
