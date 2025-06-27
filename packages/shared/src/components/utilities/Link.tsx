import type { LinkProps as NextLinkProps } from 'next/link';
import NextLink from 'next/link';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';

interface LinkProps extends NextLinkProps {
  children?: ReactElement | ReactNode | string;
}

const Link = ({ href, children, ...props }: LinkProps): ReactElement => {
  return (
    <NextLink legacyBehavior href={href} {...props}>
      {children}
    </NextLink>
  );
};

export type { LinkProps };
export default Link;
