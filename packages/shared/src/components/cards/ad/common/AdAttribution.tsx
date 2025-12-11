import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { Ad } from '../../../../graphql/posts';

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

  const promotedText = useMemo(
    () =>
      text.split('').map((char, index) => {
        // 50% chance to wrap in a span (fragmentation)
        const isSpan = Math.random() > 0.5;
        // 50% chance to append a zero-width space
        const hasZws = Math.random() > 0.5;

        const content = hasZws ? `${char}\u200B` : char;

        if (isSpan) {
          // eslint-disable-next-line react/no-array-index-key
          return <span key={`scramble-${index}`}>{content}</span>;
        }
        return content;
      }),
    [text],
  );

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
