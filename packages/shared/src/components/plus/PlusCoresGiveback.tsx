import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { CoreIcon, InfoIcon } from '../icons';
import { IconSize } from '../Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import type { ProductPricingPreview } from '../../graphql/paddle';
import { PlusPriceType } from '../../lib/featureValues';
import { formatCoresCurrency } from '../../lib/utils';
import { useAuthContext } from '../../contexts/AuthContext';
import { hasAccessToCores } from '../../lib/cores';
import { Tooltip } from '../tooltip/Tooltip';

export const coresGivebackNote = 'Approximate. Final Cores amount may vary.';

const givebackCadence: Partial<Record<PlusPriceType, string>> = {
  [PlusPriceType.Monthly]: 'every month',
  [PlusPriceType.Yearly]: 'every year',
};

interface PlusCoresGivebackProps {
  option?: ProductPricingPreview;
  className?: string;
}

export const PlusCoresGiveback = ({
  option,
  className,
}: PlusCoresGivebackProps): ReactElement | null => {
  const { user } = useAuthContext();
  const coresGiveback = option?.coresGiveback;

  if (!option || !coresGiveback || (user && !hasAccessToCores(user))) {
    return null;
  }

  return (
    <Tooltip
      className="text-center"
      content={coresGivebackNote}
      delayDuration={0}
      enableMobileClick
    >
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        className={classNames(
          'mx-auto flex w-fit flex-wrap items-center justify-center gap-1 rounded-6 px-1 text-center hover:bg-surface-float',
          className,
        )}
      >
        Get
        <CoreIcon size={IconSize.Size16} />
        <strong className="text-text-primary">
          {formatCoresCurrency(coresGiveback)} Cores
        </strong>
        back {givebackCadence[option.duration] ?? 'on this payment'}
        <InfoIcon
          aria-hidden
          size={IconSize.Size16}
          className="text-text-secondary"
        />
      </Typography>
    </Tooltip>
  );
};
