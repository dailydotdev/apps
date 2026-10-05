import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import type { SquadAudienceRow } from '../../../../graphql/squadWelcomeAudience';

/**
 * A breakdown drawn like poll results, the product's own bar for a share:
 * each row is the bar, a rounded-12 fill behind the label and the share.
 * Widths are the real share, so 6% reads as 6%; a share too small to see
 * keeps a short stub, as polls do.
 */
export const SquadAudienceBreakdown = ({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: SquadAudienceRow[];
  empty: string;
}): ReactElement => (
  <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
    <Typography type={TypographyType.Callout} bold>
      {title}
    </Typography>
    {rows.length ? (
      <ul className="flex flex-col gap-1">
        {rows.map(({ label, share }) => (
          <li
            key={label}
            className="relative flex items-center overflow-hidden rounded-12 px-3 py-2"
          >
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 min-w-5 rounded-12 bg-accent-cabbage-flat"
              style={{ width: `${share}%` }}
            />
            <span className="relative flex w-full items-center justify-between gap-2">
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
