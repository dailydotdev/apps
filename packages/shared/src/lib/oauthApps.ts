import { apiUrl, publicApiUrl } from './config';
import { getBetterAuthErrorMessage } from './betterAuth';
import { generateQueryKey, RequestKey, StaleTime } from './query';

export type OAuthClient = {
  client_id: string;
  client_secret?: string;
  client_name?: string;
  client_uri?: string;
  logo_uri?: string;
  redirect_uris: string[];
  client_id_issued_at?: number;
  disabled?: boolean;
};

export type OAuthConsent = {
  id: string;
  clientId: string;
  scopes: string[];
  createdAt: string;
};

export type OAuthClientInput = {
  client_name: string;
  redirect_uris: string[];
  client_uri?: string;
  logo_uri?: string;
};

export const OAUTH_SCOPES = [
  'openid',
  'profile',
  'offline_access',
  'read',
  'write',
];

export const MAX_OAUTH_APPS_PER_USER = 5;

export const oauthEndpoints = {
  authorize: `${publicApiUrl}/auth/oauth2/authorize`,
  token: `${publicApiUrl}/auth/oauth2/token`,
  publicApiResource: `${publicApiUrl}/public/v1`,
  mcpResource: `${publicApiUrl}/mcp`,
};

export class OAuthRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const oauthRequest = async <T>(
  path: string,
  body?: Record<string, unknown>,
): Promise<T> => {
  const res = await fetch(`${apiUrl}/auth/oauth2/${path}`, {
    method: body ? 'POST' : 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body && { 'Content-Type': 'application/json' }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new OAuthRequestError(
      getBetterAuthErrorMessage(data?.error_description ?? data),
      res.status,
    );
  }

  return data as T;
};

export const getOAuthClients = (): Promise<OAuthClient[]> =>
  oauthRequest<OAuthClient[]>('get-clients');

export const createOAuthClient = (
  input: OAuthClientInput,
): Promise<OAuthClient> =>
  oauthRequest<OAuthClient>('create-client', {
    ...input,
    token_endpoint_auth_method: 'client_secret_post',
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
  });

export const updateOAuthClient = ({
  clientId,
  update,
}: {
  clientId: string;
  update: OAuthClientInput;
}): Promise<OAuthClient> =>
  oauthRequest<OAuthClient>('update-client', { client_id: clientId, update });

export const rotateOAuthClientSecret = (
  clientId: string,
): Promise<OAuthClient> =>
  oauthRequest<OAuthClient>('client/rotate-secret', { client_id: clientId });

export const deleteOAuthClient = (clientId: string): Promise<void> =>
  oauthRequest<void>('delete-client', { client_id: clientId });

export const getOAuthConsents = (): Promise<OAuthConsent[]> =>
  oauthRequest<OAuthConsent[]>('get-consents');

export const getOAuthPublicClient = (clientId: string): Promise<OAuthClient> =>
  oauthRequest<OAuthClient>(
    `public-client?client_id=${encodeURIComponent(clientId)}`,
  );

export const deleteOAuthConsent = (id: string): Promise<void> =>
  oauthRequest<void>('delete-consent', { id });

export type OAuthConsentWithClient = OAuthConsent & {
  client: OAuthClient | null;
  isClientDisabled: boolean;
};

export const oauthClientsQueryOptions = () => ({
  queryKey: generateQueryKey(RequestKey.OAuthClients),
  queryFn: getOAuthClients,
  staleTime: StaleTime.OneMinute,
});

export const oauthPublicClientQueryOptions = (clientId: string) => ({
  queryKey: generateQueryKey(RequestKey.OAuthPublicClient, undefined, clientId),
  queryFn: () => getOAuthPublicClient(clientId),
});

export const oauthConsentsQueryOptions = () => ({
  queryKey: generateQueryKey(RequestKey.OAuthConsents),
  queryFn: async (): Promise<OAuthConsentWithClient[]> => {
    const consents = await getOAuthConsents();
    return Promise.all(
      consents.map(async (consent) => {
        try {
          const client = await getOAuthPublicClient(consent.clientId);
          return { ...consent, client, isClientDisabled: false };
        } catch (err) {
          return {
            ...consent,
            client: null,
            isClientDisabled:
              err instanceof OAuthRequestError && err.status === 404,
          };
        }
      }),
    );
  },
  staleTime: StaleTime.OneMinute,
});
