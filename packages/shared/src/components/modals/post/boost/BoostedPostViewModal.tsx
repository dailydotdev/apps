import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BoostStatus } from '../../../../features/boost/CampaignListItem';
import {
  CampaignListView,
  CampaignStatsGrid,
} from '../../../../features/boost/CampaignListView';
import type { ModalProps } from '../../common/Modal';
import { Modal } from '../../common/Modal';
import type { BoostedPostData } from '../../../../graphql/post/boost';
import { getBoostedPostByCampaignId } from '../../../../graphql/post/boost';
import { usePostBoostMutation } from '../../../../hooks/post/usePostBoostMutations';
import type { Post } from '../../../../graphql/posts';
import { generateQueryKey, RequestKey, StaleTime } from '../../../../lib/query';
import { useAuthContext } from '../../../../contexts/AuthContext';
import type { PromptOptions } from '../../../../hooks/usePrompt';
import { usePrompt } from '../../../../hooks/usePrompt';
import { Button, ButtonColor, ButtonVariant } from '../../../buttons/Button';
import { ArrowIcon } from '../../../icons';

interface BoostedPostViewModalProps extends ModalProps {
  data: BoostedPostData;
  isLoading?: boolean;
  onBack?: () => void;
  onBoostAgain?: (id: Post['id']) => void;
}

const promptOptions: PromptOptions = {
  title: 'Stop this boost?',
  description:
    "If you stop this boost now, it will no longer be promoted. We'll credit the remaining Cores back to your balance for the unused budget",
  okButton: {
    title: 'Stop boost',
    color: ButtonColor.Ketchup,
    className: 'flex !w-full',
  },
  cancelButton: {
    className: 'flex !w-full',
    variant: ButtonVariant.Float,
  },
  className: {
    buttons: 'flex !flex-col-reverse w-full',
  },
};

export function BoostedPostViewModal({
  data,
  isLoading,
  onBoostAgain,
  onBack,
  ...props
}: BoostedPostViewModalProps): ReactElement {
  const { showPrompt } = usePrompt();
  const { onCancelBoost, isLoadingCancel } = usePostBoostMutation({
    onCancelSuccess: () => props.onRequestClose(null),
  });

  const handleBoostClick = async () => {
    if (data.campaign.status === 'ACTIVE') {
      if (!(await showPrompt(promptOptions))) {
        return null;
      }

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
      <Modal.Header className="flex flex-row gap-2">
        {!!onBack && (
          <Button
            onClick={onBack}
            className="hidden tablet:flex"
            variant={ButtonVariant.Tertiary}
            icon={<ArrowIcon className="-rotate-90" />}
          />
        )}
        <Modal.Header.Title>Boost</Modal.Header.Title>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4">
        <span className="flex flex-row items-center justify-between">
          <Modal.Subtitle>Overview</Modal.Subtitle>
          <BoostStatus status={data.campaign.status} />
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
