import React, { ReactElement } from 'react';
import { CardLink } from './Card';

export type PostLinkProps = {
  href: string;
  title: string;
  openNewTab: boolean;
  onLinkClick?: (e?: React.MouseEvent) => unknown;
};

export default function PostLink({
  href,
  title,
  openNewTab,
  onLinkClick,
}: PostLinkProps): ReactElement {
  return (
    <CardLink
      href={href}
      title={title}
      {...(openNewTab
        ? { target: '_blank', rel: 'noopener' }
        : { target: '_self' })}
      onClick={onLinkClick}
      onMouseUp={(event) => event.button === 1 && onLinkClick?.(event)}
    />
  );
}
