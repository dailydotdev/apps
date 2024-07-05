import { authUrl, heimdallUrl } from './constants';

export type EmptyObjectLiteral = Record<string, never | string>;

interface InitializationNodeAttribute {
  name: string;
  type: string;
  value?: string;
  required?: boolean;
  disabled: boolean;
  node_type: string;
}

export enum MessageType {
  Error = 'error',
}

export interface KratosMessage {
  id: number;
  text: string;
  type: MessageType | string;
  context?: MetaLabelContext;
}

interface MetaLabelContext {
  reason: string;
}

interface NodeMetaLabel {
  id: number;
  text: string;
  type: string;
  context?: MetaLabelContext | EmptyObjectLiteral;
}

interface InitializationNodeMeta {
  label: NodeMetaLabel;
}

export interface InitializationNode {
  type: string;
  group: string;
  attributes: InitializationNodeAttribute;
  messages: KratosMessage[];
  meta: InitializationNodeMeta | EmptyObjectLiteral;
}

interface InitializationUI {
  action: string;
  method: string;
  messages?: KratosMessage[];
  nodes: InitializationNode[];
}

export type AuthenticatorLevel = 'aal0' | 'aal1';
export type KratosMethod =
  | 'link'
  | 'link_recovery'
  | 'password'
  | 'profile'
  | 'code';
export type AuthenticationType = 'password' | 'oidc';

interface IdentityCredential {
  config: Record<string, string>;
  created_at: Date;
  identifiers: string[];
  type: AuthenticationType;
  updated_at: Date;
  version: number;
}

type DateString = string;

export interface InitializationData {
  id: string;
  issued_at: DateString;
  expires_at: DateString;
  created_at?: DateString;
  updated_at?: DateString;
  request_url: string;
  type?: string;
  refresh?: boolean;
  ui: InitializationUI;
  requested_aal?: AuthenticatorLevel;
  state?: string;
  error?: KratosError;
}

interface KratosEmailData {
  result?: boolean;
  error?: {
    message?: string;
  };
}

type Method = 'link_recovery' | 'password';

interface AuthMethod {
  aal: AuthenticatorLevel;
  completed_at: Date;
  method: Method;
}

interface IdentityTraits {
  username: string;
  name: string;
  email: string;
  image: string;
}

interface RecoveryAddress {
  id: string;
  created_at: DateString;
  updated_at: DateString;
  value: string;
  via: string;
}

interface VerifiableAddress extends RecoveryAddress {
  status: string;
  verified: boolean;
  verified_at?: Date;
  id: string;
  value: string;
  via: string;
}

export interface Identity {
  created_at: DateString;
  credentials?: Record<string, IdentityCredential>;
  id: string;
  metadata_admin?: unknown;
  metadata_public?: unknown;
  recovery_addresses: RecoveryAddress[];
  schema_id: string;
  schema_url: string;
  state: 'active';
  state_changed_at: DateString;
  traits: IdentityTraits;
  updated_at: DateString;
  verifiable_addresses: VerifiableAddress[];
}

export interface LogoutSessionData {
  logout_token: string;
  logout_url: string;
}

export interface AuthSession extends Partial<LogoutSessionData> {
  active: boolean;
  authenticated_at: Date;
  authentication_methods: AuthMethod[];
  authenticator_assurance_level: AuthenticatorLevel;
  expires_at: Date;
  id: string;
  identity: Identity;
  issued_at: Date;
}

export interface VerificationSession {
  ok?: boolean;
  result?: {
    flow_id?: string;
  };
}

export enum ContinueWithAction {
  ShowVerification = 'show_verification_ui',
}

interface Flow {
  id: string;
  url: string;
  verifiable_address: string;
}

interface ContinueWith {
  action: ContinueWithAction;
  flow: Flow;
}

export interface SuccessfulRegistrationData {
  session: AuthSession;
  identity: Identity;
  continue_with: ContinueWith[];
}

export interface KratosError {
  code: number;
  message: string;
  reason: string;
  id?: string;
  debug?: string;
}

export interface ErrorData {
  created_at: DateString;
  updated_at: DateString;
  id: string;
  error: KratosError;
}

export enum AuthEvent {
  Login = 'login',
  Error = 'error',
  SocialRegistration = 'social_registration',
}

export enum AuthFlow {
  Login = '/login',
  Registration = '/registration',
  Settings = '/settings',
  Recovery = '/recovery',
  Verification = '/verification',
}

export const initializeKratosFlow = async (
  flow: AuthFlow,
  params: EmptyObjectLiteral = {},
): Promise<InitializationData> => {
  const search = new URLSearchParams(params);
  const res = await fetch(`${authUrl}/self-service${flow}/browser?${search}`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  return res.json();
};

export const getKratosSettingsFlow = async (
  flow: AuthFlow,
  id: string,
): Promise<InitializationData> => {
  const res = await fetch(`${authUrl}/self-service${flow}/flows?id=${id}`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  return res.json();
};

export const getKratosFlow = async <T = InitializationData>(
  flow: AuthFlow,
  id: string,
): Promise<T> => {
  const res = await fetch(`${authUrl}/self-service${flow}?flow=${id}`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  return res.json();
};

export const getKratosError = async (id: string): Promise<ErrorData> => {
  const res = await fetch(`${authUrl}/self-service/errors?id=${id}`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  return res.json();
};

export const checkKratosEmail = async (
  email: string,
): Promise<KratosEmailData> => {
  const url = new URL(`${heimdallUrl}/api/check_email`);
  url.searchParams.append('email_address', email);
  const res = await fetch(url.toString(), {
    method: 'POST',
  });
  return res.json();
};

export interface RequestResponse<TData = unknown, TError = InitializationData> {
  data?: TData;
  error?: TError;
  redirect?: string;
  code?: number;
}

export interface AuthPostParams {
  csrf_token: string;
}

export interface KratosFormParams<T extends AuthPostParams> {
  action: string;
  params: T;
  method?: string;
}

export interface KratosProviderData {
  ok: boolean;
  result: string[];
}

export const getKratosProviders = async (
  flow?: string,
): Promise<KratosProviderData> => {
  const search = flow ? new URLSearchParams({ flow }) : '';
  const res = await fetch(`${heimdallUrl}/api/list_providers?${search}`, {
    credentials: 'include',
    method: flow ? 'GET' : 'POST',
  });
  return res.json();
};

export const submitKratosFlow = async <
  R extends RequestResponse = RequestResponse,
  E = InitializationData,
  T extends AuthPostParams = AuthPostParams,
>({
  action,
  params,
  method = 'POST',
}: KratosFormParams<T>): Promise<RequestResponse<R, E>> => {
  const res = await fetch(action, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': params.csrf_token,
      Accept: 'application/json',
    },
    body: method === 'GET' ? undefined : JSON.stringify(params),
  });

  if (res.status === 204) {
    return { data: null };
  }

  const json = await res.json();

  if (res.status === 422 || json.redirect_browser_to) {
    return { redirect: json.redirect_browser_to, code: res.status };
  }

  const hasError = json.ui?.messages?.some(
    ({ type }) => type === MessageType.Error,
  );

  if (res.status === 200 && !hasError) {
    return { data: json };
  }

  return { error: json?.error || json };
};

interface KratosSession {
  session: AuthSession;
  verified: boolean;
}

export const getKratosSession = async (): Promise<KratosSession> => {
  const res = await fetch(`${heimdallUrl}/api/whoami`, {
    credentials: 'include',
  });

  if (res.status === 401) {
    throw new Error('No active user');
  }

  return res.json();
};

export const getVerificationSession =
  async (): Promise<VerificationSession> => {
    const res = await fetch(`${heimdallUrl}/api/get_verification_flow`, {
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('No active session');
    }

    return res.json();
  };

// https://github.com/ory/docs/blob/9b86ed78da2fad0eb8bfaebfcc1a81f70d55e675/docs/kratos/concepts/messages.json
export const KRATOS_ERROR = Object.freeze<Record<string, number>>({
  INVALID_TOKEN: 4060004,
  EXISTING_USER: 4000007,
  SINGLE_OIDC: 4000001,
  NO_STRATEGY_TO_LOGIN: 4010002,
  NO_STRATEGY_TO_SIGNUP: 4010003,
  UNVERIFIED: 4000010,
});

export const KRATOS_ERROR_MESSAGE = Object.freeze<Record<string, string>>({
  SESSION_ALREADY_AVAILABLE: 'session_already_available',
});
