import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Ad } from '../../graphql/posts';

export type AdAttributionProps = {
  ad: Ad;
  className?: string;
  typoClassName?: string;
};

export default function AdAttribution({
  ad,
  className,
  typoClassName,
}: AdAttributionProps): ReactElement {
  const elementClass = classNames(
    'text-theme-label-quaternary no-underline',
    typoClassName ?? 'typo-footnote',
    className,
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
