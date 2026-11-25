import { useQueryClient } from '@tanstack/react-query';
import type { Campaign } from '../../graphql/campaigns';
import { CampaignType } from '../../graphql/campaigns';
import type { PostData } from '../../graphql/posts';
import type { Squad } from '../../graphql/sources';
import type { PromptOptions } from '../../hooks/usePrompt';
import { usePrompt } from '../../hooks/usePrompt';
import { ButtonColor, ButtonVariant } from '../../components/buttons/Button';
import {
  generateQueryKey,
  getPostByIdKey,
  RequestKey,
  updatePostCache,
} from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { useCampaignMutation } from './useCampaignMutation';

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

// Nothing was paid for a company page's free boost, and a stopped one isn't
// replaced
const stopFreeBoostPromptOptions: PromptOptions = {
  ...stopBoostPromptOptions,
  title: 'Stop your free boost?',
  description:
    "It stops reaching developers right away. You won't get another free boost.",
};

/** The flags, minus the boost that just stopped */
const withoutCampaign = <T extends { campaignId?: string | null }>(
  flags: T | undefined,
): T | undefined => {
  if (!flags) {
    return flags;
  }

  const { campaignId, ...rest } = flags;

  return rest as T;
};

interface UseStopBoost {
  /** Asks first, then stops the boost and refunds its unspent Cores */
  onStopBoost: (campaign: Campaign) => Promise<void>;
  isStopping: boolean;
}

export const useStopBoost = (): UseStopBoost => {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { showPrompt } = usePrompt();
  const { onCancelBoost, isLoadingCancel } = useCampaignMutation({});

  const clearBoostedFlag = (campaign: Campaign) => {
    const id = campaign.referenceId;

    if (campaign.type === CampaignType.Post) {
      updatePostCache(client, id, (old) => ({
        flags: withoutCampaign(old.flags),
      }));

      client.setQueryData<PostData>(getPostByIdKey(id), (old) =>
        old
          ? {
              ...old,
              post: { ...old.post, flags: withoutCampaign(old.post.flags) },
            }
          : old,
      );
    }

    if (campaign.type === CampaignType.Squad) {
      client.setQueryData<Squad>(
        generateQueryKey(RequestKey.Squad, user, campaign.source?.handle),
        (old) => (old ? { ...old, flags: withoutCampaign(old.flags) } : old),
      );
    }
  };

  const onStopBoost = async (campaign: Campaign) => {
    const prompt =
      campaign.flags?.origin === 'free_boost'
        ? stopFreeBoostPromptOptions
        : stopBoostPromptOptions;

    if (!(await showPrompt(prompt))) {
      return;
    }

    // The mutation already shows a toast when it fails
    const data = await onCancelBoost(campaign).catch(() => null);

    if (data?.transactionId) {
      clearBoostedFlag(campaign);
    }
  };

  return { onStopBoost, isStopping: isLoadingCancel };
};
