import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

// The squads frame (SquadDiscoverFrame, SquadPageLayout): full-bleed on
// phones, a bordered card with a w-80 widget column from laptop. Below
// laptop the widgets follow the main column.
export const LfgFrame = ({
  children,
  side,
}: {
  children: ReactNode;
  side?: ReactNode;
}): ReactElement => (
  <div className="mx-auto flex w-full flex-col laptop:max-w-5xl laptop:flex-row laptop:gap-4 laptop:p-4 laptop:pb-6 laptopL:max-w-6xl">
    <div className="flex min-w-0 flex-1 flex-col border-border-subtlest-tertiary laptop:self-start laptop:rounded-16 laptop:border">
      {children}
    </div>
    {side && (
      <aside className="flex w-full flex-col gap-4 px-4 pb-6 tablet:px-6 laptop:sticky laptop:top-4 laptop:w-80 laptop:shrink-0 laptop:self-start laptop:px-0 laptop:pb-0">
        {side}
      </aside>
    )}
  </div>
);

export const lfgPanelClassName = (className?: string): string =>
  classNames('flex flex-col gap-6 px-4 py-5 tablet:px-6', className);
