import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { Modal } from '../../components/modals/common/Modal';
import type { ModalProps } from '../../components/modals/common/Modal';
import { useCampaigns } from './useCampaigns';
import { BoostHistoryLoading } from './BoostHistoryLoading';
import { BoostedViewModal } from './BoostedViewModal';
import { CampaignList } from './CampaignList';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import { boostDocsLink } from '../../lib/constants';
import { CampaignStatsGrid } from './CampaignListView';
import type { Campaign } from '../../graphql/campaigns';
import { CampaignType } from '../../graphql/campaigns';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../../components/modals/common/types';

interface AdsDashboardModalProps extends ModalProps {
  initialCampaign?: Campaign;
}

export function AdsDashboardModal({
  initialCampaign,
  ...props
}: AdsDashboardModalProps): ReactElement {
  const { openModal } = useLazyModal();
  const { data, isLoading, stats, infiniteScrollingProps } = useCampaigns();
  const [boosted, setBoosted] = useState(initialCampaign);
  const list = useMemo(() => {
    return data?.pages.flatMap((page) => page.edges.map((edge) => edge.node));
  }, [data]);

  const onBoostAgain = ({ type, post, source }: Campaign) => {
    switch (type) {
      case CampaignType.Post:
        return openModal({
          type: LazyModal.BoostPost,
          props: { post },
        });
      case CampaignType.Source:
        return openModal({
          type: LazyModal.BoostSquad,
          props: { squad: source },
        });
      default:
        return null;
    }
  };

  if (boosted) {
    return (
      <BoostedViewModal
        {...props}
        campaign={boosted}
        isLoading={isLoading}
        onBoostAgain={onBoostAgain}
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
