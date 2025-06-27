import type { PropsWithChildren, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { LazyImage } from '../../../components/LazyImage';
import { creditCardsImage } from '../../../lib/image';

interface CreditCardsProps extends PropsWithChildren {
  className?: string;
}

export function CreditCards({
  children,
  className,
}: CreditCardsProps): ReactElement {
  return (
    <div className={classNames('flex flex-col items-center', className)}>
      {children || (
        <span className="mb-2 typo-footnote">
          Guaranteed safe & secure checkout
        </span>
      )}
      <LazyImage
        eager
        ratio="8.5%"
        imgSrc={creditCardsImage}
        imgAlt="Supported payment methods"
        className="w-full max-w-60"
        fit="contain"
      />
    </div>
  );
}
