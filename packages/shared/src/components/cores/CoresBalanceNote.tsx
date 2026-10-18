import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { CoreIcon } from '../icons/Core';
import { IconSize } from '../Icon';
import { useAuthContext } from '../../contexts/AuthContext';
import { useHasAccessToCores } from '../../hooks/useCoresFeature';
import { formatCoresCurrency } from '../../lib/utils';

export type CoresBalanceNoteProps = {
  price?: number;
  className?: string;
};

export const CoresBalanceNote = ({
  price,
  className,
}: CoresBalanceNoteProps): ReactElement | null => {
  const { user } = useAuthContext();
  const hasAccessToCores = useHasAccessToCores();

  if (!user || !hasAccessToCores) {
    return null;
  }

  const balance = user.balance?.amount ?? 0;
  const missing = price !== undefined ? price - balance : 0;

  return (
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      className={classNames(
        'flex flex-wrap items-center justify-center gap-1 tabular-nums',
        className,
      )}
      aria-live="polite"
      data-testid="cores-balance-note"
    >
      Current balance:
      <CoreIcon size={IconSize.Size16} aria-hidden />
      {formatCoresCurrency(balance)}
      <span className="sr-only">Cores</span>
      {missing > 0 && (
        <>
          <span aria-hidden>·</span>
          <span className="sr-only">,</span>
          <strong className="text-text-secondary">
            {formatCoresCurrency(missing)} more needed
          </strong>
        </>
      )}
    </Typography>
  );
};
