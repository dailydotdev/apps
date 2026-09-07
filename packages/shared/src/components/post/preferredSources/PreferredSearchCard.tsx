import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import { Card, CardTitle } from '../../cards/common/Card';
import { Header } from '../../marketing/cta/common';
import { ButtonSize, ButtonVariant } from '../../buttons/Button';
import { GoogleIcon } from '../../icons';
import LogoIcon from '../../../svg/LogoIcon';
import { usePreferredSource } from '../../../hooks/usePreferredSource';
import { PreferGoogleButton } from './PreferGoogleButton';

/**
 * A glimpse of a Google results page with daily.dev marked Preferred. Drawn in
 * CSS rather than shipped as an asset: it stays crisp at any density, follows
 * the theme, and costs the feed no image request. The G mark is Google's own,
 * unmodified.
 */
export const SearchPreview = ({
  className,
  query = 'cursor agent mode review',
}: {
  className?: string;
  query?: string;
}): ReactElement => (
  <div
    className={classNames(
      'relative overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-subtle',
      className,
    )}
    aria-hidden
  >
    <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary px-3 py-2">
      <GoogleIcon secondary className="size-4 shrink-0" />
      <span className="truncate text-text-secondary typo-footnote">
        {query}
      </span>
    </div>
    <div className="flex flex-col gap-1.5 px-3 pb-3 pt-2.5">
      <div className="flex items-center gap-2">
        <span className="flex size-5 items-center justify-center rounded-6 bg-background-default">
          <LogoIcon className={{ container: 'size-3' }} />
        </span>
        <span className="text-text-primary typo-caption1">daily.dev</span>
        <span className="rounded-6 bg-action-upvote-float px-1.5 py-0.5 font-bold text-action-upvote-default typo-caption2">
          Preferred
        </span>
      </div>
      <span className="text-text-link typo-callout">
        Cursor agent mode: three weeks in production
      </span>
      <span className="h-1.5 w-11/12 rounded-4 bg-surface-float" />
      <span className="h-1.5 w-2/3 rounded-4 bg-surface-float" />
      <div className="mt-2 flex flex-col gap-1.5 opacity-40">
        <span className="h-1.5 w-1/3 rounded-4 bg-surface-float" />
        <span className="h-1.5 w-10/12 rounded-4 bg-surface-float" />
      </div>
    </div>
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-background-subtle to-transparent" />
  </div>
);

/**
 * Fills a feed ad position the ad server could not fill. It never takes a slot
 * from real content — only one that would otherwise render a grey placeholder.
 */
export function PreferredSearchCard({
  fallback = null,
}: {
  /** Rendered instead when the prompt is not eligible — e.g. the placeholder. */
  fallback?: ReactElement | null;
} = {}): ReactElement | null {
  const { isEligible, isReady, onAdd, onDismiss, onImpression } =
    usePreferredSource({ placement: 'feed ad fallback' });

  useEffect(() => {
    if (isEligible) {
      onImpression();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per appearance
  }, [isEligible]);

  if (!isEligible) {
    return fallback;
  }

  return (
    <Card className="p-4">
      <Header tagColor="cabbage" tagText="Google" onClose={onDismiss} />
      <CardTitle className="typo-title3">
        See daily.dev in your Google results
      </CardTitle>
      <SearchPreview className="my-3" />
      <PreferGoogleButton
        className="mt-auto w-full"
        isReady={isReady}
        onAdd={onAdd}
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
      />
    </Card>
  );
}
