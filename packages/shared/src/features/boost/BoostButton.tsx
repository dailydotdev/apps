import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../graphql/posts';
import type { ButtonProps } from '../../components/buttons/Button';
import { Button, ButtonColor } from '../../components/buttons/Button';
import { ButtonVariant } from '../../components/buttons/common';
import { BoostIcon } from '../../components/icons/Boost';
import { LazyModal } from '../../components/modals/common/types';
import { useLazyModal } from '../../hooks/useLazyModal';
import type { Squad } from '../../graphql/sources';
import { boostButton } from '../../styles/custom';
import { useCampaignById } from '../../graphql/campaigns';
import { useAuthContext } from '../../contexts/AuthContext';
import ConditionalWrapper from '../../components/ConditionalWrapper';
import { Tooltip } from '../../components/tooltip/Tooltip';

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
      style={{ background: boostButton }}
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
    openModal({ type: LazyModal.BoostedPostView, props: { campaign } });

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

export function BoostSourceButton({
  squad,
  buttonProps = {},
}: {
  squad: Squad;
  buttonProps?: ButtonProps<'button'>;
}): ReactElement {
  const { openModal } = useLazyModal();
  const { user } = useAuthContext();
  const campaignId = squad?.flags?.campaignId;
  const { data: campaign, isFetched } = useCampaignById(campaignId);
  const isBooster = user.id === campaign?.user.id;

  const onBoost = () =>
    openModal({ type: LazyModal.BoostSquad, props: { squad } });

  const onViewBoost = () =>
    openModal({ type: LazyModal.BoostedPostView, props: { campaign } });

  const onClick = () => {
    if (!isBooster) {
      return null;
    }

    if (campaignId) {
      return onViewBoost();
    }

    return onBoost();
  };

  const hasTooltip = campaignId && !isBooster && !!campaign;

  return (
    <ConditionalWrapper
      condition={hasTooltip}
      wrapper={(component) => (
        <Tooltip
          className="max-w-64"
          content={`The Squad is currently being boosted by ${
            campaign.user.name
          }. You can start a new boost once this one ends on ${campaign.endedAt.toLocaleString()}`}
        >
          <div>{component}</div>
        </Tooltip>
      )}
    >
      <BoostButton
        campaignId={campaignId}
        buttonProps={{
          ...buttonProps,
          onClick,
          disabled: hasTooltip,
          loading: campaignId && !isFetched,
        }}
      />
    </ConditionalWrapper>
  );
}
