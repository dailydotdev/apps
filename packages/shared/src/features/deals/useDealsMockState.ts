import { useCallback, useMemo, useState } from 'react';
import type { ClaimRecord, Deal } from './types';
import { ClaimStatus } from './types';
import { mockClaims, mockDeals, MOCK_NOW_MS } from './mockDeals';

export interface DealsImpact {
  claimedCount: number;
  savedUsd: number;
  invitesDone: number;
  invitesRequired: number;
}

export interface DealsMockState {
  claims: ClaimRecord[];
  claimedDealIds: Set<string>;
  upvotedIds: Set<string>;
  codeFeedback: Record<string, boolean>;
  impact: DealsImpact;
  claimDeal: (deal: Deal) => ClaimRecord | undefined;
  toggleUpvote: (deal: Deal) => void;
  markCodeFeedback: (dealId: string, worked: boolean) => void;
}

interface UseDealsMockStateProps {
  deals?: Deal[];
  initialClaims?: ClaimRecord[];
  invitesDone?: number;
  invitesRequired?: number;
  now?: number;
}

const defaultInvitesDone = 1;
const defaultInvitesRequired = 2;

export const useDealsMockState = ({
  deals = mockDeals,
  initialClaims = mockClaims,
  invitesDone = defaultInvitesDone,
  invitesRequired = defaultInvitesRequired,
  now = MOCK_NOW_MS,
}: UseDealsMockStateProps = {}): DealsMockState => {
  const [claims, setClaims] = useState<ClaimRecord[]>(initialClaims);
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());
  const [codeFeedback, setCodeFeedback] = useState<Record<string, boolean>>({});

  const claimedDealIds = useMemo(
    () => new Set(claims.map(({ dealId }) => dealId)),
    [claims],
  );

  const impact = useMemo<DealsImpact>(() => {
    const savedUsd = claims.reduce((total, claim) => {
      const deal = deals.find(({ id }) => id === claim.dealId);

      if (!deal) {
        throw new Error(`Claim ${claim.id} points at a missing deal`);
      }

      return total + (deal.value.savingsUsd ?? 0);
    }, 0);

    return {
      claimedCount: claims.length,
      savedUsd,
      invitesDone,
      invitesRequired,
    };
  }, [claims, deals, invitesDone, invitesRequired]);

  const claimDeal = useCallback(
    (deal: Deal): ClaimRecord | undefined => {
      if (claimedDealIds.has(deal.id)) {
        return undefined;
      }

      const claim: ClaimRecord = {
        id: `claim-${deal.id}`,
        dealId: deal.id,
        claimedAt: new Date(now).toISOString(),
        status: ClaimStatus.Active,
        code: deal.code,
      };

      setClaims((current) => [claim, ...current]);

      return claim;
    },
    [claimedDealIds, now],
  );

  const toggleUpvote = useCallback((deal: Deal) => {
    setUpvotedIds((current) => {
      const next = new Set(current);

      if (next.has(deal.id)) {
        next.delete(deal.id);
      } else {
        next.add(deal.id);
      }

      return next;
    });
  }, []);

  const markCodeFeedback = useCallback((dealId: string, worked: boolean) => {
    setCodeFeedback((current) => ({ ...current, [dealId]: worked }));
  }, []);

  return {
    claims,
    claimedDealIds,
    upvotedIds,
    codeFeedback,
    impact,
    claimDeal,
    toggleUpvote,
    markCodeFeedback,
  };
};
