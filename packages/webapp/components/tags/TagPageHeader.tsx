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
   * regular header. Logged-in members keep the existing, familiar header.
   */
  isLoggedIn: boolean;
  /** Follow / Block buttons + feed options menu, owned by the page. */
  actions: ReactNode;
  /** Sponsored brand hero, rendered only when the tag is sponsored. */
  sponsoredHero?: ReactNode;
  /** Anonymous primary CTA: build a personalized feed seeded with this tag. */
  onGetFeed: () => void;
  /** Related tags / build-your-feed, sr-only SEO links, roadmap card, etc. */
  children?: ReactNode;
}

/**
 * Redesigned tag page header.
 *
 * Existing members see essentially the same compact header they have today
 * (icon + title + actions + description). Anonymous visitors additionally get a
 * value-proposition headline, social proof, and a single clear "Get my feed"
 * CTA so the daily.dev "aha moment" is visible the instant they land from SEO
 * or a shared link — without removing any of the SEO-relevant content.
 */
export function TagPageHeader({
  title,
  description,
  isLoggedIn,
  actions,
  sponsoredHero,
  onGetFeed,
  children,
}: TagPageHeaderProps): ReactElement {
  return (
    <header
      className={classNames(
        'mx-4 flex flex-col gap-4 rounded-16 p-0',
        !isLoggedIn &&
          'border border-border-subtlest-tertiary bg-gradient-to-b from-surface-float to-transparent p-4 laptop:p-6',
      )}
    >
      {sponsoredHero}
      <div className="flex w-full items-center font-bold">
        <HashtagIcon size={IconSize.XXLarge} />
        <h1 className="ml-2 w-fit typo-title2">{title}</h1>
      </div>

      {!isLoggedIn && (
        <p className="max-w-2xl typo-title3">
          Everything happening in {title}, in one feed.
        </p>
      )}

      {description && <p className="typo-body">{description}</p>}

      {!isLoggedIn && (
        <p className="text-text-tertiary typo-footnote">
          The best {title} posts, videos, and discussions — curated daily by
          millions of developers.
        </p>
      )}

      <div className="flex flex-row flex-wrap items-center gap-3">
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

      {children}
    </header>
  );
}
