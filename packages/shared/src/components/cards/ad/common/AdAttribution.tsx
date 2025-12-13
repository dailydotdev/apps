import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import type { Ad } from '../../../../graphql/posts';
import { useScrambler } from '../../../../hooks/useScrambler';

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
  const elementClass = classNames(
    'text-text-quaternary no-underline',
    className?.typo ?? 'typo-footnote',
    className?.main,
  );

  const text = ad.referralLink ? `Promoted by ${ad.source}` : 'Promoted';
  const promotedText = useScrambler(text);

  if (ad.referralLink) {
    return (
      <a
        href={ad.referralLink}
        target="_blank"
        rel="noopener"
        className={elementClass}
        suppressHydrationWarning
      >
        {promotedText}
      </a>
    );
  }

  return (
    <div className={elementClass} suppressHydrationWarning>
      {promotedText}
    </div>
  );
}
