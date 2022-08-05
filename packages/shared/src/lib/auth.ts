export type EmptyObjectLiteral = Record<string, never>;

interface InitializationNodeAttribute {
  name: string;
  type: string;
  value?: string;
  required?: boolean;
  disabled: boolean;
  node_type: string;
}

interface ErrorMessage {
  id: number;
  text: string;
  type: string;
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

interface InitializationNode {
  type: string;
  group: string;
  attributes: InitializationNodeAttribute;
  messages: ErrorMessage[];
  meta: InitializationNodeMeta | EmptyObjectLiteral;
}

interface InitializationUI {
  action: string;
  method: string;
  messages?: ErrorMessage[];
  nodes: InitializationNode[];
}

type DateString = string;

export interface InitializationData {
  id: string;
  issued_at: DateString;
  expires_at: DateString;
  created_at: DateString;
  updated_at: DateString;
  request_url: string;
  type: string;
  refresh?: boolean;
  ui: InitializationUI;
  requested_aal: AuthenticatorLevel;
}

export type RegistrationInitializationData = InitializationData;

type AuthenticatorLevel = 'aal0' | 'aal1';
type Method = 'link_recovery' | 'password';
interface AuthMethod {
  aal: AuthenticatorLevel;
  completed_at: Date;
  method: Method;
}

type AuthenticationType = 'password' | 'oidc';

interface IdentityCredential {
  config: Record<string, string>;
  created_at: Date;
  identifiers: string[];
  type: AuthenticationType;
  updated_at: Date;
  version: number;
}

interface RecoveryAddress {
  created_at: Date;
  id: string;
  updated_at: Date;
  value: string;
  via: string;
}

interface VerifyableAddress extends RecoveryAddress {
  status: string;
  verified: boolean;
  verified_at?: Date;
  id: string;
  value: string;
  via: string;
  created_at: Date;
  updated_at: Date;
}

interface Identity {
  created_at: Date;
  credentials?: Record<string, IdentityCredential>;
  id: string;
  metadata_admin?: unknown;
  metadata_public?: unknown;
  recovery_addresses: RecoveryAddress[];
  schema_id: string;
  schema_url: string;
  state: 'active';
  state_changed_at: Date;
  traits: unknown;
  updated_at: Date;
  verifiable_addresses: VerifyableAddress[];
}

interface LogoutSessionData {
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

export interface SuccessfulRegistrationData {
  session: AuthSession;
  identity: Identity;
}

const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://127.0.0.1:4433';

export const getRegistrationFlow = async (
  flowId: string,
): Promise<InitializationData> => {
  const res = await fetch(
    `${authUrl}/self-service/registration?flow=${flowId}`,
    {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    },
  );
  return res.json();
};

export const initializeRegistration = async (): Promise<InitializationData> => {
  const res = await fetch(`${authUrl}/self-service/registration/browser`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  return res.json();
};

export const initializeSettings = async (): Promise<InitializationData> => {
  const res = await fetch(`${authUrl}/self-service/settings/browser`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  return res.json();
};

export const initializeLogin = async (): Promise<InitializationData> => {
  const res = await fetch(`${authUrl}/self-service/login/browser`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  return res.json();
};

export const validatePasswordLogin = async ({
  action,
  params,
}: ValidateLoginParams): Promise<AuthSession> => {
  const postData = { method: 'password', ...params };
  const res = await fetch(action, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': params.csrf_token,
      Accept: 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(postData),
  });
  return res.json();
};
interface AuthPostParams {
  csrf_token: string;
}

export interface LoginPasswordParameters extends AuthPostParams {
  password: string;
  identifier: string;
}

export interface AccountRecoveryParameters extends AuthPostParams {
  email: string;
}

interface FormParams<T> {
  action: string;
  params: T;
}

export interface RequestResponse<
  TData = AuthSession,
  TError = InitializationData,
> {
  data?: TData;
  error?: TError;
  redirect?: string;
}
export interface RegistrationParameters {
  csrf_token: string;
  provider?: string;
  method: AuthenticationType;
  password?: string;
  'traits.email': string;
  'traits.fullname'?: string;
  'traits.username': string;
  'traits.image': string;
}

export type ErrorMessages<T extends string | number> = { [key in T]?: string };
export type RegistrationError = ErrorMessages<keyof RegistrationParameters>;
export type ValidateRegistrationParams = FormParams<RegistrationParameters>;
export type ValidateLoginParams = FormParams<LoginPasswordParameters>;

type SuccessfulRegistrationResponse =
  RequestResponse<SuccessfulRegistrationData>;

export const validateRegistration = async ({
  action,
  params,
}: ValidateRegistrationParams): Promise<SuccessfulRegistrationResponse> => {
  const res = await fetch(action, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': params.csrf_token,
      Accept: 'application/json',
    },
    body: JSON.stringify(params),
  });

  const json = await res.json();

  if (res.status === 200) {
    return { data: json };
  }

  if (res.status === 422) {
    return { redirect: json.redirect_browser_to };
  }

  return { error: json?.error || json };
};

export const updateSettings = async ({
  action,
  params,
}): Promise<SuccessfulRegistrationResponse> => {
  const res = await fetch(action, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': params.csrf_token,
      Accept: 'application/json',
    },
    body: JSON.stringify(params),
  });

  const json = await res.json();

  if (res.status === 200) {
    return { data: json };
  }

  if (json.redirect_browser_to) {
    return { redirect: json.redirect_browser_to };
  }

  return { error: json?.error || json };
};

export const checkCurrentSession = async (): Promise<AuthSession> => {
  const res = await fetch(`${authUrl}/sessions/whoami`, {
    credentials: 'include',
  });

  if (res.status === 401) {
    throw new Error('No active user');
  }

  return res.json();
};

export const getLogoutSession = async (): Promise<LogoutSessionData> => {
  const res = await fetch(`${authUrl}/self-service/logout/browser`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  return res.json();
};

export const logoutSession = (
  url: string,
  csrf_token: string,
): Promise<Response> =>
  fetch(url, {
    credentials: 'include',
    headers: { Accept: 'application/json', 'X-CSRF-Token': csrf_token },
  });

export const errorsToJson = <T extends string>(
  data: InitializationData,
): Record<T, string> =>
  Object.values(data.ui.nodes).reduce(
    (result, node) => ({
      ...result,
      [node.attributes.name]: node.messages[0]?.text ?? '',
    }),
    {} as Record<T, string>,
  );

export const getNodeByKey = (
  key: string,
  nodes: InitializationNode[],
): InitializationNode =>
  nodes.find(({ attributes }) => attributes.name === key);

export const getNodeValue = (
  key: string,
  nodes: InitializationNode[],
): string =>
  nodes.find(({ attributes }) => attributes.name === key)?.attributes?.value;
