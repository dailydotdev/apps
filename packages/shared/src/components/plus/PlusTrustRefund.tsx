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
        'flex items-center gap-2 rounded-10 bg-surface-float px-3 py-2',
        className,
      )}
      {...attrs}
    >
      <div
        aria-hidden
        className="grid size-8 place-items-center rounded-10 bg-action-comment-float text-accent-blueCheese-default"
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
