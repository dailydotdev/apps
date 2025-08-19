import type { ReactElement } from 'react';
import React from 'react';
import { BoostStatus } from './CampaignListItem';
import { CampaignListView, CampaignStatsGrid } from './CampaignListView';
import type { ModalProps } from '../../components/modals/common/Modal';
import { Modal } from '../../components/modals/common/Modal';
import type { Campaign } from '../../graphql/campaigns';
import { useCampaignById } from '../../graphql/campaigns';
import { useCampaignMutation } from './useCampaignMutation';
import type { PromptOptions } from '../../hooks/usePrompt';
import { usePrompt } from '../../hooks/usePrompt';
import {
  Button,
  ButtonColor,
  ButtonVariant,
} from '../../components/buttons/Button';
import { ArrowIcon } from '../../components/icons';

interface BoostedViewModalProps extends ModalProps {
  campaign: Campaign;
  isLoading?: boolean;
  onBack?: () => void;
  onBoostAgain?: (props: Campaign) => void;
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

export function BoostedViewModal({
  campaign,
  isLoading,
  onBoostAgain,
  onBack,
  ...props
}: BoostedViewModalProps): ReactElement {
  const { showPrompt } = usePrompt();
  const { onCancelBoost, isLoadingCancel } = useCampaignMutation({
    onCancelSuccess: onBack || (() => props.onRequestClose(null)),
  });

  const handleBoostClick = async () => {
    if (campaign.state === 'ACTIVE') {
      if (!(await showPrompt(promptOptions))) {
        return null;
      }

      return onCancelBoost(campaign.referenceId);
    }

    return onBoostAgain(campaign);
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
          <BoostStatus status={campaign.state} />
        </span>
        <CampaignListView
          campaign={campaign}
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
}: Omit<BoostedViewModalProps, 'campaign'> & {
  campaignId: string;
}): ReactElement {
  const { data, isLoading } = useCampaignById(campaignId);

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
          <CampaignStatsGrid users={0} spend={0} impressions={0} />
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
          <CampaignStatsGrid users={0} spend={0} impressions={0} />
        </div>
      </Modal>
    );
  }

  return <BoostedViewModal {...props} campaign={data} />;
}
