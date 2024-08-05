import React, { PropsWithChildren, ReactElement } from 'react';
import classed from '../../lib/classed';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { HomeIcon } from '../icons';
import { WithClassNameProps } from '../utilities';

const BreadCrumbsWrapper = classed(
  'nav',
  'hidden h-10 gap-0.5 items-center px-1.5 text-surface-secondary laptop:flex',
);

export const BreadCrumbs = ({
  children,
  className,
}: PropsWithChildren<WithClassNameProps>): ReactElement => {
  return (
    <BreadCrumbsWrapper aria-label="breadcrumbs" className={className}>
      <ol className="flex-1 items-center gap-0.5 laptop:flex">
        <li className="flex flex-row items-center gap-0.5">
          <Button
            variant={ButtonVariant.Tertiary}
            icon={<HomeIcon secondary />}
            tag="a"
            href={process.env.NEXT_PUBLIC_WEBAPP_URL}
            size={ButtonSize.XSmall}
          />
          <span aria-hidden>/</span>
        </li>
        <li
          className="flex flex-row items-center gap-1 px-2 font-bold text-text-primary typo-callout"
          aria-current="page"
        >
          {children}
        </li>
      </ol>
    </BreadCrumbsWrapper>
  );
};
