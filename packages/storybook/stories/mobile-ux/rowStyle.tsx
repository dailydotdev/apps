import type { ReactElement, ReactNode } from 'react';
import React, { createContext, useContext, useState } from 'react';
import classNames from 'classnames';

// Which of the two quiet chip treatments is the segment (primary) and which
// is the filter chip (secondary). Both are the product's own 28px chip; the
// mapping is a live switch on the scroll chapter so Tsahi can compare them
// on every page.

export enum RowMapping {
  PlainSegments = 'plainSegments',
  OutlinedSegments = 'outlinedSegments',
}

export const rowMappingNotes: Record<RowMapping, string> = {
  [RowMapping.PlainSegments]: 'Decided: segments are plain text with a tonal fill and hairline on the active one (the feed strip today); filter chips are hairline-outlined and the active one is a primary button.',
  [RowMapping.OutlinedSegments]: 'Set aside: swapped treatments.',
};

const RowStyleContext = createContext<RowMapping>(RowMapping.PlainSegments);

export const useRowMapping = (): RowMapping => useContext(RowStyleContext);

export const RowStyleProvider = ({
  value,
  children,
}: {
  value: RowMapping;
  children: ReactNode;
}): ReactElement => <RowStyleContext.Provider value={value}>{children}</RowStyleContext.Provider>;

// The quiet chip, 28px, footnote bold: the segment (plain text, tonal fill
// with a hairline when active) and the filter chip (hairline outline, a
// primary button when active). Decided in round 5.
export const quietChipClassName = (active: boolean, outlined: boolean): string =>
  classNames(
    'flex h-7 shrink-0 items-center rounded-8 border px-2 font-bold typo-footnote',
    active && !outlined && 'border-border-subtlest-secondary bg-surface-float text-text-primary',
    active && outlined && 'border-text-primary bg-text-primary text-surface-invert',
    !active && outlined && 'border-border-subtlest-tertiary text-text-secondary',
    !active && !outlined && 'border-transparent text-text-tertiary',
  );

export const RowStyleSwitch = ({ children }: { children: (mapping: RowMapping) => ReactNode }): ReactElement => {
  const [mapping, setMapping] = useState<RowMapping>(RowMapping.PlainSegments);

  return (
    <RowStyleProvider value={mapping}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {Object.values(RowMapping).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMapping(option)}
              className={classNames(
                'rounded-10 border px-3 py-1.5 font-bold typo-footnote',
                option === mapping
                  ? 'border-text-primary bg-text-primary text-surface-invert'
                  : 'border-border-subtlest-tertiary text-text-secondary',
              )}
            >
              {option === RowMapping.PlainSegments ? 'A · Plain segments, outlined chips' : 'B · Outlined segments, plain chips'}
            </button>
          ))}
          <span className="text-text-tertiary typo-footnote">{rowMappingNotes[mapping]}</span>
        </div>
        {children(mapping)}
      </div>
    </RowStyleProvider>
  );
};
