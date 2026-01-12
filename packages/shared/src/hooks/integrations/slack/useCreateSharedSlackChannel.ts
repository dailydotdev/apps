import { useMutation } from '@tanstack/react-query';
import { gqlClient } from '../../../graphql/common';
import { CREATE_SHARED_SLACK_CHANNEL_MUTATION } from '../../../graphql/integrations';
import { useToastNotification } from '../../useToastNotification';

export type CreateChannelParams = {
  email: string;
  channelName: string;
  opportunityId: string;
};

export type UseCreateSharedSlackChannel = {
  createChannel: (params: CreateChannelParams) => Promise<void>;
  isCreating: boolean;
};

export const useCreateSharedSlackChannel = (): UseCreateSharedSlackChannel => {
  const { displayToast } = useToastNotification();

  const { mutateAsync: createChannel, isPending: isCreating } = useMutation({
    mutationFn: async ({
      email,
      channelName,
      opportunityId,
    }: CreateChannelParams) => {
      if (!email) {
        throw new Error('Email is required');
      }

      if (!opportunityId) {
        throw new Error('Opportunity ID is required');
      }

      await gqlClient.request(CREATE_SHARED_SLACK_CHANNEL_MUTATION, {
        email,
        channelName,
        opportunityId,
      });
    },

    onSuccess: () => {
      displayToast('Slack channel created successfully!');
    },
  });

  return {
    createChannel,
    isCreating,
  };
};
