import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Squad } from '../../../graphql/sources';
import { similarSquadsQueryOptions } from '../../../graphql/squads';
import { useAuthContext } from '../../../contexts/AuthContext';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { useSquad } from '../../../hooks/squads/useSquad';
import { useAdQuery } from '../../monetization/useAdQuery';
import { AdPlacement, shouldSkipSourceAds } from '../../../lib/ads';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import type { SquadAd } from '../../../components/cards/ad/squad/SquadAdEntityCard';
import { isSquadAd } from '../../../components/cards/ad/squad/SquadAdEntityCard';
import { getSquadId } from '../lib/features';

// Every surface asks for the same list, so they share one cached response
const SIMILAR_SQUADS_LIMIT = 5;

interface UseSimilarSquadsProps {
  squad: Squad;
  maxRows: number;
  /** Keeps each surface's promoted slot apart in the query cache. */
  adKey: string;
}

export const useSimilarSquads = ({
  squad,
  maxRows,
  adKey,
}: UseSimilarSquadsProps) => {
  const { user, isAuthReady, squads } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const squadId = getSquadId(squad);
  // Ad-free squads get no similar squads, and a squad still loading its
  // features could be one. Private squads have no similar squads to list.
  const canShow = !!squad.public && !shouldSkipSourceAds(squad);
  const isEnabled = canShow && isAuthReady;
  const canPromote = isEnabled && !isPlus;

  const { data: similarSquads, isPending } = useQuery({
    ...similarSquadsQueryOptions({
      squadId,
      user,
      limit: SIMILAR_SQUADS_LIMIT,
    }),
    enabled: isEnabled,
  });
  const { data: ad, isPending: isAdPending } = useAdQuery({
    placement: AdPlacement.SquadDirectory,
    queryKey: generateQueryKey(RequestKey.Ads, user, adKey, squadId),
    enabled: canPromote,
    staleTime: StaleTime.OneHour,
    // A blocked ad request must not hold the organic rows behind retries
    retry: false,
  });
  const squadAd = canPromote && isSquadAd(ad) ? ad : undefined;
  const { squad: boostedSquad, isLoading: isBoostedSquadLoading } = useSquad({
    handle: squadAd?.data.source.handle ?? '',
  });
  // The ad server can't leave out the squad on the page or the reader's own
  // squads yet, so those boosts give their slot back to an organic row
  const eligibleAd =
    squadAd &&
    boostedSquad &&
    boostedSquad.id !== squadId &&
    !boostedSquad.currentMember
      ? squadAd
      : undefined;
  const isSlotPending =
    !isAuthReady ||
    isPending ||
    (canPromote && (isAdPending || isBoostedSquadLoading));
  // Decided once, so joining the promoted squad doesn't take its row away
  const [slot, setSlot] = useState<{ ad?: SquadAd }>();
  const isLoading = !slot;
  const promotedAd = canPromote ? slot?.ad : undefined;

  useEffect(() => {
    if (!slot && !isSlotPending) {
      setSlot({ ad: eligibleAd });
    }
  }, [slot, isSlotPending, eligibleAd]);

  const rows = useMemo(
    () =>
      (similarSquads ?? [])
        .filter(({ id }) => id !== promotedAd?.data.source.id)
        .slice(0, promotedAd ? maxRows - 1 : maxRows)
        .map((similarSquad) => ({
          ...similarSquad,
          // boot squads follow joins and leaves made from the rows
          currentMember: squads?.find(({ id }) => id === similarSquad.id)
            ?.currentMember,
        })),
    [similarSquads, promotedAd, maxRows, squads],
  );
  const shownAd = !isLoading && rows.length ? promotedAd : undefined;

  return { canShow, isLoading, rows, ad: shownAd };
};
