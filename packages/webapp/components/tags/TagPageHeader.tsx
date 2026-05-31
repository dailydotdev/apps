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
  /** sr-only SEO links, kept in the DOM for crawlers. */
  children?: ReactNode;
}

/**
 * Tag page hero — the topic's identity and primary action.
 *
 * Intentionally compact: the icon/title lockup plus follow/feed actions. The
 * substance (key facts, overview, FAQ) lives in dedicated sections below so the
 * page reads as an authoritative topic hub rather than a feed with a banner.
 * Anonymous visitors get an extra value-proposition band with one clear CTA.
 */
export function TagPageHeader({
  title,
  isLoggedIn,
  actions,
  sponsoredHero,
  onGetFeed,
  children,
}: TagPageHeaderProps): ReactElement {
  return (
    <header className="mx-4 flex flex-col gap-4">
      {sponsoredHero}
      <div className="flex flex-col gap-4 tablet:flex-row tablet:items-center tablet:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="flex size-12 shrink-0 items-center justify-center rounded-14 bg-surface-float text-text-primary"
          >
            <HashtagIcon size={IconSize.Large} />
          </span>
          <h1 className="break-words font-bold typo-title1">{title}</h1>
        </div>
        <div className="shrink-0">{actions}</div>
      </div>

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
