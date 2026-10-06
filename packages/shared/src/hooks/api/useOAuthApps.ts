import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createOAuthClient,
  deleteOAuthClient,
  deleteOAuthConsent,
  oauthClientsQueryOptions,
  oauthConsentsQueryOptions,
  rotateOAuthClientSecret,
  updateOAuthClient,
} from '../../lib/oauthApps';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';

export const useOAuthClients = () => {
  const { user } = useAuthContext();

  return useQuery({
    ...oauthClientsQueryOptions(),
    enabled: !!user,
  });
};

export const useOAuthConsents = () => {
  const { user } = useAuthContext();

  return useQuery({
    ...oauthConsentsQueryOptions(),
    enabled: !!user,
  });
};

const useInvalidatingMutation = <TInput, TResult>(
  mutationFn: (input: TInput) => Promise<TResult>,
  requestKeys: RequestKey[],
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      requestKeys.forEach((requestKey) =>
        queryClient.invalidateQueries({
          queryKey: generateQueryKey(requestKey),
        }),
      );
    },
  });
};

export const useCreateOAuthClient = () =>
  useInvalidatingMutation(createOAuthClient, [RequestKey.OAuthClients]);

export const useUpdateOAuthClient = () =>
  useInvalidatingMutation(updateOAuthClient, [
    RequestKey.OAuthClients,
    RequestKey.OAuthConsents,
  ]);

export const useRotateOAuthClientSecret = () =>
  useInvalidatingMutation(rotateOAuthClientSecret, [RequestKey.OAuthClients]);

export const useDeleteOAuthClient = () =>
  useInvalidatingMutation(deleteOAuthClient, [
    RequestKey.OAuthClients,
    RequestKey.OAuthConsents,
  ]);

export const useDeleteOAuthConsent = () =>
  useInvalidatingMutation(deleteOAuthConsent, [RequestKey.OAuthConsents]);
