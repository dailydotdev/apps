import type { ReactElement } from 'react';
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CampaignListView } from './CampaignListView';
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
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import { ElementPlaceholder } from '../../components/ElementPlaceholder';
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
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../../components/modals/common/types';
import { Origin } from '../../lib/log';

interface BoostedViewModalProps extends ModalProps {
  campaign: Campaign;
  isLoading?: boolean;
  onBack?: () => void;
}

export const stopBoostPromptOptions: PromptOptions = {
  title: 'Stop this boost?',
  description:
    'It stops being promoted right away. The Cores it has not spent yet go back to the wallet that paid for it.',
  okButton: {
    title: 'Stop boost',
    color: ButtonColor.Ketchup,
    className: 'flex !w-full',
  },
  cancelButton: {
    title: 'Keep boosting',
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
  onBack,
  ...props
}: BoostedViewModalProps): ReactElement {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { openModal } = useLazyModal();
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

  const onBoostAgain = ({ type, post, source }: Campaign) => {
    const origin = onBack ? Origin.AdsDashboard : Origin.BoostAgain;

    if (type === CampaignType.Post && post) {
      return openModal({
        type: LazyModal.BoostPost,
        props: { post, origin },
      });
    }

    if (type === CampaignType.Squad && source) {
      return openModal({
        type: LazyModal.BoostSquad,
        props: { squad: source, origin },
      });
    }

    return null;
  };

  const handleBoostClick = async () => {
    if (campaign.state === 'ACTIVE') {
      if (!(await showPrompt(stopBoostPromptOptions))) {
        return null;
      }

      return onCancelBoost(campaign);
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
      <Modal.Header
        title={
          campaign.type === CampaignType.Squad ? 'Squad boost' : 'Post boost'
        }
        closeOnPhone={!!onBack}
      >
        {!!onBack && (
          <Button
            onClick={onBack}
            className="-ml-2 mr-1"
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            icon={<ArrowIcon className="-rotate-90" />}
            aria-label="Back to boosts"
          />
        )}
      </Modal.Header>
      <Modal.Body>
        <CampaignListView
          campaign={campaign}
          isLoading={isLoading || isLoadingCancel}
          onBoostClick={handleBoostClick}
        />
      </Modal.Body>
    </Modal>
  );
}

const BoostedViewPlaceholder = ({
  message,
  ...props
}: ModalProps & { message?: string }): ReactElement => (
  <Modal
    {...props}
    isOpen
    kind={Modal.Kind.FixedCenter}
    size={Modal.Size.Small}
  >
    <Modal.Header title="Boost" closeOnPhone />
    <Modal.Body className="flex flex-col gap-6">
      {message ? (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="py-8 text-center"
        >
          {message}
        </Typography>
      ) : (
        <div className="flex flex-col gap-6" aria-busy>
          <ElementPlaceholder className="h-[4.5rem] rounded-16" />
          <ElementPlaceholder className="h-10 rounded-12" />
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((index) => (
              <ElementPlaceholder key={index} className="h-24 rounded-14" />
            ))}
          </div>
        </div>
      )}
    </Modal.Body>
  </Modal>
);

export function FetchBoostedViewModal({
  campaignId,
  ...props
}: Omit<BoostedViewModalProps, 'campaign'> & {
  campaignId: string;
}): ReactElement {
  const { user } = useAuthContext();
  const { data, isLoading } = useCampaignById(campaignId);

  if (isLoading) {
    return <BoostedViewPlaceholder {...props} />;
  }

  if (!data || !user || data.user.id !== user.id) {
    return (
      <BoostedViewPlaceholder
        {...props}
        message="This boost could not be found."
      />
    );
  }

  return <BoostedViewModal {...props} campaign={data} />;
}
