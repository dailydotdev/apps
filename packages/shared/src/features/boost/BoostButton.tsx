import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../graphql/posts';
import type { ButtonProps } from '../../components/buttons/Button';
import { Button, ButtonColor } from '../../components/buttons/Button';
import { ButtonVariant } from '../../components/buttons/common';
import { BoostIcon } from '../../components/icons/Boost';
import { LazyModal } from '../../components/modals/common/types';
import { useLazyModal } from '../../hooks/useLazyModal';
import { boostButton } from '../../styles/custom';
import { useCampaignById } from '../../graphql/campaigns';

interface BoostButtonProps {
  buttonProps?: ButtonProps<'button'>;
  campaignId?: string;
}

export function BoostButton({
  buttonProps = {},
  campaignId,
}: BoostButtonProps): ReactElement {
  return (
    <Button
      style={{ background: campaignId ? undefined : boostButton }}
      variant={campaignId ? ButtonVariant.Subtle : ButtonVariant.Primary}
      {...buttonProps}
      icon={<BoostIcon secondary />}
      color={ButtonColor.BlueCheese}
    >
      {campaignId ? 'Boosting' : 'Boost'}
    </Button>
  );
}

export function BoostPostButton({
  post,
  buttonProps = {},
}: {
  post: Post;
  buttonProps?: ButtonProps<'button'>;
}): ReactElement {
  const { openModal } = useLazyModal();
  const campaignId = post?.flags?.campaignId;
  const { data: campaign, isFetched } = useCampaignById(campaignId);

  const onBoost = () =>
    openModal({ type: LazyModal.BoostPost, props: { post } });

  const onViewBoost = () =>
    openModal({ type: LazyModal.BoostedCampaignView, props: { campaign } });

  return (
    <BoostButton
      campaignId={campaignId}
      buttonProps={{
        ...buttonProps,
        loading: campaignId && !isFetched,
        onClick: campaignId ? onViewBoost : onBoost,
      }}
    />
  );
}
