import type { Ad } from '../../../../graphql/posts';
import type { Squad } from '../../../../graphql/sources';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useSquad } from '../../../../hooks/squads/useSquad';
import { useAdQuery } from '../../../monetization/useAdQuery';
import { AdPlacement } from '../../../../lib/ads';
import { generateQueryKey, RequestKey } from '../../../../lib/query';

interface UsePromotedSquadProps {
  /** Each slot on a page is its own campaign request. */
  slot: string;
  enabled?: boolean;
  /** The squad another slot on the same screen already promotes. */
  excludeId?: string;
}

interface UsePromotedSquad {
  ad?: Ad;
  squad?: Squad;
  isLoading: boolean;
}

export const usePromotedSquad = ({
  slot,
  enabled = true,
  excludeId,
}: UsePromotedSquadProps): UsePromotedSquad => {
  const { user, isAuthReady } = useAuthContext();
  const isPlus = !!user?.isPlus;
  const { data: ad, isLoading: isLoadingAd } = useAdQuery({
    placement: AdPlacement.SquadDirectory,
    queryKey: generateQueryKey(RequestKey.Ads, user, 'squads_directory', slot),
    enabled: enabled && isAuthReady && !isPlus,
    // A blocked or empty campaign is no campaign: the list it holds a slot
    // in should not wait out retries.
    retry: false,
  });
  const { squad, isLoading: isLoadingSquad } = useSquad({
    handle: ad?.data?.source?.handle ?? '',
  });
  // A slot still waiting to ask counts as loading, so its list holds the
  // promoted position instead of shifting once the campaign arrives.
  const isLoading =
    !isPlus && (!isAuthReady || !enabled || isLoadingAd || isLoadingSquad);

  if (!ad || !squad || squad.id === excludeId) {
    return { isLoading };
  }

  return { ad, squad, isLoading };
};
