interface InitializationNodeAttribute {
  name: string;
  type: string;
  value: string;
  required: boolean;
  disabled: boolean;
  node_type: string;
}

interface InitializationNode {
  type: string;
  group: string;
  attributes: InitializationNodeAttribute;
  messages: string[];
  // meta: {};
}

interface InitializationUI {
  action: string;
  method: string;
  nodes: InitializationNode[];
}

interface InitializationData {
  id: string;
  issued_at: Date;
  expires_at: Date;
  request_url: string;
  type: string;
  ui: InitializationUI;
}

export type RegistrationInitializationData = InitializationData;

type AuthenticatorLevel = 'aal0';
type Method = 'link_recovery';
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
  verified: true;
  verified_at: Date;
}

interface Identity {
  created_at: Date;
  credentials: Record<string, IdentityCredential>;
  id: string;
  metadata_admin: unknown;
  metadata_public: unknown;
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

export interface AuthSession extends LogoutSessionData {
  active: boolean;
  authenticated_at: Date;
  authentication_methods: AuthMethod[];
  authenticator_assurance_level: AuthenticatorLevel;
  expires_at: Date;
  id: string;
  identity: Identity;
  issued_at: Date;
}

const authUrl = 'http://127.0.0.1:4433';

interface LoginInitializationData extends InitializationData {
  created_at: '2022-07-21T05:18:27.975693Z';
  updated_at: '2022-07-21T05:18:27.975693Z';
  refresh: false;
  requested_aal: 'aal1';
}

export const getRegistrationFlow = async (
  flowId: string,
): Promise<RegistrationInitializationData> => {
  const res = await fetch(
    `${authUrl}/self-service/registration?flow=${flowId}`,
    {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    },
  );
  return res.json();
};

export const initializeRegistration =
  async (): Promise<RegistrationInitializationData> => {
    const res = await fetch(`${authUrl}/self-service/registration/browser`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    return res.json();
  };

export const initializeLogin = async (): Promise<LoginInitializationData> => {
  const res = await fetch(`${authUrl}/self-service/login/browser`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  return res.json();
};

export interface LoginPasswordParameters {
  password: string;
  csrf_token: string;
  identifier: string;
}

export const validatePasswordLogin = async (
  url: string,
  params: LoginPasswordParameters,
): Promise<AuthSession> => {
  const postData = { method: 'password', ...params };
  const res = await fetch(url, {
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

interface RegistrationResponse {
  success?: AuthSession;
  redirect?: string;
  error?: unknown;
}

export interface RegistrationParameters {
  csrf_token: string;
  method: AuthenticationType;
  provider?: string;
  password?: string;
  'traits.email': string;
  'traits.fullname'?: string;
  'traits.username'?: string;
  'traits.image'?: string;
}

export const socialRegistration = async (
  action: string,
  params: RegistrationParameters,
): Promise<RegistrationResponse> => {
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

  if (res.status === 200) {
    const json = await res.json();
    return { success: json };
  }

  if (res.status === 422) {
    const json = await res.json();
    return { redirect: json.redirect_browser_to };
  }

  return { error: res };
};

export const validateRegistration = async (
  action: string,
  params: RegistrationParameters,
): Promise<RegistrationResponse> => {
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

  if (res.status === 200) {
    const json = await res.json();
    return { success: json };
  }

  return { error: res };
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
