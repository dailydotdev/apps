import { apiUrl } from './config';
import { gqlClient } from '../graphql/common';
import { SET_PASSWORD_MUTATION } from '../graphql/users';

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

export type BetterAuthSocialRedirectResponse = BetterAuthResult<{
  url?: string;
  redirect?: boolean;
}>;

const betterAuthStateSuffix = '_ba';

export const getBetterAuthErrorMessage = (
  error: unknown,
  fallbackError = 'Request failed',
): string => {
  if (typeof error === 'string' && error) {
    return error;
  }

  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }

    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }

    if ('code' in error && typeof error.code === 'string') {
      return error.code;
    }

    try {
      return JSON.stringify(error);
    } catch {
      return fallbackError;
    }
  }

  return fallbackError;
};

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
  try {
    const res = await fetch(`${apiUrl}/auth/${path}`, {
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
  } catch (error) {
    return {
      error: getBetterAuthErrorMessage(error, fallbackError),
    } as BetterAuthResult<T>;
  }
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
  referral,
  referralOrigin,
  timezone,
  region,
}: {
  name: string;
  email: string;
  password: string;
  turnstileToken?: string;
  username?: string;
  experienceLevel?: string;
  referral?: string;
  referralOrigin?: string;
  timezone?: string;
  region?: string;
}): Promise<BetterAuthResponse> => {
  const headers: Record<string, string> = {};
  if (turnstileToken) {
    headers['x-captcha-response'] = turnstileToken;
  }
  return betterAuthPost(
    'sign-up/email',
    {
      name,
      email,
      password,
      username,
      experienceLevel,
      referral,
      referralOrigin,
      timezone,
      region,
    },
    'Sign up failed',
    Object.keys(headers).length > 0 ? headers : undefined,
  );
};

type SocialAdditionalData = Record<string, unknown>;

const getBetterAuthSocialRedirect = async (
  path: string,
  provider: string,
  callbackURL: string,
  additionalData?: SocialAdditionalData,
): Promise<BetterAuthSocialRedirectResponse> => {
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
      ...(additionalData && { additionalData }),
    },
    'Failed to get social auth URL',
  );

  return {
    ...response,
    url: markBetterAuthSocialUrl(response.url),
  };
};

export const getBetterAuthSocialRedirectData = (
  provider: string,
  callbackURL: string,
  additionalData?: SocialAdditionalData,
): Promise<BetterAuthSocialRedirectResponse> =>
  getBetterAuthSocialRedirect(
    'sign-in/social',
    provider,
    callbackURL,
    additionalData,
  );

export const getBetterAuthSocialUrl = (
  provider: string,
  callbackURL: string,
): Promise<string | undefined> =>
  getBetterAuthSocialRedirectData(provider, callbackURL).then(({ url }) => url);

export const betterAuthSignInWithIdToken = async ({
  provider,
  token,
  nonce,
  additionalData,
}: {
  provider: string;
  token: string;
  nonce?: string;
  additionalData?: SocialAdditionalData;
}): Promise<BetterAuthResponse> => {
  return betterAuthPost(
    'sign-in/social',
    {
      provider,
      idToken: {
        token,
        ...(nonce && { nonce }),
      },
      ...(additionalData && { additionalData }),
    },
    'Native sign in failed',
  );
};

export const getBetterAuthLinkSocialUrl = (
  provider: string,
  callbackURL: string,
): Promise<string | undefined> =>
  getBetterAuthSocialRedirect('link-social', provider, callbackURL).then(
    ({ url }) => url,
  );

export const getBetterAuthProviders = async (): Promise<{
  ok: boolean;
  result: string[];
}> => {
  const res = await fetch(`${apiUrl}/auth/list-accounts`, {
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
  const res = await fetch(`${apiUrl}/auth/unlink-account`, {
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
  try {
    await gqlClient.request(SET_PASSWORD_MUTATION, { newPassword });
    return { status: true };
  } catch (error) {
    return {
      error: getBetterAuthErrorMessage(error, 'Failed to set password'),
    };
  }
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

export const betterAuthForgetPassword = async (
  email: string,
  redirectTo: string,
): Promise<{ status?: boolean; error?: string }> => {
  return betterAuthPost(
    'request-password-reset',
    { email, redirectTo },
    'Failed to send password reset email',
  );
};

export const betterAuthResetPassword = async (
  newPassword: string,
  token: string,
): Promise<{ status?: boolean; error?: string }> => {
  return betterAuthPost(
    'reset-password',
    { newPassword, token },
    'Failed to reset password',
  );
};
