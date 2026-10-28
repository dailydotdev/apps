import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { getCampaignById } from '../../../../graphql/campaigns';
import type { BasicSourceMember } from '../../../../graphql/sources';
import { getSquadMembers } from '../../../../graphql/squads';
import type { AdSquadItem } from '../../../../hooks/useFeed';
import type { ViewabilityData } from '../../../../features/monetization/viewability';
import { generateQueryKey, RequestKey, StaleTime } from '../../../../lib/query';
import { useSquad } from '../../../../hooks';

export interface SquadAdFeedProps {
  item: AdSquadItem;
  onClickAd: () => void;
  onMount?: () => void;
  onViewable?: (data: ViewabilityData) => void;
}

interface UseSquadAdProps {
  ad: AdSquadItem['ad'];
  withMembers?: boolean;
}

export const useSquadAd = ({ ad, withMembers = true }: UseSquadAdProps) => {
  const { source } = ad.data;
  const { squad = source } = useSquad({ handle: source.handle });
  const { user: loggedUser } = useAuthContext();
  const campaignId = source?.flags?.campaignId;
  const { data: campaign } = useQuery({
    queryKey: generateQueryKey(RequestKey.Campaigns, loggedUser, campaignId),
    queryFn: () => getCampaignById(campaignId),
    enabled: !!campaignId,
    staleTime: StaleTime.Default,
  });
  const { data: members } = useQuery<BasicSourceMember[]>({
    queryKey: generateQueryKey(RequestKey.SquadMembers, loggedUser, source.id),
    queryFn: () => getSquadMembers(source.id),
    staleTime: StaleTime.OneHour,
    enabled: withMembers,
  });
  const isMember = !!squad?.currentMember;
  const [justJoined, setJustJoined] = useState(false);

  const shouldShowAction = !isMember || justJoined;

  return {
    squad,
    campaign,
    members,
    shouldShowAction,
    onJustJoined: setJustJoined,
  };
};
