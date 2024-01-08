import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Ad } from '../../graphql/posts';

interface AdClassName {
  main?: string;
  typo?: string;
}

export interface AdAttributionProps {
  ad: Ad;
  className?: AdClassName;
  typoClassName?: string;
}

export default function AdAttribution({
  ad,
  className,
  typoClassName,
}: AdAttributionProps): ReactElement {
  const elementClass = classNames(
    'text-theme-label-quaternary no-underline',
    className.typo ?? 'typo-footnote',
    className.main,
  );
  if (ad.referralLink) {
    return (
      <a
        href={ad.referralLink}
        target="_blank"
        rel="noopener"
        className={elementClass}
      >
        Promoted by {ad.source}
      </a>
    );
  }

  return <div className={elementClass}>Promoted</div>;
}
