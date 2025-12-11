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

const ZWS = '\u200B';
const useScrambledText = (text: string) => {
  return useMemo(() => {
    return text.split('').map((char, index) => {
      // 50% chance to wrap in a span (fragmentation)
      const isSpan = Math.random() > 0.5;
      // 50% chance to append a zero-width space
      const hasZws = Math.random() > 0.5;

      const content = hasZws ? char + ZWS : char;

      if (isSpan) {
        // eslint-disable-next-line react/no-array-index-key
        return <span key={index}>{content}</span>;
      }
      return content;
    });
  }, [text]);
};

export default function AdAttribution({
  ad,
  className,
}: AdAttributionProps): ReactElement {
  const elementClass = classNames(
    'text-text-quaternary no-underline',
    className?.typo ?? 'typo-footnote',
    className?.main,
  );
  const promotedText = useScrambledText('Promoted');
  if (ad.referralLink) {
    return (
      <a
        href={ad.referralLink}
        target="_blank"
        rel="noopener"
        className={elementClass}
        suppressHydrationWarning
      >
        {promotedText} by {ad.source}
      </a>
    );
  }

  return (
    <div className={elementClass} suppressHydrationWarning>
      {promotedText}
    </div>
  );
}
