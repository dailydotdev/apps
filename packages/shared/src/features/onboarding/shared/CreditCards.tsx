import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { LazyImage } from '../../../components/LazyImage';
import { creditCardsImage } from '../../../lib/image';

interface CreditCardsProps {
  className?: string;
}

export function CreditCards({ className }: CreditCardsProps): ReactElement {
  return (
    <div className={classNames('flex flex-col items-center', className)}>
      <span className="mb-2 typo-footnote">
        Guaranteed safe & secure checkout
      </span>
      <LazyImage
        eager
        ratio="8.5%"
        imgSrc={creditCardsImage}
        imgAlt="Supported payment methods"
        className="w-full max-w-60 object-cover"
      />
    </div>
  );
}
