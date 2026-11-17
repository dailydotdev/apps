import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { CoreProductOption } from '@dailydotdev/shared/src/contexts/BuyCoresContext/types';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';

// What the Cores are for and what buying the selected pack leaves you with.

export type CoresPurpose = 'award' | 'boost';

export const NeededCopy = ({
  purpose,
  cost,
  balance,
  awardName,
  selected,
}: {
  purpose: CoresPurpose;
  cost: number;
  balance: number;
  awardName?: string;
  selected?: CoreProductOption;
}): ReactElement => {
  const target =
    purpose === 'award' ? (awardName ?? 'the Award') : 'your boost';
  const missing = cost - balance;

  if (!selected || selected.value < missing) {
    return (
      <Typography
        className="w-full flex-1"
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        You need{' '}
        <strong className="text-text-primary">
          {formatCoresCurrency(missing)} more Cores
        </strong>{' '}
        {purpose === 'award' ? `to send ${target}.` : 'to boost the post.'}
      </Typography>
    );
  }

  return (
    <Typography
      className="w-full flex-1"
      type={TypographyType.Callout}
      color={TypographyColor.Secondary}
    >
      <Typography tag={TypographyTag.Span} color={TypographyColor.Primary} bold>
        Covers your {purpose}.
      </Typography>{' '}
      {formatCoresCurrency(cost)} Cores go to {target}, and{' '}
      <Typography tag={TypographyTag.Span} color={TypographyColor.Primary} bold>
        {formatCoresCurrency(balance + selected.value - cost)}
      </Typography>{' '}
      stay in your balance.
    </Typography>
  );
};
