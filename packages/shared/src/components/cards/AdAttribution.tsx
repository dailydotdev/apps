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
}

export default function AdAttribution({
  ad,
  className,
}: AdAttributionProps): ReactElement {
  const elementClass = classNames(
    'text-text-quaternary no-underline',
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
