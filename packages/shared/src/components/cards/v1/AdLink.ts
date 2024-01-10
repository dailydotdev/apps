import { AnchorHTMLAttributes } from 'react';
import { Ad } from '../../../graphql/posts';
import { combinedClicks } from '../../../lib/click';

export default function getLinkProps(
  ad: Ad,
  onLinkClick: (ad: Ad) => unknown,
): AnchorHTMLAttributes<HTMLAnchorElement> {
  return {
    href: ad.link,
    target: '_blank',
    rel: 'noopener',
    title: ad.description,
    ...combinedClicks(() => onLinkClick?.(ad)),
  };
}
