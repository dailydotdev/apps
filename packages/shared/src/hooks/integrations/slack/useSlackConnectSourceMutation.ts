import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';

import { generateQueryKey, RequestKey } from '../../../lib/query';
import { labels } from '../../../lib';
import { useSlack } from './useSlack';
import { useToastNotification } from '../../useToastNotification';

export type UseSlackConnectSourceMutation = {
  onSave: (props: MutationProps) => Promise<void>;
  isSaving: boolean;
};

type MutationProps = {
  channelId: string;
  integrationId: string;
  sourceId: string;
};

export const useSlackConnectSourceMutation =
  (): UseSlackConnectSourceMutation => {
    const { user } = useAuthContext();
    const queryClient = useQueryClient();
    const slack = useSlack();
    const { displayToast } = useToastNotification();

    const { mutateAsync: onSave, isPending: isSaving } = useMutation({
      mutationFn: async ({
        channelId,
        integrationId,
        sourceId,
      }: MutationProps) => {
        await slack.connectSource({
          channelId,
          integrationId,
          sourceId,
        });
      },

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: generateQueryKey(RequestKey.UserSourceIntegrations, user),
        });

        displayToast(labels.integrations.success.integrationSaved);
      },

      onError: () => {
        displayToast(labels.error.generic);
      },
    });

    return {
      onSave,
      isSaving,
    };
  };
