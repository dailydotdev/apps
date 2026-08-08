import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { CoreIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type { DealUnlockCores } from '../types';
import { formatDealCores } from '../dealsFormat';

interface DealCoresCostProps {
  cores: DealUnlockCores;
  className?: string;
}

/**
 * The price rides next to the value badge on every surface that lists the deal,
 * so nobody has to open the offer to find out what it costs.
 */
export const DealCoresCost = ({
  cores,
  className,
}: DealCoresCostProps): ReactElement => (
  <Typography
    tag={TypographyTag.Span}
    type={TypographyType.Callout}
    bold
    role="img"
    aria-label={`Costs ${formatDealCores(cores.cost)}`}
    className={classNames(
      'flex items-center gap-1 rounded-10 bg-surface-float px-2 py-1 tabular-nums text-text-primary',
      className,
    )}
  >
    <CoreIcon size={IconSize.XSmall} />
    {formatDealCores(cores.cost)}
  </Typography>
);
