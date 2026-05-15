import type { Boot } from '../../lib/boot';

export const SOCIAL_AUTH_RETRY_MESSAGE =
  "We couldn't complete your social sign-in. Please try again.";

const SOCIAL_AUTH_BOOT_RETRY_DELAYS_MS = [0, 250, 750] as const;

type BootUser = Partial<Boot>['user'];
type RefetchBoot = () => Promise<{ data?: Partial<Boot> }>;

const delay = (delayMs: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });

export const hasSocialAuthBootUser = (
  user?: BootUser,
): user is NonNullable<BootUser> =>
  !!user && typeof user === 'object' && 'email' in user;

const refetchSocialAuthBootAttempt = async (
  refetchBoot: RefetchBoot,
  retryDelaysMs: readonly number[],
  attempt = 0,
  lastBoot?: Partial<Boot>,
): Promise<Partial<Boot> | undefined> => {
  const delayMs = retryDelaysMs[attempt];

  if (typeof delayMs === 'undefined') {
    return lastBoot;
  }

  if (delayMs > 0) {
    await delay(delayMs);
  }

  const { data: boot } = await refetchBoot();

  if (hasSocialAuthBootUser(boot?.user)) {
    return boot;
  }

  return refetchSocialAuthBootAttempt(
    refetchBoot,
    retryDelaysMs,
    attempt + 1,
    boot,
  );
};

export const getSocialAuthCallbackError = (
  data?: unknown,
): string | undefined => {
  if (!data || typeof data !== 'object') {
    return undefined;
  }

  const callbackData = data as Record<string, unknown>;
  const { error, error_description: errorDescription, message } = callbackData;
  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  if (
    typeof errorDescription === 'string' &&
    errorDescription.trim().length > 0
  ) {
    return errorDescription;
  }

  if (typeof message === 'string' && message.trim().length > 0) {
    return message;
  }

  return undefined;
};

export const refetchSocialAuthBoot = async (
  refetchBoot: RefetchBoot,
  retryDelaysMs: readonly number[] = SOCIAL_AUTH_BOOT_RETRY_DELAYS_MS,
): Promise<Partial<Boot> | undefined> =>
  refetchSocialAuthBootAttempt(refetchBoot, retryDelaysMs);
