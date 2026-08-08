import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Deal } from '../types';
import { DEAL_CARD_CAVEAT_LIMIT, getDealCardCaveats } from '../dealsFormat';

interface DealCaveatStripProps {
  deal: Deal;
  limit?: number;
  className?: string;
}

const itemClasses = "before:mr-2 before:content-['·']";

export const DealCaveatStrip = ({
  deal,
  limit = DEAL_CARD_CAVEAT_LIMIT,
  className,
}: DealCaveatStripProps): ReactElement | null => {
  const { shown, hiddenCount, total } = getDealCardCaveats(deal, limit);

  if (!shown.length) {
    return null;
  }

  return (
    <ul
      aria-label={`Worth knowing before you claim, ${total} ${
        total === 1 ? 'point' : 'points'
      }`}
      className={classNames(
        'flex flex-wrap gap-x-2 text-text-tertiary typo-caption1',
        className,
      )}
    >
      {shown.map(({ kind, label }) => (
        <li
          key={kind}
          className={classNames(itemClasses, 'first:before:hidden')}
        >
          {label}
        </li>
      ))}
      {hiddenCount > 0 && <li className={itemClasses}>+{hiddenCount} more</li>}
    </ul>
  );
};
