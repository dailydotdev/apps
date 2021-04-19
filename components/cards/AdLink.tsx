import React, { ReactElement } from 'react';
import { Ad } from '../../graphql/posts';
import { CardLink } from './Card';

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
      onClick={() => onLinkClick?.(ad)}
      onMouseUp={(event) => event.button === 1 && onLinkClick?.(ad)}
    />
  );
}
