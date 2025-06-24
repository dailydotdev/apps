import type { ReactElement } from 'react';
import React from 'react';
import { BoostStatus } from '../../../../features/boost/CampaignListItem';
import { CampaignListView } from '../../../../features/boost/CampaignListView';
import { capitalize } from '../../../../lib/strings';
import type { ModalProps } from '../../common/Modal';
import { Modal } from '../../common/Modal';
import type { BoostedPostData } from '../../../../graphql/post/boost';

interface BoostedPostViewModalProps extends ModalProps {
  data: BoostedPostData;
}

export function BoostedPostViewModal({
  data,
  ...props
}: BoostedPostViewModalProps): ReactElement {
  return (
    <Modal
      {...props}
      isOpen
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
    >
      <Modal.Header title="Boost" />
      <Modal.Body className="flex flex-col gap-4">
        <span className="flex flex-row items-center justify-between">
          <Modal.Subtitle>Overview</Modal.Subtitle>
          <BoostStatus status={data.campaign.status}>
            {capitalize(data.campaign.status)}
          </BoostStatus>
        </span>
        <CampaignListView data={data} />
      </Modal.Body>
    </Modal>
  );
}
