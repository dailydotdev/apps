import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { SquadAudienceRow } from '../../../../graphql/squadWelcomeAudience';

/**
 * A breakdown: each row's label and share, with a rounded bar under it in
 * the colours of the product's progress bars. Bars are scaled to the
 * biggest row so the order reads at a glance.
 */
export const SquadAudienceBreakdown = ({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: SquadAudienceRow[];
  empty: string;
}): ReactElement => {
  const max = Math.max(...rows.map(({ share }) => share), 1);

  return (
    <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {title}
      </Typography>
      {rows.length ? (
        <ul className="flex flex-col gap-3">
          {rows.map(({ label, share }) => (
            <li key={label} className="flex flex-col gap-1.5">
              <span className="flex items-baseline justify-between gap-2">
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Secondary}
                  truncate
                >
                  {label}
                </Typography>
                <Typography
                  type={TypographyType.Callout}
                  bold
                  className="tabular-nums"
                >
                  {`${share}%`}
                </Typography>
              </span>
              <span className="block h-2 w-full overflow-hidden rounded-max bg-surface-float">
                <span
                  data-testid="audience-share"
                  className="block h-full rounded-max bg-accent-cabbage-default"
                  style={{ width: `${(share / max) * 100}%` }}
                />
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {empty}
        </Typography>
      )}
    </div>
  );
};
