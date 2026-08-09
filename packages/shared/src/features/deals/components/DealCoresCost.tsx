import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
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
 * The price sits under the value badge on every surface that lists the deal, so
 * nobody has to open the offer to find out what it costs. It reads as a caption
 * rather than a second chip: matching pills made it a guess which one was the
 * reward and which one was the price.
 */
export const DealCoresCost = ({
  cores,
  className,
}: DealCoresCostProps): ReactElement => (
  <Typography
    tag={TypographyTag.Span}
    type={TypographyType.Caption1}
    color={TypographyColor.Tertiary}
    role="img"
    aria-label={`Costs ${formatDealCores(cores.cost)}`}
    className={classNames('flex items-center gap-1 tabular-nums', className)}
  >
    <CoreIcon size={IconSize.XSmall} />
    {formatDealCores(cores.cost)}
  </Typography>
);
