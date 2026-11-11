import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '../../components/modals/common/Modal';
import type { ModalProps } from '../../components/modals/common/Modal';
import { defaultStats, useCampaigns } from './useCampaigns';
import { BoostHistoryLoading } from './BoostHistoryLoading';
import { BoostedViewModal } from './BoostedViewModal';
import { CampaignList } from './CampaignList';
import { CampaignStatsGrid } from './CampaignListView';
import type { Campaign } from '../../graphql/campaigns';
import { getUserCampaignStats } from '../../graphql/campaigns';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { StartupsAdsDashboardPromo } from '../squads/components/promos/StartupsPromo';

interface AdsDashboardModalProps extends ModalProps {
  initialCampaign?: Campaign;
}

export function AdsDashboardModal({
  initialCampaign,
  ...props
}: AdsDashboardModalProps): ReactElement {
  const { user } = useAuthContext();
  const { data, isLoading, infiniteScrollingProps } = useCampaigns();
  const { data: stats } = useQuery({
    queryKey: generateQueryKey(RequestKey.Campaigns, user, 'stats'),
    queryFn: getUserCampaignStats,
    staleTime: StaleTime.Default,
    enabled: !!user,
    placeholderData: defaultStats,
  });
  const [boosted, setBoosted] = useState(initialCampaign);
  const list = useMemo(() => {
    return data?.pages.flatMap((page) => page.edges.map((edge) => edge.node));
  }, [data]);

  if (boosted) {
    return (
      <BoostedViewModal
        {...props}
        campaign={boosted}
        isLoading={isLoading}
        onBack={() => setBoosted(null)}
        onRequestClose={props.onRequestClose}
      />
    );
  }

  return (
    <Modal
      {...props}
      isOpen
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
    >
      <Modal.Header title="Ads dashboard" showCloseButton />
      <Modal.Body className="flex flex-col gap-4 overflow-x-hidden">
        <StartupsAdsDashboardPromo spend={stats.spend} />
        <Modal.Subtitle>Overview all time</Modal.Subtitle>
        <CampaignStatsGrid
          spend={stats.spend}
          users={stats.users}
          impressions={stats.impressions}
          members={stats.newMembers}
        />
        <Modal.Subtitle>Active ads</Modal.Subtitle>
        {isLoading ? (
          <BoostHistoryLoading />
        ) : (
          <CampaignList
            list={list}
            onClick={setBoosted}
            infiniteScrollingProps={infiniteScrollingProps}
          />
        )}
      </Modal.Body>
    </Modal>
  );
}

export default AdsDashboardModal;
