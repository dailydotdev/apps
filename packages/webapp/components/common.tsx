import React, { ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import classed from '@dailydotdev/shared/src/lib/classed';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { Card } from '@dailydotdev/shared/src/components/cards/Card';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib';

interface ListItemProps {
  title: string;
  children: ReactNode;
  className?: string;
}

interface ListItemLinkProps extends Omit<ListItemProps, 'title'> {
  href: string;
  index: number;
}

export const ListItem = ({
  index,
  href,
  children,
  className,
}: ListItemLinkProps): ReactElement => {
  return (
    <li className={className}>
      <Link href={href} passHref key={href} prefetch={false}>
        <a className="flex w-full flex-row items-center rounded-8 px-2 hover:bg-accent-pepper-subtler">
          <span className="inline-flex min-w-4 text-text-quaternary">
            {largeNumberFormat(index)}
          </span>
          {children}
        </a>
      </Link>
    </li>
  );
};

const TopListCardElement = classed(Card, '!p-4 !max-h-none h-fit');
const TopListMobileDiv = classed(
  'div',
  'flex flex-col border-b border-b-border-subtlest-tertiary p-4',
);

export const TopList = ({
  title,
  children,
  className,
}: ListItemProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const Wrapper = isMobile ? TopListMobileDiv : TopListCardElement;
  return (
    <Wrapper className={className}>
      <h3 className="mb-2 font-bold typo-title3">{title}</h3>
      <ol className="typo-body">{children}</ol>
    </Wrapper>
  );
};
