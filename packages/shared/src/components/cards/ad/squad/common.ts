import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { getCampaignById } from '../../../../graphql/campaigns';
import type { BasicSourceMember } from '../../../../graphql/sources';
import { getSquadMembers } from '../../../../graphql/squads';
import type { AdSquadItem } from '../../../../hooks/useFeed';
import { generateQueryKey, RequestKey, StaleTime } from '../../../../lib/query';
import { useSquad } from '../../../../hooks';

export interface SquadAdFeedProps {
  item: AdSquadItem;
  onClickAd: () => void;
  onMount?: () => void;
}

export const useSquadAd = ({ item }: Pick<SquadAdFeedProps, 'item'>) => {
  const { source } = item.ad.data;
  const { squad } = useSquad({ handle: source.handle });
  const { user: loggedUser } = useAuthContext();
  const campaignId = item.ad?.data?.source?.flags?.campaignId;
  const { data: campaign } = useQuery({
    queryKey: generateQueryKey(RequestKey.Campaigns, loggedUser, campaignId),
    queryFn: () => getCampaignById(campaignId),
    enabled: !!campaignId,
    staleTime: StaleTime.Default,
  });
  const { data: members } = useQuery<BasicSourceMember[]>({
    queryKey: generateQueryKey(RequestKey.SquadMembers, loggedUser, source.id),
    queryFn: () => getSquadMembers(squad.id),
    staleTime: StaleTime.OneHour,
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
