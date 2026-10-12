import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { DevPlusIcon } from '@dailydotdev/shared/src/components/icons/DevPlus';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { VolumeOffIcon } from '@dailydotdev/shared/src/components/icons/VolumeOff';
import { BlockIcon } from '@dailydotdev/shared/src/components/icons/Block';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { PlusTile } from '@dailydotdev/shared/src/components/plus/PlusPreview';
import { PlusPerkTicker } from '@dailydotdev/shared/src/components/plus/PlusPerkTicker';
import { PlusFeedBanner } from '@dailydotdev/shared/src/components/plus/PlusFeedBanner';
import { usePrefersReducedMotion } from '@dailydotdev/shared/src/hooks/usePrefersReducedMotion';

// Ten takes on the in-feed Plus scroll stopper. Each one pulls a different
// lever (self-awareness, the reader's own numbers, a live demo, price, a
// bare one-word pitch). Numbers below are sample data; in production they
// would come from the feed items already loaded on the page, the way the
// bookmarks strip reads its folder suggestions from the query cache.

export const sample = {
  ads: 14,
  clickbait: 9,
  muted: 3,
  postsDeep: 48,
};

const mono = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' };

const frame =
  'rounded-16 border border-border-subtlest-tertiary bg-accent-pepper-subtlest';

const GetPlus = ({
  children = 'Get Plus',
  className,
}: {
  children?: ReactNode;
  className?: string;
}): ReactElement => (
  <Button
    tag="a"
    href="/plus"
    variant={ButtonVariant.Primary}
    color={ButtonColor.Bacon}
    size={ButtonSize.Small}
    icon={<DevPlusIcon secondary />}
    className={className}
  >
    {children}
  </Button>
);

const useCountUp = (target: number, durationMs = 900): number => {
  const isReducedMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(isReducedMotion ? target : 0);

  useEffect(() => {
    if (isReducedMotion) {
      setValue(target);
      return undefined;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, isReducedMotion]);

  return value;
};

const useStep = (steps: number, intervalMs: number, loop = false): number => {
  const isReducedMotion = usePrefersReducedMotion();
  const [step, setStep] = useState(isReducedMotion ? steps - 1 : 0);

  useEffect(() => {
    if (isReducedMotion) {
      return undefined;
    }
    const id = window.setInterval(() => {
      setStep((current) => {
        if (current + 1 < steps) {
          return current + 1;
        }
        return loop ? 0 : current;
      });
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [steps, intervalMs, loop, isReducedMotion]);

  return step;
};

/* 1. Shipped: the version in PR #6868, for reference. */
export const Shipped = (): ReactElement => <PlusFeedBanner />;

/* 2. Flip: the reader's own feed, Free and Plus, one switch between them. */
const flipRows = [
  {
    kind: 'ad',
    source: 'AcmeCloud',
    title: 'Deploy 10x faster with AcmeCloud. Start free today.',
  },
  {
    kind: 'clickbait',
    source: 'Dev Weekly',
    title: 'You WON’T BELIEVE what this one React hook does',
    clean: 'useTransition keeps inputs responsive during heavy renders',
  },
  {
    kind: 'muted',
    source: 'CoinDaily',
    title: 'Top 10 altcoins to buy before the halving',
  },
  {
    kind: 'keep',
    source: 'Postgres',
    title: 'PostgreSQL 18 ships async I/O for sequential scans',
  },
] as const;

export const Flip = (): ReactElement => {
  const [isPlus, setIsPlus] = useState(false);

  return (
    <section className={classNames(frame, 'flex flex-col gap-4 p-5')}>
      <div className="flex flex-col items-start gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
        <div className="flex flex-col gap-0.5">
          <Typography bold type={TypographyType.Title3}>
            Still scrolling? Flip the switch
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            This is the same feed with Plus on. Try it.
          </Typography>
        </div>
        <div
          role="group"
          aria-label="Feed mode"
          className="flex items-center gap-1 rounded-[999px] bg-surface-float p-1"
        >
          {(['Free', 'Plus'] as const).map((label) => {
            const active = (label === 'Plus') === isPlus;
            return (
              <button
                key={label}
                type="button"
                aria-pressed={active}
                onClick={() => setIsPlus(label === 'Plus')}
                className={classNames(
                  'rounded-[999px] px-3 py-1 font-bold typo-footnote transition-colors',
                  active
                    ? 'bg-text-primary text-surface-invert'
                    : 'text-text-tertiary hover:text-text-primary',
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <ul className="flex flex-col overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default">
        {flipRows.map((row) => {
          const hidden = isPlus && (row.kind === 'ad' || row.kind === 'muted');
          const title =
            isPlus && row.kind === 'clickbait' ? row.clean : row.title;
          return (
            <li
              key={row.source}
              className="grid transition-[grid-template-rows,opacity] duration-300 ease-out"
              style={{
                gridTemplateRows: hidden ? '0fr' : '1fr',
                opacity: hidden ? 0 : 1,
              }}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="flex items-center gap-3 border-b border-border-subtlest-tertiary px-3 py-2.5 last:border-b-0">
                  <span
                    aria-hidden
                    className="size-6 shrink-0 rounded-8 bg-surface-float"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-center gap-1.5 text-text-quaternary typo-caption1">
                      {row.source}
                      {row.kind === 'ad' && (
                        <span className="rounded-4 bg-surface-float px-1 text-text-tertiary">
                          Ad
                        </span>
                      )}
                      {row.kind === 'muted' && (
                        <span className="rounded-4 bg-surface-float px-1 text-text-tertiary">
                          #crypto, muted
                        </span>
                      )}
                      {isPlus && row.kind === 'clickbait' && (
                        <span className="text-action-plus-default">
                          Clean title by Plus
                        </span>
                      )}
                    </span>
                    <span
                      key={title}
                      className={classNames(
                        'truncate text-text-primary typo-callout',
                        isPlus && row.kind === 'clickbait' && 'plus-perk-in',
                      )}
                    >
                      {title}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between gap-3">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {isPlus
            ? 'Two posts gone, one title fixed. That is every page, every day.'
            : 'One ad, one clickbait title, one topic you muted. Flip it.'}
        </Typography>
        <GetPlus />
      </div>
    </section>
  );
};

/* 3. Receipt: the scroll, itemized. Numbers are the reader's own. */
export const Receipt = (): ReactElement => {
  const ads = useCountUp(sample.ads);
  const clickbait = useCountUp(sample.clickbait, 1100);
  const muted = useCountUp(sample.muted, 1300);
  const total = ads + clickbait + muted;
  const lines: Array<[string, number]> = [
    ['Ads you scrolled past', ads],
    ['Clickbait titles', clickbait],
    ['Muted topics that slipped through', muted],
  ];

  return (
    <section
      className={classNames(
        frame,
        'mx-auto flex w-full max-w-[26rem] flex-col gap-4 p-5',
      )}
    >
      <div className="flex flex-col gap-0.5">
        <Typography bold type={TypographyType.Title3}>
          Your scroll, itemized
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Today, on this page.
        </Typography>
      </div>
      <dl className="flex flex-col gap-1.5 tabular-nums" style={mono}>
        {lines.map(([label, value]) => (
          <div key={label} className="flex items-baseline gap-2">
            <dt className="text-text-secondary typo-footnote">{label}</dt>
            <span
              aria-hidden
              className="flex-1 border-b border-dotted border-border-subtlest-secondary"
            />
            <dd className="text-text-primary typo-footnote">{value}</dd>
          </div>
        ))}
        <div className="mt-1 flex items-baseline gap-2 border-t border-border-subtlest-tertiary pt-2">
          <dt className="font-bold text-text-primary typo-callout">
            Plus removes
          </dt>
          <span aria-hidden className="flex-1" />
          <dd className="font-bold text-action-plus-default typo-callout">
            {total}
          </dd>
        </div>
      </dl>
      <GetPlus className="w-full">Clear the tab</GetPlus>
    </section>
  );
};

/* 4. Stopwatch: a timer that only runs while the reader looks at it. */
export const Stopwatch = (): ReactElement => {
  const isReducedMotion = usePrefersReducedMotion();
  const [seconds, setSeconds] = useState(isReducedMotion ? 7 : 0);

  useEffect(() => {
    if (isReducedMotion) {
      return undefined;
    }
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setSeconds((current) => current + 1);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [isReducedMotion]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <section
      className={classNames(
        frame,
        'flex flex-col items-center gap-3 px-4 py-6 text-center',
      )}
    >
      <span
        className="text-text-primary tabular-nums typo-mega2"
        aria-live="off"
      >
        {mm}:{ss}
      </span>
      <div className="flex flex-col gap-1">
        <Typography bold type={TypographyType.Title3}>
          Still scrolling? Yes. For that long.
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Plus removes every ad and rewrites clickbait titles, so the feed ends
          sooner.
        </Typography>
      </div>
      <GetPlus />
    </section>
  );
};

/* 5. Last ad: dressed as the ad card it replaces, with its own Remove link. */
export const LastAd = (): ReactElement => (
  <section className="relative flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-default p-5">
    <div className="flex items-center justify-between text-text-quaternary typo-caption1">
      <span>Promoted by daily.dev</span>
      <span className="text-action-plus-default">Remove</span>
    </div>
    <div className="flex flex-col items-start gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className="flex size-14 shrink-0 items-center justify-center rounded-12 bg-action-plus-float text-action-plus-default"
        >
          <BlockIcon secondary size={IconSize.Large} />
        </span>
        <div className="flex flex-col gap-0.5">
          <Typography bold type={TypographyType.Title3}>
            This is the last ad you have to see
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            Plus removes every ad from your feed. This one included.
          </Typography>
        </div>
      </div>
      <GetPlus>Remove ads</GetPlus>
    </div>
  </section>
);

/* 6. Terminal: the dev-brand version, one command and its output. */
const terminalLines = [
  { ok: true, text: `ads removed            ${sample.ads}` },
  { ok: true, text: `titles rewritten        ${sample.clickbait}` },
  { ok: true, text: `muted topics hidden     ${sample.muted}` },
  { ok: true, text: 'custom feeds            unlocked' },
] as const;

export const Terminal = (): ReactElement => {
  const step = useStep(terminalLines.length + 3, 420);
  const typed = step > 0;

  return (
    <section className="flex flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default">
      <div className="flex items-center gap-1.5 border-b border-border-subtlest-tertiary px-3 py-2">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            aria-hidden
            className="size-2.5 rounded-[999px] bg-surface-float"
          />
        ))}
        <span className="ml-2 text-text-quaternary typo-caption1" style={mono}>
          daily.dev
        </span>
      </div>
      <div
        className="flex flex-col gap-1 px-4 py-4 text-text-primary typo-footnote"
        style={mono}
      >
        <div>
          <span className="text-action-plus-default">$ </span>
          <span>dailydev plus enable</span>
          {!typed && (
            <span aria-hidden className="ss-caret ml-0.5 inline-block w-2">
              ▍
            </span>
          )}
        </div>
        {terminalLines.map((line, index) => (
          <div
            key={line.text}
            className={classNames(
              'flex gap-2 whitespace-pre',
              step > index + 1 ? 'plus-perk-in' : 'invisible',
            )}
          >
            <span className="text-action-plus-default">✓</span>
            <span className="text-text-secondary">{line.text}</span>
          </div>
        ))}
        <div
          className={classNames(
            'mt-2 flex items-center justify-between gap-3',
            step > terminalLines.length + 1 ? 'plus-perk-in' : 'invisible',
          )}
        >
          <span className="text-text-tertiary">
            Still scrolling? Done in 0.3s.
          </span>
          <GetPlus />
        </div>
      </div>
    </section>
  );
};

/* 7. Quiet: one word, plenty of air. */
export const Quiet = (): ReactElement => (
  <section
    className={classNames(
      frame,
      'flex flex-col items-center gap-5 px-6 py-10 text-center',
    )}
  >
    <VolumeOffIcon
      aria-hidden
      size={IconSize.XLarge}
      className="text-action-plus-default"
    />
    <div className="flex flex-col gap-2">
      <Typography bold type={TypographyType.Mega2}>
        Quiet.
      </Typography>
      <Typography type={TypographyType.Body} color={TypographyColor.Secondary}>
        Plus is your feed with the volume down. No ads, no ragebait, nothing you
        muted.
      </Typography>
    </div>
    <GetPlus />
  </section>
);

/* 8. Clean title: a live demo of the one perk you can see from here. */
const titlePairs = [
  {
    source: 'Dev Weekly',
    bait: 'You WON’T BELIEVE what this one React hook does',
    clean: 'useTransition keeps inputs responsive during heavy renders',
  },
  {
    source: 'InfraToday',
    bait: 'Kubernetes is DEAD. Here is what replaced it',
    clean: 'A case for running small services on a single VM',
  },
  {
    source: 'CodeBytes',
    bait: '10 Python tricks that will blow your mind (number 7!)',
    clean: 'Ten lesser-known Python standard library helpers',
  },
] as const;

export const CleanTitle = (): ReactElement => {
  const step = useStep(titlePairs.length * 2, 1800, true);
  const pair = titlePairs[Math.floor(step / 2)];
  const showClean = step % 2 === 1;

  return (
    <section
      className={classNames(
        frame,
        'flex flex-col gap-4 p-5 tablet:flex-row tablet:items-center',
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <Typography bold type={TypographyType.Title3}>
            Still scrolling? Half of it is bait
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            Plus rewrites clickbait titles so you can tell at a glance.
          </Typography>
        </div>
        <div className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-background-default px-3 py-2.5">
          <span
            aria-hidden
            className="size-8 shrink-0 rounded-10 bg-surface-float"
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="flex items-center gap-1.5 text-text-quaternary typo-caption1">
              {pair.source}
              <span
                className={classNames(
                  'text-action-plus-default transition-opacity duration-300',
                  showClean ? 'opacity-100' : 'opacity-0',
                )}
              >
                Clean title by Plus
              </span>
            </span>
            <span className="relative block truncate text-text-primary typo-callout">
              <span
                className={classNames(
                  'ss-strike',
                  showClean ? 'ss-strike-on text-text-quaternary' : '',
                )}
              >
                {pair.bait}
              </span>
            </span>
            <span
              key={`${pair.source}-${showClean}`}
              className={classNames(
                'truncate text-text-primary typo-callout',
                showClean ? 'plus-perk-in' : 'hidden',
              )}
            >
              {pair.clean}
            </span>
          </div>
        </div>
      </div>
      <GetPlus className="self-start tablet:self-center" />
    </section>
  );
};

/* 9. Strip: the quiet one-liner. L1 salience, dismissible. */
export const Strip = (): ReactElement => (
  <div className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary py-2 pl-2 pr-1">
    <PlusTile />
    <p className="flex min-w-0 flex-1 items-baseline gap-1 text-text-secondary typo-callout">
      <span className="shrink-0">Still scrolling? Plus</span>
      <span className="min-w-0 flex-1 font-bold text-text-primary">
        <PlusPerkTicker />
      </span>
    </p>
    <GetPlus />
    <CloseButton size={ButtonSize.Small} aria-label="Not now" />
  </div>
);

/* 10. Price: the exit, priced. Real plans, real numbers. */
const plans = [
  {
    id: 'annual',
    name: 'Annual',
    price: '$7.49',
    cadence: '/mo',
    note: '$89.99 billed yearly. Save 24%.',
    caption: 'Popular',
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$9.99',
    cadence: '/mo',
    note: 'Cancel anytime.',
  },
] as const;

export const Price = (): ReactElement => {
  const [selected, setSelected] =
    useState<(typeof plans)[number]['id']>('annual');
  const plan = plans.find((item) => item.id === selected) ?? plans[0];

  return (
    <section className={classNames(frame, 'flex flex-col gap-4 p-5')}>
      <div className="flex flex-col gap-0.5">
        <Typography bold type={TypographyType.Title3}>
          Still scrolling? Here is the exit
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          No ads, clean titles, feeds you can query. Less than a coffee a month.
        </Typography>
      </div>
      <div className="grid gap-2 tablet:grid-cols-2">
        {plans.map((item) => {
          const active = item.id === selected;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => setSelected(item.id)}
              className={classNames(
                'flex items-center justify-between gap-3 rounded-12 border bg-background-default px-4 py-3 text-left transition-colors',
                active
                  ? 'border-action-plus-default'
                  : 'border-border-subtlest-tertiary hover:border-border-subtlest-primary',
              )}
            >
              <span className="flex flex-col">
                <span className="flex items-center gap-2 font-bold text-text-primary typo-callout">
                  {item.name}
                  {'caption' in item && (
                    <span className="rounded-4 bg-action-plus-float px-1.5 text-action-plus-default typo-caption1">
                      {item.caption}
                    </span>
                  )}
                </span>
                <span className="text-text-tertiary typo-footnote">
                  {item.note}
                </span>
              </span>
              <span className="flex items-baseline tabular-nums">
                <span className="font-bold text-text-primary typo-title3">
                  {item.price}
                </span>
                <span className="text-text-tertiary typo-footnote">
                  {item.cadence}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <GetPlus className="self-start">
        Get Plus for {plan.price}
        {plan.cadence}
      </GetPlus>
    </section>
  );
};

/* 11. Depth: a gauge of how far the reader has come, and how much of it was noise. */
export const Depth = (): ReactElement => {
  const depth = useCountUp(sample.postsDeep, 1200);
  const noise = sample.ads + sample.clickbait + sample.muted;
  const ticks = Array.from({ length: 25 }, (_, index) => index);
  const reached = Math.round((depth / sample.postsDeep) * (ticks.length - 1));

  return (
    <section className={classNames(frame, 'flex flex-col gap-4 p-5')}>
      <div className="flex flex-col items-start gap-3 tablet:flex-row tablet:items-end tablet:justify-between">
        <div className="flex flex-col gap-0.5">
          <Typography bold type={TypographyType.Title3}>
            <span className="tabular-nums">{depth}</span> posts deep
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            {noise} of them were ads, bait, or topics you muted. Plus would have
            cut every one.
          </Typography>
        </div>
        <GetPlus />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-end justify-between gap-0.5">
          {ticks.map((tick) => {
            const tall = tick % 6 === 0;
            const lit = tick <= reached;
            return (
              <span
                key={tick}
                aria-hidden
                className={classNames(
                  'w-0.5 rounded-[999px] transition-colors duration-200',
                  tall ? 'h-4' : 'h-2',
                  lit
                    ? 'bg-action-plus-default'
                    : 'bg-border-subtlest-secondary',
                )}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-text-quaternary typo-caption1">
          <span>Top of feed</span>
          <span className="text-action-plus-default">You are here</span>
        </div>
      </div>
    </section>
  );
};

export const variants: Array<{
  name: string;
  lever: string;
  why: string;
  Component: () => ReactElement;
}> = [
  {
    name: 'Shipped',
    lever: 'Position',
    why: 'The version in PR #6868. Quiet card, four feed perks, bacon button. The baseline the others are measured against.',
    Component: Shipped,
  },
  {
    name: 'Flip',
    lever: 'Live demo',
    why: 'A toggle is a promise you can test. The reader sees their own kind of feed with Plus on: the ad row collapses, the bait gets rewritten, the muted topic disappears.',
    Component: Flip,
  },
  {
    name: 'Receipt',
    lever: 'Own numbers',
    why: 'Itemizes the noise on this very page, then totals what Plus removes. Counts would come from the loaded feed items, like the bookmarks strip reads the cache.',
    Component: Receipt,
  },
  {
    name: 'Stopwatch',
    lever: 'Self-awareness',
    why: 'Takes "still scrolling" literally. The timer only ticks while the card is in view, so the number is honest and a little uncomfortable.',
    Component: Stopwatch,
  },
  {
    name: 'Last ad',
    lever: 'Self-awareness',
    why: 'Dressed as the ad card it replaces, with the same Remove link people already use to find Plus. The one ad that argues for removing ads.',
    Component: LastAd,
  },
  {
    name: 'Terminal',
    lever: 'Dev brand',
    why: 'One command, four lines of output. Each line is a perk in the imperative, and the output format makes the numbers feel measured rather than marketed.',
    Component: Terminal,
  },
  {
    name: 'Quiet',
    lever: 'Restraint',
    why: 'One word and a lot of air in a feed that has neither. The contrast is the design.',
    Component: Quiet,
  },
  {
    name: 'Clean title',
    lever: 'Live demo',
    why: 'Shows the one perk visible from inside the feed: a bait title gets struck through and the clean one appears under the "Clean title by Plus" label.',
    Component: CleanTitle,
  },
  {
    name: 'Strip',
    lever: 'Low salience',
    why: 'The L1 version: a single dismissible line with the rotating perk ticker. For readers who should not be interrupted, only reminded.',
    Component: Strip,
  },
  {
    name: 'Price',
    lever: 'Price anchor',
    why: 'Puts the real plans in the feed, Annual selected. Removes the one unknown that keeps people from clicking: what does it cost.',
    Component: Price,
  },
  {
    name: 'Depth',
    lever: 'Own numbers',
    why: 'A gauge of how far the reader has scrolled and how much of it was noise. The ruler fills in bacon as the count rises.',
    Component: Depth,
  },
];
