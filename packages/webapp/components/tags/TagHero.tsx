import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import styles from './tagShowcase.module.css';

interface TagHeroProps {
  title: string;
  isLoggedIn: boolean;
  /** Follow / Block buttons + feed options menu, owned by the page. */
  actions: ReactNode;
  sponsoredHero?: ReactNode;
  onGetFeed: () => void;
  occurrences?: number;
  relatedTopicsCount?: number;
  contributorsCount?: number;
  /** sr-only SEO links, kept in the DOM for crawlers. */
  children?: ReactNode;
}

const formatStat = (value: number): string =>
  largeNumberFormat(value) ?? `${value}`;

/**
 * Animated count-up. SSR (and the very first client render) shows the final
 * value so crawlers and no-JS users see real numbers; the ramp only runs after
 * mount via requestAnimationFrame.
 */
const CountUp = ({ value }: { value: number }): ReactElement => {
  const [display, setDisplay] = useState(value);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return undefined;
    }
    startedRef.current = true;

    const duration = 900;
    let raf = 0;
    let startTs: number | null = null;

    const tick = (ts: number) => {
      if (startTs === null) {
        startTs = ts;
      }
      const progress = Math.min(1, (ts - startTs) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(value * eased));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{formatStat(display)}</>;
};

interface HeroStat {
  key: string;
  value: number;
  label: string;
}

/**
 * Cinematic tag hero — the page's "wow" moment.
 *
 * A full-width panel with an ambient drifting gradient, a live pulse, a
 * developer-flavored terminal line, a giant wordmark, and animated count-up
 * stats. Built to make a developer feel they've landed on the living home of a
 * topic, not a generic feed header.
 */
export function TagHero({
  title,
  isLoggedIn,
  actions,
  sponsoredHero,
  onGetFeed,
  occurrences,
  relatedTopicsCount,
  contributorsCount,
  children,
}: TagHeroProps): ReactElement {
  const stats: HeroStat[] = [];
  if (occurrences && occurrences > 0) {
    stats.push({ key: 'posts', value: occurrences, label: 'Posts' });
  }
  if (contributorsCount && contributorsCount > 0) {
    stats.push({
      key: 'contributors',
      value: contributorsCount,
      label: 'Contributors',
    });
  }
  if (relatedTopicsCount && relatedTopicsCount > 0) {
    stats.push({ key: 'topics', value: relatedTopicsCount, label: 'Topics' });
  }

  return (
    <header className="mx-4 flex animate-fade-slide-up flex-col gap-4">
      <div className="relative overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-surface-float">
        <div
          aria-hidden
          style={{ opacity: 0.16 }}
          className={classNames(
            styles.drift,
            'pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-cabbage-default via-accent-onion-default to-accent-bacon-default',
          )}
        />
        <div className="relative z-1 flex flex-col gap-6 p-6 tablet:p-10">
          {sponsoredHero}

          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 rounded-8 bg-overlay-primary-pepper px-2.5 py-1 text-text-primary typo-caption1">
              <span className="size-2 animate-scale-down-pulse rounded-full bg-accent-avocado-default" />
              Live · curated daily
            </span>
            <code className="rounded-8 border border-border-subtlest-tertiary bg-background-default px-2.5 py-1 font-mono text-text-tertiary typo-caption1">
              ~/feed $ follow #{title}
              <span className="ml-0.5 inline-block animate-scale-down-pulse">
                ▋
              </span>
            </code>
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            <h1 className="break-words font-bold typo-mega3 tablet:typo-mega1">
              <span aria-hidden className="text-brand-default">
                #
              </span>
              {title}
            </h1>
            <p className="max-w-2xl text-text-secondary typo-title3">
              {isLoggedIn
                ? `The pulse of ${title} — the best posts, videos, and discussions, in one place.`
                : `Everything happening in ${title}, in one feed — curated by millions of developers.`}
            </p>
          </div>

          {stats.length > 0 && (
            <dl className="flex flex-wrap gap-x-8 gap-y-3">
              {stats.map((stat) => (
                <div key={stat.key} className="flex flex-col">
                  <dd className="font-bold typo-title1 tablet:typo-mega3">
                    <CountUp value={stat.value} />
                  </dd>
                  <dt className="text-text-tertiary typo-footnote">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {!isLoggedIn && (
              <Button
                variant={ButtonVariant.Primary}
                size={ButtonSize.Large}
                onClick={onGetFeed}
                aria-label={`Get my ${title} feed`}
              >
                Get my {title} feed
              </Button>
            )}
            {actions}
          </div>
        </div>
      </div>
      {children}
    </header>
  );
}
