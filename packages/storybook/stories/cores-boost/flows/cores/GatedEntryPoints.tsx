import type { ReactElement } from 'react';
import React from 'react';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useHasAccessToCores } from '@dailydotdev/shared/src/hooks/useCoresFeature';
import { QuestCard } from '@dailydotdev/shared/src/components/quest/QuestCard';
import type { UserQuest } from '@dailydotdev/shared/src/graphql/quests';
import {
  QuestRewardType,
  QuestStatus,
} from '@dailydotdev/shared/src/graphql/quests';
import {
  reputation as reputationDocsUrl,
  walletUrl,
} from '@dailydotdev/shared/src/lib/constants';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { formatCurrency } from '@dailydotdev/shared/src/lib/utils';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  CoreIcon,
  ReputationIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

// Cores entry points behind useHasAccessToCores, as the fix asks. Today the
// quest card and the sidebar strip show Cores to users who can't open the
// wallet (coresRole None), and the wallet then redirects them home.

/** Production QuestCard; Cores rewards are dropped without Cores access */
export const GatedQuestCard = ({
  quest,
  onClaim,
  isClaimed,
}: {
  quest: UserQuest;
  onClaim?: () => void;
  isClaimed?: boolean;
}): ReactElement => {
  const hasCoresAccess = useHasAccessToCores();
  const rewards = hasCoresAccess
    ? quest.rewards
    : quest.rewards.filter(({ type }) => type !== QuestRewardType.Cores);

  return (
    <QuestCard
      quest={{
        ...quest,
        rewards,
        ...(isClaimed && {
          status: QuestStatus.Claimed,
          claimable: false,
          claimedAt: new Date(),
        }),
      }}
      onClaim={() => onClaim?.()}
      showLevelSystem
      isClaiming={false}
      isClaimAnimating={false}
      showClaimedStamp={!!isClaimed}
      animateClaimedStamp={!!isClaimed}
      suppressPersistedClaimedStamp={false}
    />
  );
};

const cellClass =
  'focus-outline flex flex-1 items-center justify-center gap-1.5 px-3 py-1.5 transition-colors hover:bg-surface-hover';

/** Copy of production SidebarProfileStats with the Cores cell gated */
export const GatedSidebarProfileStats = (): ReactElement | null => {
  const { user } = useAuthContext();
  const hasCoresAccess = useHasAccessToCores();

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
