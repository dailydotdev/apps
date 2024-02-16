import React, { ReactElement, AnchorHTMLAttributes, ReactNode } from 'react';
import Link, { LinkProps } from 'next/link';

interface SelectableLinkProps {
  href: string;
  linkProps?: Omit<LinkProps, 'href'>;
  anchorProps?: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;
  children: ReactNode;
}

export function SelectableLink({
  href,
  linkProps,
  anchorProps,
  children,
}: SelectableLinkProps): ReactElement {
  const onLinkClick = (e: React.MouseEvent) => {
    const selection = globalThis?.window?.getSelection();
    const hasSelection = selection?.anchorOffset !== selection?.focusOffset;

    if (hasSelection) {
      e.preventDefault();
    }
  };

  return (
    <Link href={href} {...linkProps}>
      <a href={href} draggable="false" onClick={onLinkClick} {...anchorProps}>
        {children}
      </a>
    </Link>
  );
}
