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
 * The daily.dev favicon, rebuilt in CSS: the shipped icon is a PNG in each
 * app's `public/`, which a shared component cannot reach, and this preview
 * needs the real one — Google puts a site's actual favicon beside its result,
 * so the bare white logo mark read as neither Google nor daily.dev.
 *
 * The two colours are sampled from `favicon-32x32.png` and are deliberately
 * literals: they mirror an image asset, not a theme token, so they must not
 * follow the app's light/dark switch.
 */
const Favicon = (): ReactElement => (
  <span
    className="flex size-4 shrink-0 items-center justify-center rounded-4"
    style={{ background: 'linear-gradient(180deg, #0e1217 0%, #af27dc 100%)' }}
  >
    <LogoIcon className={{ container: 'size-2.5', group: 'fill-white' }} />
  </span>
);

/**
 * A glimpse of a Google results page with daily.dev marked Preferred. Drawn in
 * CSS rather than shipped as an asset: it stays crisp at any density and costs
 * the feed no image request. The G mark is Google's own, unmodified.
 *
 * Deliberately light in both themes. This is a picture *of Google*, not a piece
 * of our UI — themed dark it stopped reading as a search result at all, which
 * is the one job it has. Hence the literal colours: Google's own result palette
 * rather than our tokens, which would flip with the app.
 */
export const SearchPreview = ({
  className,
  query = 'cursor agent mode review',
  title = 'Cursor agent mode: three weeks in production',
}: {
  className?: string;
  query?: string;
  title?: string;
}): ReactElement => (
  <div
    className={classNames(
      'relative overflow-hidden rounded-12 border',
      className,
    )}
    style={{ background: '#ffffff', borderColor: '#dfe1e5' }}
    aria-hidden
  >
    <div
      className="flex items-center gap-2 border-b px-3 py-2"
      style={{ borderColor: '#ecedef' }}
    >
      <GoogleIcon secondary className="size-4 shrink-0" />
      <span className="truncate typo-footnote" style={{ color: '#5f6368' }}>
        {query}
      </span>
    </div>
    <div className="flex flex-col gap-1.5 px-3 pb-3 pt-2.5">
      <div className="flex items-center gap-2">
        <Favicon />
        <span className="typo-caption1" style={{ color: '#202124' }}>
          daily.dev
        </span>
        <span
          className="rounded-6 px-1.5 py-0.5 font-bold typo-caption2"
          style={{ background: '#e6f4ea', color: '#137333' }}
        >
          Preferred
        </span>
      </div>
      <span className="typo-callout" style={{ color: '#1a0dab' }}>
        {title}
      </span>
      <span
        className="h-1.5 w-11/12 rounded-4"
        style={{ background: '#ecedef' }}
      />
      <span
        className="h-1.5 w-2/3 rounded-4"
        style={{ background: '#ecedef' }}
      />
      <div className="opacity-60 mt-2 flex flex-col gap-1.5">
        <span
          className="h-1.5 w-1/3 rounded-4"
          style={{ background: '#ecedef' }}
        />
        <span
          className="h-1.5 w-10/12 rounded-4"
          style={{ background: '#ecedef' }}
        />
      </div>
    </div>
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
