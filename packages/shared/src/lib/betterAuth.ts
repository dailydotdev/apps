import { apiUrl } from './config';

export type BetterAuthResponse = {
  error?: string;
  code?: string;
  message?: string;
  status?: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

type BetterAuthResult<T = Record<string, unknown>> = T &
  Pick<BetterAuthResponse, 'error' | 'code' | 'message' | 'status'>;

const betterAuthStateSuffix = '_ba';

const markBetterAuthSocialUrl = (url?: string): string | undefined => {
  if (!url) {
    return undefined;
  }

  const authUrl = new URL(url);
  const state = authUrl.searchParams.get('state');

  if (!state || state.endsWith(betterAuthStateSuffix)) {
    return authUrl.toString();
  }

  authUrl.searchParams.set('state', `${state}${betterAuthStateSuffix}`);
  return authUrl.toString();
};

const betterAuthPost = async <T = Record<string, unknown>>(
  path: string,
  body?: Record<string, unknown>,
  fallbackError = 'Request failed',
  headers?: Record<string, string>,
): Promise<BetterAuthResult<T>> => {
  const res = await fetch(`${apiUrl}/a/auth/${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...headers },
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!res.ok) {
    try {
      const data = (await res.json()) as BetterAuthResult<T>;
      return {
        ...data,
        error: data?.message || data?.error || data?.code || fallbackError,
      } as BetterAuthResult<T>;
    } catch {
      return { error: fallbackError } as BetterAuthResult<T>;
    }
  }

  return res.json();
};

export const betterAuthSignIn = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<BetterAuthResponse> => {
  return betterAuthPost('sign-in/email', { email, password }, 'Sign in failed');
};

export const betterAuthSignUp = async ({
  name,
  email,
  password,
  turnstileToken,
  username,
  experienceLevel,
}: {
  name: string;
  email: string;
  password: string;
  turnstileToken?: string;
  username?: string;
  experienceLevel?: string;
}): Promise<BetterAuthResponse> => {
  const headers: Record<string, string> = {};
  if (turnstileToken) {
    headers['x-captcha-response'] = turnstileToken;
  }
  return betterAuthPost(
    'sign-up/email',
    { name, email, password, username, experienceLevel },
    'Sign up failed',
    Object.keys(headers).length > 0 ? headers : undefined,
  );
};

const getBetterAuthSocialRedirectUrl = async (
  path: string,
  provider: string,
  callbackURL: string,
): Promise<string | undefined> => {
  const absoluteCallbackURL = callbackURL.startsWith('http')
    ? callbackURL
    : `${window.location.origin}${
        callbackURL.startsWith('/') ? '' : '/'
      }${callbackURL}`;

  const response = await betterAuthPost<{
    url?: string;
    redirect?: boolean;
  }>(
    path,
    {
      provider,
      callbackURL: absoluteCallbackURL,
      disableRedirect: true,
    },
    'Failed to get social auth URL',
  );

  return markBetterAuthSocialUrl(response.url);
};

export const getBetterAuthSocialUrl = (
  provider: string,
  callbackURL: string,
): Promise<string | undefined> =>
  getBetterAuthSocialRedirectUrl('sign-in/social', provider, callbackURL);

export const getBetterAuthLinkSocialUrl = (
  provider: string,
  callbackURL: string,
): Promise<string | undefined> =>
  getBetterAuthSocialRedirectUrl('link-social', provider, callbackURL);

export const getBetterAuthProviders = async (): Promise<{
  ok: boolean;
  result: string[];
}> => {
  const res = await fetch(`${apiUrl}/a/auth/list-accounts`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    return { ok: false, result: [] };
  }
  const accounts: { providerId: string }[] = await res.json();
  const providers = accounts.map((a) =>
    a.providerId === 'credential' ? 'password' : a.providerId,
  );
  return { ok: true, result: providers };
};

export const unlinkBetterAuthAccount = async (
  providerId: string,
): Promise<{ status: boolean }> => {
  const res = await fetch(`${apiUrl}/a/auth/unlink-account`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ providerId }),
  });
  if (!res.ok) {
    return { status: false };
  }
  return res.json();
};

export const betterAuthSetPassword = async (
  newPassword: string,
): Promise<{ status?: boolean; error?: string; code?: string }> => {
  return betterAuthPost(
    'set-password',
    { newPassword },
    'Failed to set password',
  );
};

export const betterAuthChangeEmail = async (
  newEmail: string,
): Promise<{ success?: boolean; error?: string }> => {
  return betterAuthPost(
    'email-otp/request-email-change',
    { newEmail },
    'Failed to change email',
  );
};

export const betterAuthVerifyChangeEmail = async (
  newEmail: string,
  code: string,
): Promise<{ success?: boolean; error?: string }> => {
  return betterAuthPost(
    'email-otp/change-email',
    { newEmail, otp: code },
    'Failed to verify email change',
  );
};

export const betterAuthSendSignupVerification = async (): Promise<{
  status?: boolean;
  error?: string;
}> => {
  return betterAuthPost(
    'send-signup-verification',
    undefined,
    'Failed to send verification code',
  );
};

export const betterAuthVerifySignupEmail = async (
  code: string,
): Promise<{ status?: boolean; error?: string }> => {
  return betterAuthPost(
    'verify-signup-email',
    { code },
    'Failed to verify email',
  );
};

export const betterAuthSendVerificationOTP = async (
  email: string,
): Promise<{ success?: boolean; error?: string }> => {
  return betterAuthPost(
    'email-otp/send-verification-otp',
    { email, type: 'email-verification' },
    'Failed to send verification code',
  );
};

export const betterAuthVerifyEmailOTP = async (
  email: string,
  otp: string,
): Promise<{ status?: boolean; error?: string }> => {
  return betterAuthPost(
    'email-otp/verify-email',
    { email, otp },
    'Failed to verify email',
  );
};

export const betterAuthChangePassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<{ error?: string; code?: string }> => {
  return betterAuthPost(
    'change-password',
    { currentPassword, newPassword },
    'Failed to change password',
  );
};
