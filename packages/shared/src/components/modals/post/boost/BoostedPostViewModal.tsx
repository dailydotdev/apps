import type { ReactElement } from 'react';
import React from 'react';
import { BoostStatus } from '../../../../features/boost/CampaignListItem';
import { CampaignListView } from '../../../../features/boost/CampaignListView';
import { capitalize } from '../../../../lib/strings';
import type { ModalProps } from '../../common/Modal';
import { Modal } from '../../common/Modal';
import type { BoostedPostData } from '../../../../graphql/post/boost';
import { usePostBoostMutation } from '../../../../hooks/post/usePostBoostMutations';
import type { Post } from '../../../../graphql/posts';

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
  const { onCancelBoost } = usePostBoostMutation({});

  const handleBoostClick = () => {
    if (data.campaign.status === 'active') {
      return onCancelBoost(data.campaign.campaignId);
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
          isLoading={isLoading}
          onBoostClick={handleBoostClick}
        />
      </Modal.Body>
    </Modal>
  );
}

export default BoostedPostViewModal;
