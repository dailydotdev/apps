import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';

interface TagMastheadProps {
  title: string;
  isLoggedIn: boolean;
  actions: ReactNode;
  sponsoredHero?: ReactNode;
  onGetFeed: () => void;
  description?: string;
  occurrences?: number;
  contributorsCount?: number;
  /** sr-only SEO links, kept in the DOM for crawlers. */
  children?: ReactNode;
}

/**
 * Editorial masthead — the tag page presented like the front page of a
 * publication dedicated to the topic. A wordmark, a one-line "dek" of live
 * stats, a rule, and an italic standfirst (the topic definition). No boxed
 * cover; the type and the rule do the work.
 */
export function TagMasthead({
  title,
  isLoggedIn,
  actions,
  sponsoredHero,
  onGetFeed,
  description,
  occurrences,
  contributorsCount,
  children,
}: TagMastheadProps): ReactElement {
  const dek: string[] = ['Updated daily'];
  if (occurrences && occurrences > 0) {
    dek.unshift(`${largeNumberFormat(occurrences) ?? occurrences} posts`);
  }
  if (contributorsCount && contributorsCount > 0) {
    dek.push(`${contributorsCount} contributors`);
  }

  return (
    <header className="mx-4 flex flex-col gap-5">
      {sponsoredHero}
      <div className="flex flex-col gap-4 border-b border-border-subtlest-tertiary pb-5 tablet:flex-row tablet:items-end tablet:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <span className="uppercase tracking-widest text-text-quaternary typo-caption1">
            daily.dev — Topic desk
          </span>
          <h1 className="break-words font-bold typo-title1 tablet:typo-mega3">
            <span aria-hidden className="text-text-quaternary">
              #
            </span>
            {title}
          </h1>
          <p className="text-text-tertiary typo-callout">{dek.join(' · ')}</p>
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
      {description && (
        <p className="max-w-3xl text-balance font-light italic text-text-secondary typo-title3">
          {description}
        </p>
      )}
      {children}
    </header>
  );
}
