import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';

interface TagHubHeaderProps {
  title: string;
  isLoggedIn: boolean;
  actions: ReactNode;
  sponsoredHero?: ReactNode;
  onGetFeed: () => void;
  occurrences?: number;
  contributorsCount?: number;
  /** sr-only SEO links, kept in the DOM for crawlers. */
  children?: ReactNode;
}

/**
 * Tag hub header in the native briefing-home style: a bold title, a one-line
 * stat "dek", the primary action, and a short standfirst — closed by a rule.
 */
export function TagHubHeader({
  title,
  isLoggedIn,
  actions,
  sponsoredHero,
  onGetFeed,
  occurrences,
  contributorsCount,
  children,
}: TagHubHeaderProps): ReactElement {
  const dek: string[] = [];
  if (occurrences && occurrences > 0) {
    dek.push(`${largeNumberFormat(occurrences) ?? occurrences} posts`);
  }
  dek.push('Updated daily');
  if (contributorsCount && contributorsCount > 0) {
    dek.push(`${contributorsCount} contributors`);
  }

  return (
    <header className="mx-4 flex flex-col gap-3 border-b border-border-subtlest-tertiary pb-4">
      {sponsoredHero}
      <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <Typography tag={TypographyTag.H1} type={TypographyType.Title2} bold>
            <span aria-hidden className="text-text-quaternary">
              #
            </span>
            {title}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {dek.join(' · ')}
          </Typography>
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
