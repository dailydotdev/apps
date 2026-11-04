import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ModalProps } from '../../components/modals/common/Modal';
import type { Post } from '../../graphql/posts';
import { SourceType } from '../../graphql/sources';
import type { Origin } from '../../lib/log';
import { CampaignType } from '../../graphql/campaigns';
import { usePostBoostEstimation } from './usePostBoostEstimation';
import { updatePostCache } from '../../lib/query';
import { BoostModal, useBoostSettings } from './BoostModal';
import { BoostTarget } from './BoostTarget';

interface BoostPostModalProps extends ModalProps {
  post: Post;
  origin?: Origin;
}

export function BoostPostModal({
  post,
  origin,
  ...props
}: BoostPostModalProps): ReactElement {
  const client = useQueryClient();
  const { default_cores: defaultBudget } = useBoostSettings();
  const [budget, setBudget] = useState(defaultBudget);
  const estimate = usePostBoostEstimation({ post, query: { budget } });

  return (
    <BoostModal
      {...props}
      type={CampaignType.Post}
      referenceId={post.id}
      walletSourceId={
        post.source?.type === SourceType.Squad ? post.source.id : undefined
      }
      origin={origin}
      target={
        <BoostTarget
          post={post}
          className="rounded-16 border border-border-subtlest-tertiary p-3"
        />
      }
      estimate={estimate}
      onEstimateBudget={setBudget}
      onBoostSuccess={(data, vars) => {
        if (data.referenceId) {
          updatePostCache(client, vars.value, (old) => ({
            flags: { ...old.flags, campaignId: data.referenceId },
          }));
        }
      }}
    />
  );
}

export default BoostPostModal;
