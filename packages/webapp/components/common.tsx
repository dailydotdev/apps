import React, { ReactElement } from 'react';
import Link from 'next/link';
import classed from '@dailydotdev/shared/src/lib/classed';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { Card } from '@dailydotdev/shared/src/components/cards/Card';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib';

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

const TopListCardElement = classed(Card, '!p-4 !max-h-none');
const TopListMobileDiv = classed(
  'div',
  'flex flex-col border-b border-b-border-subtlest-tertiary p-4',
);

export const TopList = ({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactElement;
  className?: string;
}): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const Wrapper = isMobile ? TopListMobileDiv : TopListCardElement;
  return (
    <Wrapper className={className}>
      <h3 className="mb-2 font-bold typo-title3">{title}</h3>
      <ol className="typo-body">{children}</ol>
    </Wrapper>
  );
};
