import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
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
import { usePostById } from '../../../../hooks';
import type { Post } from '../../../../graphql/posts';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { LazyModal } from '../../common/types';
import { boostDashboardInfo } from './common';

interface AdsDashboardModalProps extends ModalProps {
  initialBoostedPost?: BoostedPostData;
}

export function AdsDashboardModal({
  initialBoostedPost,
  ...props
}: AdsDashboardModalProps): ReactElement {
  const { openModal } = useLazyModal();
  const { data, isLoading, stats } = usePostBoost();
  const [toBoost, setToBoost] = useState<Post['id']>();
  const { post } = usePostById({ id: toBoost });
  const [boosted, setBoosted] = useState<BoostedPostData>(initialBoostedPost);
  const list = useMemo(() => {
    return data?.pages.flatMap((page) => page.edges.map((edge) => edge.node));
  }, [data]);

  useEffect(() => {
    if (post) {
      openModal({ type: LazyModal.BoostPost, props: { post } });
    }
  }, [openModal, post]);

  if (toBoost) {
    return null;
  }

  if (boosted) {
    return (
      <BoostedPostViewModal
        {...props}
        data={boosted}
        isLoading={isLoading}
        onBoostAgain={setToBoost}
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
        <Modal.Subtitle>Overview all time</Modal.Subtitle>
        <div className="grid grid-cols-2 gap-4">
          <DataTile
            label="Spend"
            value={stats.totalSpend}
            icon={<CoreIcon size={IconSize.XSmall} />}
            info={boostDashboardInfo.spend}
          />
          <DataTile
            label="Impressions"
            value={stats.impressions}
            info={boostDashboardInfo.impressions}
          />
          <DataTile
            label="Clicks"
            value={stats.clicks}
            info={boostDashboardInfo.clicks}
          />
          <DataTile
            label="Engagement"
            value={stats.engagements}
            info={boostDashboardInfo.engagement}
          />
        </div>
        <Modal.Subtitle>Active ads</Modal.Subtitle>
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
