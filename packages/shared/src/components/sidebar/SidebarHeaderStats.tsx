import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../contexts/AuthContext';
import { useReadingStreak } from '../../hooks/streaks';
import { walletUrl } from '../../lib/constants';
import { largeNumberFormat } from '../../lib';
import { formatCurrency } from '../../lib/utils';
import Link from '../utilities/Link';
import { Tooltip } from '../tooltip/Tooltip';
import { IconSize } from '../Icon';
import { CoreIcon, ReadingStreakIcon, ReputationIcon } from '../icons';

const slotClass =
  'focus-outline flex h-9 w-full items-center justify-center gap-1 rounded-10 font-bold text-text-primary typo-footnote transition-colors hover:bg-surface-hover';

// Compact stats strip rendered under the user identity row in the dedicated
// home panel. Streak / reputation / cores share an equal-column grid so each
// slot stretches to the same width across the panel.
export const SidebarHeaderStats = (): ReactElement | null => {
  const { user } = useAuthContext();
  const { streak, isStreaksEnabled } = useReadingStreak();

  if (!user) {
    return null;
  }

  const reputation = user.reputation ?? 0;
  const balance = user.balance?.amount ?? 0;
  const showStreak = isStreaksEnabled;
  const preciseBalance = formatCurrency(balance, { minimumFractionDigits: 0 });
  const streakValue = streak?.current ?? 0;

  return (
    <div className="grid grid-cols-3 gap-1">
      {showStreak && (
        <Tooltip content="Reading streak" side="bottom">
          <span
            className={classNames(slotClass, 'text-accent-bacon-default')}
            aria-label={`Current reading streak: ${streakValue}`}
          >
            <ReadingStreakIcon size={IconSize.Size16} aria-hidden />
            {streakValue}
          </span>
        </Tooltip>
      )}
      <Tooltip content="Reputation" side="bottom">
        <span className={slotClass} aria-label={`Reputation: ${reputation}`}>
          <ReputationIcon
            size={IconSize.Size16}
            className="text-accent-onion-default"
            aria-hidden
          />
          {largeNumberFormat(reputation)}
        </span>
      </Tooltip>
      <Tooltip
        content={
          <>
            Wallet
            <br />
            {preciseBalance} Cores
          </>
        }
        side="bottom"
      >
        <Link href={walletUrl} passHref>
          <a
            className={slotClass}
            aria-label={`Cores wallet: ${preciseBalance}`}
          >
            <CoreIcon size={IconSize.Size16} aria-hidden />
            {largeNumberFormat(balance)}
          </a>
        </Link>
      </Tooltip>
    </div>
  );
};
