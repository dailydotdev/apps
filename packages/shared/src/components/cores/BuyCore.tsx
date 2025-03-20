import type { ReactElement } from 'react';
import React from 'react';
import type { LogStartBuyingCreditsProps } from '../../types';
import { webappUrl } from '../../lib/constants';
import type { Origin } from '../../lib/log';
import { IconSize } from '../Icon';
import { CoinIcon } from '../icons';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../typography/Typography';
import { formatCurrency } from '../../lib/utils';
import Link from '../utilities/Link';
import { getPathnameWithQuery } from '../../lib';
import { useViewSize, ViewSize } from '../../hooks';

type BuyCoreProps = {
  onBuyCoresClick: (props: LogStartBuyingCreditsProps) => void;
  amount: number;
  price?: number;
  origin: Origin;
  pid?: string;
};

export const BuyCore = ({
  onBuyCoresClick,
  amount,
  price,
  origin,
  pid,
}: BuyCoreProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const params = new URLSearchParams();
  if (pid) {
    params.append('pid', pid);
  }
  const href = getPathnameWithQuery(
    `${webappUrl}cores${isMobile ? '/payment' : ''}`,
    params,
  );

  return (
    <Link href={href}>
      <a
        href={href}
        className="flex flex-1 flex-col items-center rounded-14 bg-surface-float p-2"
        onClick={() => onBuyCoresClick({ amount, origin })}
      >
        <CoinIcon
          size={IconSize.XLarge}
          className="mb-1 text-accent-bun-default"
        />
        <Typography type={TypographyType.Title3} bold>
          {amount}
        </Typography>
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Tertiary}
        >
          {typeof price !== 'undefined'
            ? formatCurrency(price, { currency: 'USD' })
            : '~'}
        </Typography>
      </a>
    </Link>
  );
};
