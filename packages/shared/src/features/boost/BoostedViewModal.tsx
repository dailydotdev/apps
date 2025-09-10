import type { ReactElement } from 'react';
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BoostStatus } from './CampaignListItem';
import { CampaignListView, CampaignStatsGrid } from './CampaignListView';
import type { ModalProps } from '../../components/modals/common/Modal';
import { Modal } from '../../components/modals/common/Modal';
import type { Campaign } from '../../graphql/campaigns';
import { CampaignType, useCampaignById } from '../../graphql/campaigns';
import { useCampaignMutation } from './useCampaignMutation';
import type { PromptOptions } from '../../hooks/usePrompt';
import { usePrompt } from '../../hooks/usePrompt';
import {
  Button,
  ButtonColor,
  ButtonVariant,
} from '../../components/buttons/Button';
import { ArrowIcon } from '../../components/icons';
import type { PostData } from '../../graphql/posts';
import {
  updatePostCache,
  getPostByIdKey,
  generateQueryKey,
  RequestKey,
} from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import type { Squad } from '../../graphql/sources';

interface BoostedViewModalProps extends ModalProps {
  campaign: Campaign;
  isLoading?: boolean;
  onBack?: () => void;
  onBoostAgain?: (props: Campaign) => void;
}

export const stopBoostPromptOptions: PromptOptions = {
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
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { showPrompt } = usePrompt();
  const callbackFn = onBack || (() => props.onRequestClose(null));
  const { onCancelBoost, isLoadingCancel } = useCampaignMutation({
    onCancelSuccess: (data) => {
      if (!data.transactionId) {
        return callbackFn();
      }

      const id = campaign.referenceId;

      if (campaign.type === CampaignType.Post) {
        updatePostCache(client, id, (old) => ({
          flags: { ...old.flags, campaignId: null },
        }));

        client.setQueryData<PostData>(getPostByIdKey(id), (old) => {
          if (!old) {
            return old;
          }

          return {
            ...old,
            post: {
              ...old.post,
              flags: { ...old.post.flags, campaignId: null },
            },
          };
        });
      }

      if (campaign.type === CampaignType.Squad) {
        const key = generateQueryKey(
          RequestKey.Squad,
          user,
          campaign.source?.handle,
        );

        client.setQueryData<Squad>(key, (old) => {
          if (!old) {
            return old;
          }

          return {
            ...old,
            flags: { ...old.flags, campaignId: null },
          };
        });
      }

      return callbackFn();
    },
  });

  const handleBoostClick = async () => {
    if (campaign.state === 'ACTIVE') {
      if (!(await showPrompt(stopBoostPromptOptions))) {
        return null;
      }

      return onCancelBoost(campaign.id);
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
