import type { ReactElement } from 'react';
import React from 'react';
import { LockIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { Pill, PillSize } from '../../../../components/Pill';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';

/** A Manage setting the squad's plan does not include. */
export const SquadEnterpriseGate = ({
  title,
  description,
  plan = 'Enterprise',
}: {
  title: string;
  description: string;
  /** The plan that includes it */
  plan?: string;
}): ReactElement => (
  <div className="flex items-start gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
    <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-surface-float text-text-tertiary">
      <LockIcon size={IconSize.Small} />
    </span>
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <Typography type={TypographyType.Callout} bold>
          {title}
        </Typography>
        <Pill
          label={plan}
          size={PillSize.XSmall}
          className="bg-surface-float text-text-secondary"
        />
      </div>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {description}
      </Typography>
    </div>
  </div>
);
