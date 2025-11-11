import type { ComponentProps, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '../Icon';
import { PrivacyIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

type PlusTrustRefundProps = ComponentProps<'div'>;

export const PlusTrustRefund = ({
  className,
  ...attrs
}: PlusTrustRefundProps): ReactElement => {
  return (
    <div
      aria-label="Refund policy"
      className={classNames(
        'rounded-10 bg-surface-float flex items-center gap-2 px-3 py-2',
        className,
      )}
      {...attrs}
    >
      <div
        aria-hidden
        className="rounded-10 bg-action-comment-float text-accent-blueCheese-default grid size-8 place-items-center"
      >
        <PrivacyIcon secondary size={IconSize.Medium} />
      </div>
      <Typography
        className="min-w-0 flex-1"
        color={TypographyColor.Primary}
        type={TypographyType.Callout}
      >
        30 day hassle-free refund. No questions asked.
      </Typography>
    </div>
  );
};
