import type { ReactElement } from 'react';
import React from 'react';
import { Typography, TypographyType } from '../typography/Typography';

export const PlusFreeTrialAlert = (): ReactElement => {
  return (
    <div className="min-w-full bg-status-success px-6 py-4 text-center text-surface-invert">
      <Typography bold type={TypographyType.Callout}>
        Pay nothing today. Start your 7-day free trial!
      </Typography>
    </div>
  );
};
