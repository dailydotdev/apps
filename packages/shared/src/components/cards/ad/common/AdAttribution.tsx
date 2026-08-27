import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import type { Ad } from '../../../../graphql/posts';
import { useScrambler } from '../../../../hooks/useScrambler';
import { useAdLabel } from '../../../../features/monetization/useAdLabel';

/**
 * Minimum room between the ad copy and the disclosure line. The grid card
 * pushes the disclosure down with a flex spacer, which collapses to nothing on
 * a long creative and leaves the line touching the title.
 */
export const adAttributionSpacing = 'mt-3';

interface AdClassName {
  main?: string;
  typo?: string;
}

interface AdAttributionProps {
  ad: Ad;
  className?: AdClassName;
}

export default function AdAttribution({
  ad,
  className,
}: AdAttributionProps): ReactElement {
  const { hideAdvertiser } = useAdLabel();
  const elementClass = classNames(
    'text-text-quaternary no-underline',
    className?.typo ?? 'typo-footnote',
    className?.main,
  );

  const controlText = ad.referralLink ? `Promoted by ${ad.source}` : 'Promoted';
  const promotedText = useScrambler(hideAdvertiser ? 'Ad' : controlText);

  // The referral link points at the advertiser, so it only ships with the
  // control wording that already names them.
  if (ad.referralLink && !hideAdvertiser) {
    return (
      <a
        href={ad.referralLink}
        target="_blank"
        rel="noopener"
        className={elementClass}
        data-testid="adAttribution"
        suppressHydrationWarning
      >
        {promotedText}
      </a>
    );
  }

  return (
    <div
      className={elementClass}
      data-testid="adAttribution"
      suppressHydrationWarning
    >
      {promotedText}
    </div>
  );
}
