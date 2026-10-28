import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  FORMAT_SPEC,
  ProgrammaticAdFormat,
} from '@dailydotdev/shared/src/features/monetization/ProgrammaticAd';
import { ORGANIC_SLOT } from '@dailydotdev/shared/src/components/post/read/slots';

export { ORGANIC_SLOT, ProgrammaticAdFormat };

/** A slot this layout adds on top of the classic organic map. */
export const PROPOSED_SLOT = {
  stickyRail: 'new',
} as const;

interface AdSlotProps {
  slot: number | string;
  format: ProgrammaticAdFormat;
  /** Where it sits, for the reviewer. */
  name: string;
  hideOnPhone?: boolean;
  proposed?: boolean;
  className?: string;
}

/**
 * Production's own density-review placeholder (ReadAdSlot's dev box), with
 * the slot's name under the format so a reviewer can map it to slots.ts.
 */
export const AdSlot = ({
  slot,
  format,
  name,
  hideOnPhone,
  proposed,
  className,
}: AdSlotProps): ReactElement => {
  const spec = FORMAT_SPEC[format];

  return (
    <div
      className={classNames(
        'relative flex w-full flex-col items-center justify-center gap-1 rounded-16 border bg-background-subtle px-3 py-4',
        proposed
          ? 'border-dashed border-accent-cabbage-default'
          : 'border-border-subtlest-tertiary',
        hideOnPhone ? 'hidden tablet:flex' : 'flex',
        spec.minHeight,
        className,
      )}
    >
      <span
        className={classNames(
          'absolute left-3 top-2 rounded-6 px-2 py-0.5 font-bold text-surface-invert typo-caption2',
          proposed ? 'bg-accent-cabbage-default' : 'bg-accent-cheese-default',
        )}
      >
        {proposed ? 'New' : slot}
      </span>
      <span className="absolute right-3 top-2 rounded-6 bg-background-default px-2 py-0.5 text-text-quaternary typo-caption2">
        {spec.size}
      </span>
      <span className="font-bold text-text-tertiary typo-footnote">
        {spec.label}
      </span>
      <span className="text-center text-text-quaternary typo-caption1">
        {name}
      </span>
      <span className="absolute bottom-1 right-2 text-text-quaternary typo-caption2">
        Ad
      </span>
    </div>
  );
};
