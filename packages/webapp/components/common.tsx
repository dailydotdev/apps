import React, { ReactElement } from 'react';
import Link from 'next/link';
import classed from '@dailydotdev/shared/src/lib/classed';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { HomeIcon } from '@dailydotdev/shared/src/components/icons';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { Card } from '@dailydotdev/shared/src/components/cards/Card';

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

const BreadCrumbsWrapper = classed(
  'div',
  'hidden h-10 items-center p-1.5 text-border-subtlest-tertiary laptop:flex',
);

export const BreadCrumbs = ({
  children,
}: {
  children: ReactElement;
}): ReactElement => {
  return (
    <BreadCrumbsWrapper>
      <Button
        variant={ButtonVariant.Tertiary}
        icon={<HomeIcon secondary />}
        tag="a"
        href={process.env.NEXT_PUBLIC_WEBAPP_URL}
        size={ButtonSize.XSmall}
      />
      /{children}
    </BreadCrumbsWrapper>
  );
};

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
  const MobileDiv = classed(
    'div',
    'flex flex-col border-b border-b-border-subtlest-tertiary p-4',
    className,
  );
  const CardElement = classed(Card, '!p-4 !max-h-none', className);
  const Wrapper = isMobile ? MobileDiv : CardElement;
  return (
    <Wrapper>
      <h3 className="mb-2 font-bold typo-title3">{title}</h3>
      <ol className="typo-body">{children}</ol>
    </Wrapper>
  );
};
