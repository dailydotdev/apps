import type { ReactElement } from 'react';
import React from 'react';
import type { LogStartBuyingCreditsProps } from '../../types';
import { webappUrl } from '../../lib/constants';
import type { Origin } from '../../lib/log';
import { IconSize } from '../Icon';
import { CoreIcon } from '../icons';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../typography/Typography';
import { formatCoresCurrency } from '../../lib/utils';
import Link from '../utilities/Link';
import { getPathnameWithQuery } from '../../lib';
import { useViewSize, ViewSize } from '../../hooks';

type BuyCoreProps = {
  onBuyCoresClick: (props: LogStartBuyingCreditsProps) => void;
  amount: number;
  priceFormatted?: string;
  origin: Origin;
  pid?: string;
};

export const BuyCore = ({
  onBuyCoresClick,
  amount,
  priceFormatted,
  origin,
  pid,
}: BuyCoreProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const params = new URLSearchParams();
  if (pid) {
    params.append('pid', pid);
  }

  if (origin) {
    params.append('origin', origin);
  }

  const href = getPathnameWithQuery(
    `${webappUrl}cores${isMobile ? '/payment' : ''}`,
    params,
  );

  return (
    <Link href={href}>
      <a
        href={href}
        className="btn btn-tertiaryFloat flex flex-1 flex-col items-center rounded-14 p-2"
        onClick={() => onBuyCoresClick({ amount, origin })}
      >
        <CoreIcon size={IconSize.XLarge} className="mb-1" />
        <Typography type={TypographyType.Title3} bold>
          {formatCoresCurrency(amount)}
        </Typography>
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Tertiary}
        >
          {typeof priceFormatted !== 'undefined' ? priceFormatted : '~'}
        </Typography>
      </a>
    </Link>
  );
};
