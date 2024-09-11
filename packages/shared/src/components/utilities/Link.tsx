import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import React, { ReactElement, ReactNode } from 'react';

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
