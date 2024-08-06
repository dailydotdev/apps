import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  REMOVE_INTEGRATION_MUTATION,
  REMOVE_SOURCE_INTEGRATION_MUTATION,
  UserIntegration,
  UserSourceIntegration,
} from '../../graphql/integrations';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePrompt } from '../usePrompt';
import {
  deleteIntegrationPromptOptions,
  deleteSourceIntegrationPromptOptions,
} from '../../lib/integrations';
import { gqlClient } from '../../graphql/common';

export type UseIntegration = {
  removeIntegration: ({
    integrationId,
  }: {
    integrationId: string;
  }) => Promise<void>;
  removeSourceIntegration: ({
    sourceId,
    integrationId,
  }: {
    sourceId: string;
    integrationId: string;
  }) => Promise<void>;
};

export const useIntegration = (): UseIntegration => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { showPrompt } = usePrompt();

  const { mutateAsync: removeIntegration } = useMutation(
    async ({ integrationId }: { integrationId: string }) => {
      const deleteConfirmed = await showPrompt(deleteIntegrationPromptOptions);

      if (!deleteConfirmed) {
        throw new Error('User cancelled integration deletion');
      }

      await gqlClient.request(REMOVE_INTEGRATION_MUTATION, {
        integrationId,
      });
    },
    {
      onSuccess: async (data, { integrationId }) => {
        queryClient.setQueryData<UserIntegration[]>(
          generateQueryKey(RequestKey.UserIntegrations, user),
          (currentIntegrations) => {
            return currentIntegrations?.filter(
              (integration) => integration.id !== integrationId,
            );
          },
        );
      },
    },
  );

  const { mutateAsync: removeSourceIntegration } = useMutation(
    async ({
      sourceId,
      integrationId,
    }: {
      sourceId: string;
      integrationId: string;
    }) => {
      const deleteConfirmed = await showPrompt(
        deleteSourceIntegrationPromptOptions,
      );

      if (!deleteConfirmed) {
        throw new Error('User cancelled source integration deletion');
      }

      await gqlClient.request(REMOVE_SOURCE_INTEGRATION_MUTATION, {
        sourceId,
        integrationId,
      });
    },
    {
      onSuccess: async (data, { sourceId, integrationId }) => {
        queryClient.setQueryData<UserSourceIntegration[]>(
          generateQueryKey(RequestKey.UserSourceIntegrations, user, {
            integrationId,
          }),
          (currentIntegrations) => {
            return currentIntegrations?.filter(
              (integration) =>
                (integration.userIntegration.id === integrationId &&
                  integration.source.id === sourceId) === false,
            );
          },
        );
        queryClient.removeQueries(
          generateQueryKey(RequestKey.UserSourceIntegrations, user, {
            sourceId,
          }),
        );
      },
    },
  );

  return {
    removeIntegration,
    removeSourceIntegration,
  };
};
