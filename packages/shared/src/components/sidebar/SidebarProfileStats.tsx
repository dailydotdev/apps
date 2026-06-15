import type { ReactElement } from 'react';
import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  reputation as reputationDocsUrl,
  walletUrl,
} from '../../lib/constants';
import { largeNumberFormat } from '../../lib';
import { formatCurrency } from '../../lib/utils';
import Link from '../utilities/Link';
import { IconSize } from '../Icon';
import { CoreIcon, ReputationIcon } from '../icons';
import { Typography, TypographyType } from '../typography/Typography';

const cellClass =
  'focus-outline flex flex-1 items-center justify-center gap-1.5 px-3 py-1.5 transition-colors hover:bg-surface-hover';

// Reputation + Cores wallet shown at the top of the rail-bottom profile
// dropdown as one compact strip (icon + number, no labels). Streak is
// intentionally omitted here — it lives on the rail profile avatar
// (see StreakRing / useStreakRingState).
export const SidebarProfileStats = (): ReactElement | null => {
  const { user } = useAuthContext();

  if (!user) {
    return null;
  }

  const reputation = user.reputation ?? 0;
  const balance = user.balance?.amount ?? 0;
  const preciseBalance = formatCurrency(balance, { minimumFractionDigits: 0 });

  return (
    <div className="flex items-stretch overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default">
      <Link href={reputationDocsUrl} passHref>
        <a
          className={cellClass}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Reputation: ${reputation}`}
        >
          <ReputationIcon
            size={IconSize.Small}
            className="text-accent-onion-default"
          />
          <Typography
            bold
            type={TypographyType.Footnote}
            className="tabular-nums"
          >
            {largeNumberFormat(reputation)}
          </Typography>
        </a>
      </Link>
      <span
        aria-hidden
        className="w-px self-stretch bg-border-subtlest-tertiary"
      />
      <Link href={walletUrl} passHref>
        <a className={cellClass} aria-label={`Cores wallet: ${preciseBalance}`}>
          <CoreIcon
            size={IconSize.Small}
            className="text-accent-cheese-default"
          />
          <Typography
            bold
            type={TypographyType.Footnote}
            className="tabular-nums"
          >
            {largeNumberFormat(balance)}
          </Typography>
        </a>
      </Link>
    </div>
  );
};
