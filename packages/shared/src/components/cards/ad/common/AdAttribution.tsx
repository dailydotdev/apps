import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { useScrambler } from '../../../../hooks/useScrambler';

interface AdClassName {
  main?: string;
  typo?: string;
}

interface AdAttributionProps {
  className?: AdClassName;
}

export default function AdAttribution({
  className,
}: AdAttributionProps): ReactElement {
  const elementClass = classNames(
    'text-text-quaternary no-underline',
    className?.typo ?? 'typo-footnote',
    className?.main,
  );

  const promotedText = useScrambler('Promoted');

  return (
    <div className={elementClass} suppressHydrationWarning>
      {promotedText}
    </div>
  );
}
