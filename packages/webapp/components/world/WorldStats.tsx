import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { formatDataTileValue } from '@dailydotdev/shared/src/lib/numberFormat';
import { pluralize } from '@dailydotdev/shared/src/lib/strings';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { WorldState } from './worldState';

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="flex min-w-0 flex-1 flex-col">
    <Typography
      type={TypographyType.Callout}
      bold
      className="tabular-nums"
      truncate
    >
      {value}
    </Typography>
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Tertiary}
      truncate
    >
      {label}
    </Typography>
  </div>
);

/**
 * The four numbers that say how big a world is, on one line.
 *
 * Shared by the rail and the mobile guide because they are the same four facts
 * and a phone has nowhere else to read them: below laptop there is no rail, so
 * until the guide existed a visitor on a phone could not find out how much
 * reading the place in front of them stood on.
 *
 * Every number is one the engine pushed. Nothing here counts anything, because
 * the engine is counting the day the scrubber is standing on and this is not.
 *
 * `DataTile` is the right component for a stats page and the wrong one here:
 * its card and its own info icon are together taller than four numbers need.
 */
export function WorldStats({
  state,
  className,
  children,
}: {
  state: WorldState;
  className?: string;
  /** The rail hangs its guide button on the end of this row. */
  children?: ReactNode;
}): ReactElement {
  return (
    <div className={classNames('flex items-center gap-2', className)}>
      <Stat
        label={pluralize('Article', state.articles ?? 0)}
        value={formatDataTileValue(state.articles ?? 0)}
      />
      <Stat
        label={pluralize('District', state.districts ?? 0)}
        value={formatDataTileValue(state.districts ?? 0)}
      />
      <Stat
        label={pluralize('Realm', state.realms ?? 0)}
        value={formatDataTileValue(state.realms ?? 0)}
      />
      <Stat label="Active" value={state.span ?? '-'} />
      {children}
    </div>
  );
}
