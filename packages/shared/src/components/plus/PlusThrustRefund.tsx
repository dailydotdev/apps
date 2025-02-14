import type { ReactElement } from 'react';
import React from 'react';
import { IconSize } from '../Icon';
import { PrivacyIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

export const PlusThrustRefund = (): ReactElement => {
  return (
    <div
      aria-label="Refund policy"
      className="flex items-center gap-2 rounded-10 bg-surface-float px-3 py-2"
    >
      <div
        aria-hidden
        className="grid size-8 place-items-center rounded-10 bg-action-comment-float text-accent-blueCheese-default"
      >
        <PrivacyIcon secondary size={IconSize.Medium} />
      </div>
      <Typography type={TypographyType.Callout} color={TypographyColor.Primary}>
        30 day hassle-free refund. No questions asked.
      </Typography>
    </div>
  );
};
