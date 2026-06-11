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

const cellClass =
  'focus-outline flex flex-1 items-center justify-center gap-2 px-3 py-2.5 transition-colors hover:bg-surface-hover';

// Reputation + Cores wallet shown at the top of the rail-bottom profile
// dropdown, styled like production: a single dark, bordered card holding both
// stats side by side with a divider between them. Streak is intentionally
// omitted here — it lives on the rail (see SidebarRailStats).
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
          <div className="flex flex-col">
            <Typography
              bold
              type={TypographyType.Footnote}
              className="tabular-nums"
            >
              {largeNumberFormat(reputation)}
            </Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              Reputation
            </Typography>
          </div>
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
          <div className="flex flex-col">
            <Typography
              bold
              type={TypographyType.Footnote}
              className="tabular-nums"
            >
              {largeNumberFormat(balance)}
            </Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              Cores
            </Typography>
          </div>
        </a>
      </Link>
    </div>
  );
};
