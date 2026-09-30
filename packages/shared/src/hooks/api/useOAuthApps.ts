import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createOAuthClient,
  deleteOAuthClient,
  deleteOAuthConsent,
  getOAuthClients,
  getOAuthConsents,
  getOAuthPublicClient,
  OAuthRequestError,
  rotateOAuthClientSecret,
  updateOAuthClient,
} from '../../lib/oauthApps';
import type { OAuthClient, OAuthConsent } from '../../lib/oauthApps';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../useConditionalFeature';
import { featureOAuthApps } from '../../lib/featureManagement';

export type OAuthConsentWithClient = OAuthConsent & {
  client: OAuthClient | null;
};

export const oauthClientsQueryOptions = () => ({
  queryKey: generateQueryKey(RequestKey.OAuthClients),
  queryFn: getOAuthClients,
  staleTime: StaleTime.OneMinute,
});

export const oauthConsentsQueryOptions = () => ({
  queryKey: generateQueryKey(RequestKey.OAuthConsents),
  queryFn: async (): Promise<OAuthConsentWithClient[]> => {
    const consents = await getOAuthConsents();
    return Promise.all(
      consents.map(async (consent) => ({
        ...consent,
        client: await getOAuthPublicClient(consent.clientId).catch((err) => {
          if (err instanceof OAuthRequestError && err.status === 404) {
            return null;
          }

          throw err;
        }),
      })),
    );
  },
  staleTime: StaleTime.OneMinute,
});

const useIsOAuthAppsEnabled = (): boolean => {
  const { user } = useAuthContext();
  const { value: isFlagOn } = useConditionalFeature({
    feature: featureOAuthApps,
    shouldEvaluate: !!user,
  });

  return !!user && isFlagOn;
};

export const useOAuthClients = () => {
  const enabled = useIsOAuthAppsEnabled();

  return useQuery({
    ...oauthClientsQueryOptions(),
    enabled,
  });
};

export const useOAuthConsents = () => {
  const enabled = useIsOAuthAppsEnabled();

  return useQuery({
    ...oauthConsentsQueryOptions(),
    enabled,
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
