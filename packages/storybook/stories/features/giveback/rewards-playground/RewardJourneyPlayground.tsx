import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { FlexCol, FlexRow } from '@dailydotdev/shared/src/components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { GiftIcon } from '@dailydotdev/shared/src/components/icons';
import { NodeRow } from '@dailydotdev/shared/src/features/giveback/components/GivebackRoadmapNode';
import type {
  ConnectorFill,
  RoadmapLevel,
  RoadmapNode,
} from '@dailydotdev/shared/src/features/giveback/components/givebackRoadmapTypes';
import { formatDonationAmount } from '@dailydotdev/shared/src/features/giveback/utils';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { PLAYGROUND_TIERS } from './rewardsPlayground.data';
import type { FoundingAwardState } from './rewardsPlayground.data';
import { RewardRevealDialog } from './RewardReveal';
import { FoundingAwardCard } from './FoundingAward';

// PLAYGROUND ONLY. Renders the proposed reward ladder using the SAME production
// node (GivebackRoadmapNode) so fidelity matches the live journey — but the
// Claim button opens our unique per-tier reveal instead of firing the real
// mutation. Scrub `userPoints` to walk the ladder.

interface RewardJourneyPlaygroundProps {
  // Approved points the mock visitor has (1 point = $1 donated).
  userPoints?: number;
  // Seed some tiers as already claimed (so the "Done" state is inspectable).
  claimedTierIds?: string[];
  // Founding-award state at the top of the journey. Defaults from points:
  // any contribution → claimable, otherwise the intro (spot not yet secured).
  foundingState?: FoundingAwardState;
  user: LoggedUser | null;
}

export const RewardJourneyPlayground = ({
  userPoints = 320,
  claimedTierIds = [],
  foundingState,
  user,
}: RewardJourneyPlaygroundProps): ReactElement => {
  const [claimed, setClaimed] = useState(() => new Set(claimedTierIds));
  const [openTierId, setOpenTierId] = useState<string | null>(null);

  const levels = useMemo<RoadmapLevel[]>(
    () =>
      PLAYGROUND_TIERS.map((tier, index) => ({
        id: tier.id,
        levelNumber: index + 1,
        requiredApprovedAmount: tier.threshold,
        reward: {
          id: tier.id,
          type: tier.rewardType,
          title: tier.title,
          description: tier.description,
        },
      })),
    [],
  );

  const approved = userPoints;
  const total = levels.length;
  const nextIndex = levels.findIndex(
    (level) => level.requiredApprovedAmount > approved,
  );
  const focusIndex = nextIndex === -1 ? total - 1 : nextIndex;
  const nextLevel = nextIndex === -1 ? undefined : levels[nextIndex];
  const amountToNext = nextLevel
    ? Math.max(0, nextLevel.requiredApprovedAmount - approved)
    : 0;
  const reachedCount = levels.filter(
    (level) => approved >= level.requiredApprovedAmount,
  ).length;
  const claimableCount = levels.filter(
    (level) =>
      approved >= level.requiredApprovedAmount && !claimed.has(level.id),
  ).length;

  const previousAmount =
    reachedCount > 0 ? levels[reachedCount - 1].requiredApprovedAmount : 0;
  const segmentDenominator = nextLevel
    ? nextLevel.requiredApprovedAmount - previousAmount
    : 1;
  const segmentProgress = nextLevel
    ? Math.min(1, Math.max(0, (approved - previousAmount) / segmentDenominator))
    : 1;

  const getConnector = (index: number): ConnectorFill | undefined => {
    const next = levels[index + 1];
    if (!next) {
      return undefined;
    }
    if (approved >= next.requiredApprovedAmount) {
      return { type: 'full' };
    }
    if (approved >= levels[index].requiredApprovedAmount) {
      const denom =
        next.requiredApprovedAmount - levels[index].requiredApprovedAmount || 1;
      const progress = Math.min(
        1,
        Math.max(0, (approved - levels[index].requiredApprovedAmount) / denom),
      );
      return { type: 'partial', progress };
    }
    return { type: 'muted' };
  };

  const nodes: RoadmapNode[] = levels.map((level) => {
    const index = level.levelNumber - 1;
    return {
      level,
      isLast: index === total - 1,
      isReached: approved >= level.requiredApprovedAmount,
      isCurrent: level.levelNumber === focusIndex + 1,
      isNext: level.id === nextLevel?.id,
      isClaimed: claimed.has(level.id),
      connector: getConnector(index),
    };
  });

  const onClaim = (tierId: string) => {
    setClaimed((prev) => new Set(prev).add(tierId));
    setOpenTierId(tierId);
  };

  const openTier = PLAYGROUND_TIERS.find((tier) => tier.id === openTierId);

  return (
    <FlexCol className="max-w-2xl gap-6">
      <FoundingAwardCard
        user={user}
        initialState={foundingState ?? (approved > 0 ? 'claimable' : 'intro')}
      />

      <FlexCol className="gap-1">
        <Typography bold type={TypographyType.Title3}>
          Rewards you unlock along the way
        </Typography>
        <FlexRow className="items-center gap-2">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {formatDonationAmount(approved)} donated ·{' '}
            {nextLevel
              ? `${formatDonationAmount(amountToNext)} to your next reward`
              : 'every reward unlocked'}
          </Typography>
          {claimableCount > 0 && (
            <span className="flex items-center gap-1 text-accent-cheese-default [&_svg]:size-4">
              <GiftIcon />
              <Typography bold type={TypographyType.Caption1}>
                {claimableCount} ready
              </Typography>
            </span>
          )}
        </FlexRow>
      </FlexCol>

      <FlexCol>
        {nodes.map((node) => (
          <NodeRow
            key={node.level.id}
            node={node}
            user={user}
            amountToNext={amountToNext}
            segmentProgress={segmentProgress}
            isClaiming={false}
            onClaim={onClaim}
            onTakeAction={() => undefined}
          />
        ))}
      </FlexCol>

      {openTier && (
        <RewardRevealDialog
          tier={openTier}
          user={user}
          onClose={() => setOpenTierId(null)}
        />
      )}
    </FlexCol>
  );
};
