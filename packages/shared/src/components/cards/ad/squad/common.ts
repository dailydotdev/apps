import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { getCampaignById } from '../../../../graphql/campaigns';
import type { BasicSourceMember } from '../../../../graphql/sources';
import { getSquadMembers } from '../../../../graphql/squads';
import type { AdSquadItem } from '../../../../hooks/useFeed';
import { generateQueryKey, RequestKey, StaleTime } from '../../../../lib/query';

export interface SquadAdFeedProps {
  item: AdSquadItem;
}

export const useSquadAd = ({ item }: SquadAdFeedProps) => {
  const { source } = item.ad.data;
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
    queryFn: () => getSquadMembers(source.id),
    staleTime: StaleTime.OneHour,
  });
  const isMember = !!source.currentMember;
  const [justJoined, setJustJoined] = useState(false);

  const shouldShowAction = !isMember || justJoined;

  return { campaign, members, shouldShowAction, onJustJoined: setJustJoined };
};
