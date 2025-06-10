import type { ReactElement } from 'react';
import React from 'react';
import { Modal } from '../../common/Modal';
import type { ModalProps } from '../../common/Modal';
import { CoreIcon } from '../../../icons';
import { IconSize } from '../../../Icon';
import type { PostCampaign } from '../../../../hooks/post/usePostBoost';
import { usePostBoost } from '../../../../hooks/post/usePostBoost';
import { DataTile } from '../../../../features/boost/DataTile';
import { BoostHistoryLoading } from '../../../../features/boost/BoostHistoryLoading';
import { CampaignList } from '../../../../features/boost/CampaignList';

export function AdsDashboardModal(props: ModalProps): ReactElement {
  const { data, isLoading } = usePostBoost();
  const [campaign, setCampaign] = React.useState<PostCampaign>(null);

  return (
    <Modal
      {...props}
      isOpen
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
    >
      <Modal.Header title="Ads dashboard" />
      <Modal.Body className="flex flex-col gap-4">
        <Modal.Subtitle>Overview{!campaign && ' all time'}</Modal.Subtitle>
        <div className="grid grid-cols-2 gap-4">
          <DataTile
            label="Ads cost"
            value={0}
            icon={<CoreIcon size={IconSize.XSmall} />}
          />
          <DataTile label="Ads views" value={0} />
          <DataTile label="Comments" value={0} />
          <DataTile label="Upvotes" value={0} />
        </div>
        <Modal.Subtitle>Running ads</Modal.Subtitle>
        {isLoading ? (
          <BoostHistoryLoading />
        ) : (
          <CampaignList list={data} onClick={setCampaign} />
        )}
      </Modal.Body>
    </Modal>
  );
}

export default AdsDashboardModal;
