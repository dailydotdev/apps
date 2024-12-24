import type { ReactElement } from 'react';
import React from 'react';
import type { Ad } from '../../../../graphql/posts';
import { CardLink } from '../../common/Card';
import { combinedClicks } from '../../../../lib/click';

export type AdLinkProps = {
  ad: Ad;
  onLinkClick?: (ad: Ad) => unknown;
};

export default function AdLink({ ad, onLinkClick }: AdLinkProps): ReactElement {
  return (
    <CardLink
      href={ad.link}
      target="_blank"
      rel="noopener"
      title={ad.description}
      {...combinedClicks(() => onLinkClick?.(ad))}
    />
  );
}
