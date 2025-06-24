import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { Modal } from '../../common/Modal';
import type { ModalProps } from '../../common/Modal';
import { CoreIcon } from '../../../icons';
import { IconSize } from '../../../Icon';
import { usePostBoost } from '../../../../hooks/post/usePostBoost';
import { DataTile } from '../../../../features/boost/DataTile';
import { BoostHistoryLoading } from '../../../../features/boost/BoostHistoryLoading';
import { CampaignList } from '../../../../features/boost/CampaignList';
import type { BoostedPostData } from '../../../../graphql/post/boost';
import { BoostedPostViewModal } from './BoostedPostViewModal';

interface AdsDashboardModalProps extends ModalProps {
  initialBoostedPost?: BoostedPostData;
}

export function AdsDashboardModal({
  initialBoostedPost,
  ...props
}: AdsDashboardModalProps): ReactElement {
  const { data, isLoading, stats } = usePostBoost();
  const [boosted, setBoosted] = useState<BoostedPostData>(initialBoostedPost);
  const list = useMemo(() => {
    return data?.pages.flatMap((page) => page.edges.map((edge) => edge.node));
  }, [data]);

  if (boosted) {
    return (
      <BoostedPostViewModal
        {...props}
        data={boosted}
        onRequestClose={() => setBoosted(null)}
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
      <Modal.Header title="Ads dashboard" />
      <Modal.Body className="flex flex-col gap-4">
        <Modal.Subtitle>Overview all time</Modal.Subtitle>
        <div className="grid grid-cols-2 gap-4">
          <DataTile
            label="Ads cost"
            value={stats.totalSpend}
            icon={<CoreIcon size={IconSize.XSmall} />}
          />
          <DataTile label="Impressions" value={stats.impressions} />
          <DataTile label="Clicks" value={stats.clicks} />
          <DataTile label="Engagements" value={stats.engagements} />
        </div>
        <Modal.Subtitle>Running ads</Modal.Subtitle>
        {isLoading ? (
          <BoostHistoryLoading />
        ) : (
          <CampaignList list={list} onClick={setBoosted} />
        )}
      </Modal.Body>
    </Modal>
  );
}

export default AdsDashboardModal;
