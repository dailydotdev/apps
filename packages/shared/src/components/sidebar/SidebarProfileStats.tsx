import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { usePersistentState } from '../../hooks/usePersistentState';
import { ReputationEarnedChip } from '../ReputationEarnedChip';
import { recentReputationGainsQueryOptions } from '../../graphql/reputation';
import { walletUrl, webappUrl } from '../../lib/constants';
import { largeNumberFormat } from '../../lib/numberFormat';
import { formatCurrency } from '../../lib/utils';
import Link from '../utilities/Link';
import { IconSize } from '../Icon';
import { CoreIcon, ReputationIcon } from '../icons';
import { useHasAccessToCores } from '../../hooks/useCoresFeature';
import { Typography, TypographyType } from '../typography/Typography';

const cellClass =
  'focus-outline flex flex-1 items-center justify-center gap-1.5 px-3 py-1.5 transition-colors hover:bg-surface-hover';

// Reputation + Cores wallet shown at the top of the rail-bottom profile
// dropdown as one compact strip (icon + number, no labels). Streak is
// intentionally omitted here — it lives on the rail profile avatar
// (see StreakRing / useStreakRingState).
export const SidebarProfileStats = (): ReactElement | null => {
  const { user } = useAuthContext();
  const { optOutLevelSystem } = useSettingsContext();
  const hasCoresAccess = useHasAccessToCores();
  const reputation = user?.reputation ?? 0;
  // The count the member last saw here; the chip shows what came since
  const [seenReputation, setSeenReputation, isSeenLoaded] = usePersistentState<
    number | null
  >(`seen_reputation_${user?.id}`, null);
  // Taken once per mount, so the chip stays while the menu is open even
  // though the new count is saved straight away
  const [baseline, setBaseline] = useState<number | null>();
  const hasNoSeenReputation = !optOutLevelSystem && baseline === null;
  // Nothing seen on this device yet: show the last week's gains instead
  const { data: recentGains = 0 } = useQuery(
    recentReputationGainsQueryOptions({
      user,
      enabled: hasNoSeenReputation,
    }),
  );

  useEffect(() => {
    if (!user || !isSeenLoaded || baseline !== undefined) {
      return;
    }

    setBaseline(seenReputation);
    setSeenReputation(reputation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSeenLoaded, user?.id]);

  if (!user) {
    return null;
  }

  let earned = 0;
  if (hasNoSeenReputation) {
    earned = recentGains;
  } else if (!optOutLevelSystem && typeof baseline === 'number') {
    earned = Math.max(reputation - baseline, 0);
  }
  const balance = user.balance?.amount ?? 0;
  const preciseBalance = formatCurrency(balance, { minimumFractionDigits: 0 });

  return (
    <div className="flex items-stretch overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default">
      <Link href={`${webappUrl}analytics/reputation`} passHref>
        <a className={cellClass} aria-label={`Reputation: ${reputation}`}>
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
          <ReputationEarnedChip amount={earned} />
        </a>
      </Link>
      {hasCoresAccess && (
        <>
          <span
            aria-hidden
            className="w-px self-stretch bg-border-subtlest-tertiary"
          />
          <Link href={walletUrl} passHref>
            <a
              className={cellClass}
              aria-label={`Cores wallet: ${preciseBalance}`}
            >
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
        </>
      )}
    </div>
  );
};
