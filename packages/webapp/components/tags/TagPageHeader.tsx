import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { HashtagIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

interface TagPageHeaderProps {
  title: string;
  description?: string;
  /**
   * Logged-out visitors (mostly SEO / shared-link traffic) get the
   * conversion-focused value proposition and a single primary CTA on top of the
   * regular header. Logged-in members keep the familiar, content-first header.
   */
  isLoggedIn: boolean;
  /** Follow / Block buttons + feed options menu, owned by the page. */
  actions: ReactNode;
  /** Sponsored brand hero, rendered only when the tag is sponsored. */
  sponsoredHero?: ReactNode;
  /** Anonymous primary CTA: build a personalized feed seeded with this tag. */
  onGetFeed: () => void;
  relatedTopicsCount?: number;
  contributorsCount?: number;
  /** sr-only SEO links, kept in the DOM for crawlers. */
  children?: ReactNode;
}

const MetaChip = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="flex items-center rounded-8 bg-surface-float px-2 py-1 text-text-tertiary typo-caption1">
    {children}
  </span>
);

/**
 * Tag page hero — the topic's identity at a glance.
 *
 * Content-first for everyone: a clear icon/title lockup, scannable meta, a
 * readable description, and the follow/feed actions. Anonymous visitors get an
 * additional value-proposition band with one primary "Get my feed" CTA so the
 * daily.dev payoff is obvious the instant they arrive from SEO or a shared link.
 */
export function TagPageHeader({
  title,
  description,
  isLoggedIn,
  actions,
  sponsoredHero,
  onGetFeed,
  relatedTopicsCount,
  contributorsCount,
  children,
}: TagPageHeaderProps): ReactElement {
  return (
    <header className="mx-4 flex flex-col gap-5">
      {sponsoredHero}
      <div className="flex flex-col gap-4 tablet:flex-row tablet:items-start tablet:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden
            className="flex size-12 shrink-0 items-center justify-center rounded-14 bg-surface-float text-text-primary"
          >
            <HashtagIcon size={IconSize.Large} />
          </span>
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="break-words font-bold typo-title1">{title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <MetaChip>Updated daily</MetaChip>
              {!!relatedTopicsCount && (
                <MetaChip>{relatedTopicsCount} related topics</MetaChip>
              )}
              {!!contributorsCount && (
                <MetaChip>{contributorsCount} top contributors</MetaChip>
              )}
            </div>
          </div>
        </div>
        <div className="shrink-0">{actions}</div>
      </div>

      {description && (
        <p className="max-w-3xl text-text-secondary typo-body">{description}</p>
      )}

      {!isLoggedIn && (
        <div
          className={classNames(
            'flex flex-col items-start gap-3 rounded-16 border border-border-subtlest-tertiary p-4 tablet:p-5',
            'bg-gradient-to-br from-surface-float to-transparent',
          )}
        >
          <p className="font-bold typo-title3">
            Everything happening in {title}, in one feed.
          </p>
          <p className="text-text-tertiary typo-callout">
            The best {title} posts, videos, and discussions — curated daily by
            millions of developers.
          </p>
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            onClick={onGetFeed}
            aria-label={`Get my ${title} feed`}
          >
            Get my {title} feed
          </Button>
        </div>
      )}

      {children}
    </header>
  );
}
