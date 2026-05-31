import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { HashtagIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';

interface TagHeroProps {
  title: string;
  isLoggedIn: boolean;
  /** Follow / Block buttons + feed options menu, owned by the page. */
  actions: ReactNode;
  sponsoredHero?: ReactNode;
  onGetFeed: () => void;
  occurrences?: number;
  contributorsCount?: number;
  /** sr-only SEO links, kept in the DOM for crawlers. */
  children?: ReactNode;
}

/**
 * Compact tag identity bar. Deliberately small — it states what the page is
 * (the tag, a couple of headline stats, the primary action) and gets out of the
 * way so the actual hub content gets the attention. The "what is this tag"
 * explanation now lives in the About module, not here.
 */
export function TagHero({
  title,
  isLoggedIn,
  actions,
  sponsoredHero,
  onGetFeed,
  occurrences,
  contributorsCount,
  children,
}: TagHeroProps): ReactElement {
  const stats: string[] = [];
  if (occurrences && occurrences > 0) {
    stats.push(`${largeNumberFormat(occurrences) ?? occurrences} posts`);
  }
  if (contributorsCount && contributorsCount > 0) {
    stats.push(`${contributorsCount} contributors`);
  }

  return (
    <header className="mx-4 flex flex-col gap-3">
      {sponsoredHero}
      <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="flex size-12 shrink-0 items-center justify-center rounded-14 bg-surface-float text-text-primary"
          >
            <HashtagIcon size={IconSize.Large} />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="truncate font-bold typo-title1">{title}</h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-text-tertiary typo-footnote">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 animate-scale-down-pulse rounded-full bg-accent-avocado-default" />
                Updated daily
              </span>
              {stats.map((stat) => (
                <span key={stat} className="flex items-center gap-2">
                  <span aria-hidden>·</span>
                  {stat}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {!isLoggedIn && (
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
              onClick={onGetFeed}
              aria-label={`Get my ${title} feed`}
            >
              Get my {title} feed
            </Button>
          )}
          {actions}
        </div>
      </div>
      {children}
    </header>
  );
}
