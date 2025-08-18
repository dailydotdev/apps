import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '../../common/Modal';
import type { ModalProps } from '../../common/Modal';
import { useCampaigns } from '../../../../hooks/post/useCampaigns';
import { BoostHistoryLoading } from '../../../../features/boost/BoostHistoryLoading';
import { BoostedPostViewModal } from './BoostedPostViewModal';
import { usePostById } from '../../../../hooks';
import type { Post } from '../../../../graphql/posts';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { LazyModal } from '../../common/types';
import { CampaignList } from '../../../../features/boost/CampaignList';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import { boostDocsLink } from '../../../../lib/constants';
import { CampaignStatsGrid } from '../../../../features/boost/CampaignListView';
import type { Campaign } from '../../../../graphql/campaigns';

interface AdsDashboardModalProps extends ModalProps {
  initialCampaign?: Campaign;
}

export function AdsDashboardModal({
  initialCampaign,
  ...props
}: AdsDashboardModalProps): ReactElement {
  const { openModal } = useLazyModal();
  const { data, isLoading, stats, infiniteScrollingProps } = useCampaigns();
  const [toBoost, setToBoost] = useState<Post['id']>();
  const { post } = usePostById({ id: toBoost });
  const [boosted, setBoosted] = useState(initialCampaign);
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
        campaign={boosted}
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
        <CampaignStatsGrid
          spend={stats.spend}
          users={stats.users}
          impressions={stats.impressions}
        />
        <Modal.Subtitle>Active ads</Modal.Subtitle>
        {!isLoading && !!list?.length && (
          <div className="flex flex-col gap-1">
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              Learn how boosting works and launch your first campaign to get
              discovered by more developers.
            </Typography>
            <a
              href={boostDocsLink}
              className="text-text-link typo-callout"
              target="_blank"
            >
              Learn more about boosting
            </a>
          </div>
        )}
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
