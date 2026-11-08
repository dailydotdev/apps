import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useViewSizeClient, ViewSize } from '@dailydotdev/shared/src/hooks';
import friendshipArt from '../../assets/cores-checkout-friendship.png';
import stripArt from '../../assets/boost-strip-patchy-v2.png';

export { friendshipArt, stripArt };

// The squads hub frame (SquadDiscoverFrame in features/squads): the main
// column is one bordered card and, from laptop, a column of SquadWidgets
// beside it. Below laptop the widgets follow the card.

export const SquadFrame = ({
  children,
  widgets,
}: {
  children: ReactNode;
  widgets?: ReactNode;
}): ReactElement => {
  const isLaptop = useViewSizeClient(ViewSize.Laptop);

  return (
    <div className="mx-auto flex w-full flex-col laptop:max-w-5xl laptop:flex-row laptop:gap-4 laptop:p-4 laptop:pb-6 laptopL:max-w-6xl">
      <div className="flex min-w-0 flex-1 flex-col border-border-subtlest-tertiary laptop:rounded-16 laptop:border">
        {children}
      </div>
      {widgets && isLaptop && (
        <aside className="flex w-80 shrink-0 flex-col gap-4">{widgets}</aside>
      )}
      {widgets && isLaptop === false && (
        <div className="flex flex-col gap-4 px-4 pb-6 tablet:px-6">
          {widgets}
        </div>
      )}
    </div>
  );
};

/** A section of the main card, split from the next by a hairline */
export const CardSection = ({
  title,
  action,
  children,
  className,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <section
    className={classNames(
      'flex flex-col gap-4 border-b border-border-subtlest-tertiary px-4 py-5 last:border-b-0 tablet:px-6',
      className,
    )}
  >
    {(title || action) && (
      <div className="flex items-center justify-between gap-2">
        {title && <h2 className="font-bold typo-body">{title}</h2>}
        {action}
      </div>
    )}
    {children}
  </section>
);
