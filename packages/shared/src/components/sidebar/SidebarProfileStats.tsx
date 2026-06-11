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
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

const tileClass =
  'focus-outline flex flex-1 flex-col items-center gap-1 rounded-12 border border-border-subtlest-tertiary bg-transparent px-2 py-3 transition-colors hover:bg-surface-hover';

// Reputation + Cores wallet shown at the top of the rail-bottom profile
// dropdown. Streak is intentionally omitted here — it lives on the rail
// itself (see SidebarRailStats).
export const SidebarProfileStats = (): ReactElement | null => {
  const { user } = useAuthContext();

  if (!user) {
    return null;
  }

  const reputation = user.reputation ?? 0;
  const balance = user.balance?.amount ?? 0;
  const preciseBalance = formatCurrency(balance, { minimumFractionDigits: 0 });

  return (
    <div className="flex items-stretch gap-2">
      <Link href={reputationDocsUrl} passHref>
        <a
          className={tileClass}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Reputation: ${reputation}`}
        >
          <span className="flex items-center gap-1">
            <ReputationIcon
              size={IconSize.Size16}
              className="text-accent-onion-default"
            />
            <Typography
              bold
              type={TypographyType.Callout}
              className="tabular-nums"
            >
              {largeNumberFormat(reputation)}
            </Typography>
          </span>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Reputation
          </Typography>
        </a>
      </Link>
      <Link href={walletUrl} passHref>
        <a className={tileClass} aria-label={`Cores wallet: ${preciseBalance}`}>
          <span className="flex items-center gap-1">
            <CoreIcon
              size={IconSize.Size16}
              className="text-accent-cheese-default"
            />
            <Typography
              bold
              type={TypographyType.Callout}
              className="tabular-nums"
            >
              {largeNumberFormat(balance)}
            </Typography>
          </span>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Cores
          </Typography>
        </a>
      </Link>
    </div>
  );
};
