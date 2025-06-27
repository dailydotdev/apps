// eslint-disable-next-line no-restricted-imports
import type { LinkProps as NextLinkProps } from 'next/link';
// eslint-disable-next-line no-restricted-imports
import NextLink from 'next/link';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { WithClassNameProps } from './common';

interface LinkProps extends NextLinkProps, WithClassNameProps {
  target?: string;
  rel?: string;
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
