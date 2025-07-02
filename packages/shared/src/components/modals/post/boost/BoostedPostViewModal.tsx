import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BoostStatus } from '../../../../features/boost/CampaignListItem';
import {
  CampaignListView,
  CampaignStatsGrid,
} from '../../../../features/boost/CampaignListView';
import { capitalize } from '../../../../lib/strings';
import type { ModalProps } from '../../common/Modal';
import { Modal } from '../../common/Modal';
import type { BoostedPostData } from '../../../../graphql/post/boost';
import { getBoostedPostByCampaignId } from '../../../../graphql/post/boost';
import { usePostBoostMutation } from '../../../../hooks/post/usePostBoostMutations';
import type { Post } from '../../../../graphql/posts';
import { generateQueryKey, RequestKey, StaleTime } from '../../../../lib/query';
import { useAuthContext } from '../../../../contexts/AuthContext';

interface BoostedPostViewModalProps extends ModalProps {
  data: BoostedPostData;
  isLoading?: boolean;
  onBoostAgain?: (id: Post['id']) => void;
}

export function BoostedPostViewModal({
  data,
  isLoading,
  onBoostAgain,
  ...props
}: BoostedPostViewModalProps): ReactElement {
  const { onCancelBoost, isLoadingCancel } = usePostBoostMutation({
    onCancelSuccess: () => props.onRequestClose(null),
  });

  const handleBoostClick = () => {
    if (data.campaign.status === 'ACTIVE') {
      return onCancelBoost(data.post.id);
    }

    return onBoostAgain(data.post.id);
  };

  return (
    <Modal
      {...props}
      isOpen
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
    >
      <Modal.Header title="Boost" showCloseButton={false} />
      <Modal.Body className="flex flex-col gap-4">
        <span className="flex flex-row items-center justify-between">
          <Modal.Subtitle>Overview</Modal.Subtitle>
          <BoostStatus status={data.campaign.status}>
            {capitalize(data.campaign.status)}
          </BoostStatus>
        </span>
        <CampaignListView
          data={data}
          isLoading={isLoading || isLoadingCancel}
          onBoostClick={handleBoostClick}
        />
      </Modal.Body>
    </Modal>
  );
}

export function FetchBoostedViewModal({
  campaignId,
  ...props
}: Omit<BoostedPostViewModalProps, 'data'> & {
  campaignId: string;
}): ReactElement {
  const { user } = useAuthContext();
  const { data, isLoading } = useQuery({
    queryKey: generateQueryKey(RequestKey.PostCampaigns, user, campaignId),
    queryFn: () => getBoostedPostByCampaignId(campaignId),
    staleTime: StaleTime.Default,
    enabled: !!campaignId && !!user,
  });

  if (isLoading) {
    return (
      <Modal
        {...props}
        isOpen
        kind={Modal.Kind.FixedCenter}
        size={Modal.Size.Small}
      >
        <Modal.Header title="Boost" showCloseButton={false} />
        <div className="flex flex-col gap-4 py-4">
          <span className="text-text-quaternary typo-caption1">
            Fetching data, please hold...
          </span>
          <CampaignStatsGrid
            clicks={0}
            cores={0}
            engagements={0}
            impressions={0}
          />
        </div>
      </Modal>
    );
  }

  if (!data) {
    return (
      <Modal
        {...props}
        isOpen
        kind={Modal.Kind.FixedCenter}
        size={Modal.Size.Small}
      >
        <Modal.Header title="Boost" showCloseButton={false} />
        <div className="flex flex-col gap-4 py-4">
          <span className="text-text-quaternary typo-caption1">
            No campaign found
          </span>
          <CampaignStatsGrid
            clicks={0}
            cores={0}
            engagements={0}
            impressions={0}
          />
        </div>
      </Modal>
    );
  }

  return <BoostedPostViewModal {...props} data={data} />;
}
