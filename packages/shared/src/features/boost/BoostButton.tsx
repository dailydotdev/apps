import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type { Post } from '../../graphql/posts';
import type { ButtonProps } from '../../components/buttons/Button';
import { Button, ButtonColor } from '../../components/buttons/Button';
import { ButtonVariant } from '../../components/buttons/common';
import { BoostIcon } from '../../components/icons/Boost';
import { LazyModal } from '../../components/modals/common/types';
import { useLazyModal } from '../../hooks/useLazyModal';
import { Origin } from '../../lib/log';
import { boostManagerUrl } from '../../lib/constants';
import { useBoostOriginContext } from './BoostOriginContext';

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
      variant={campaignId ? ButtonVariant.Subtle : ButtonVariant.Primary}
      color={ButtonColor.BlueCheese}
      {...buttonProps}
      icon={<BoostIcon secondary />}
    >
      {campaignId ? 'Boosting' : 'Boost'}
    </Button>
  );
}

export function BoostPostButton({
  post,
  buttonProps = {},
  origin: originProp,
}: {
  post: Post;
  buttonProps?: ButtonProps<'button'>;
  origin?: Origin;
}): ReactElement {
  const router = useRouter();
  const { openModal } = useLazyModal();
  const { origin: contextOrigin } = useBoostOriginContext();
  const origin = originProp ?? contextOrigin ?? Origin.PostBoostButton;
  const campaignId = post?.flags?.campaignId ?? undefined;

  const onBoost = () =>
    openModal({ type: LazyModal.BoostPost, props: { post, origin } });

  const onViewBoost = () => router.push(boostManagerUrl);

  return (
    <BoostButton
      campaignId={campaignId}
      buttonProps={{
        ...buttonProps,
        onClick: campaignId ? onViewBoost : onBoost,
      }}
    />
  );
}
