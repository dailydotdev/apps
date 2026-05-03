import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../graphql/posts';
import type { ButtonV2Props } from '../../components/buttons/ButtonV2';
import { ButtonV2, ButtonColor } from '../../components/buttons/ButtonV2';
import { ButtonVariant } from '../../components/buttons/common';
import { BoostIcon } from '../../components/icons/Boost';
import { LazyModal } from '../../components/modals/common/types';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useCampaignById } from '../../graphql/campaigns';

interface BoostButtonProps {
  buttonProps?: ButtonV2Props<'button'>;
  campaignId?: string;
}

export function BoostButton({
  buttonProps = {},
  campaignId,
}: BoostButtonProps): ReactElement {
  return (
    <ButtonV2
      variant={campaignId ? ButtonVariant.Subtle : ButtonVariant.Primary}
      {...buttonProps}
      icon={<BoostIcon secondary />}
      color={ButtonColor.BlueCheese}
    >
      {campaignId ? 'Boosting' : 'Boost'}
    </ButtonV2>
  );
}

export function BoostPostButton({
  post,
  buttonProps = {},
}: {
  post: Post;
  buttonProps?: ButtonV2Props<'button'>;
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
