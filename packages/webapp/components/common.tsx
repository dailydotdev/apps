import React, { ReactElement } from 'react';
import Link from 'next/link';
import classed from '@dailydotdev/shared/src/lib/classed';

export const ListItem = ({
  index,
  href,
  children,
  className,
}: {
  index: number;
  href: string;
  children: ReactElement;
  className?: string;
}): ReactElement => {
  return (
    <li className={className}>
      <Link href={href} passHref key={href} prefetch={false}>
        <a className="flex w-full flex-row items-center">
          <span className="inline-flex w-4 text-text-quaternary">{index}</span>
          {children}
        </a>
      </Link>
    </li>
  );
};

export const BreadCrumbsWrapper = classed(
  'div',
  'hidden h-10 items-center p-1.5 text-border-subtlest-tertiary laptop:flex',
);
