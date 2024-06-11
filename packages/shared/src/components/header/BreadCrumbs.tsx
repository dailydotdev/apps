import React, { PropsWithChildren, ReactElement } from 'react';
import classed from '../../lib/classed';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { HomeIcon } from '../icons';
import { WithClassNameProps } from '../utilities';

const BreadCrumbsWrapper = classed(
  'div',
  'hidden h-10 gap-0.5 items-center p-1.5 text-surface-secondary laptop:flex',
);

export const BreadCrumbs = ({
  children,
  className,
}: PropsWithChildren<WithClassNameProps>): ReactElement => {
  return (
    <BreadCrumbsWrapper className={className}>
      <Button
        variant={ButtonVariant.Tertiary}
        icon={<HomeIcon secondary />}
        tag="a"
        href={process.env.NEXT_PUBLIC_WEBAPP_URL}
        size={ButtonSize.XSmall}
      />
      <span>/</span>
      <div className="flex flex-row items-center gap-1 px-2 font-bold text-text-primary typo-callout">
        {children}
      </div>
    </BreadCrumbsWrapper>
  );
};
