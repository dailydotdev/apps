import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { CoreIcon } from '../icons';
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
    <Typography
      tag={TypographyTag.P}
      type={TypographyType.Callout}
      color={TypographyColor.Secondary}
      className={classNames(
        'flex flex-wrap items-center justify-center gap-1 text-center',
        className,
      )}
    >
      Get
      <CoreIcon size={IconSize.Size16} />
      <strong className="text-text-primary">
        {formatCoresCurrency(coresGiveback)} Cores
      </strong>
      back {givebackCadence[option.duration] ?? 'on this payment'}
    </Typography>
  );
};
