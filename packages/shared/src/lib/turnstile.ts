import type { TurnstileInstance } from '@marsidev/react-turnstile';

// Turnstile's managed challenge usually solves in the background within a few
// seconds. Users who submit straight away (e.g. with a password manager) used
// to hit "Turnstile not valid" because the token wasn't ready yet, so wait for
// it briefly instead of failing immediately.
export const TURNSTILE_TOKEN_WAIT_MS = 10_000;
const TURNSTILE_TOKEN_POLL_MS = 150;

interface WaitForTurnstileTokenOptions {
  timeoutMs?: number;
  intervalMs?: number;
  /**
   * Stop waiting early, e.g. when Cloudflare shows an interactive challenge.
   * The user has to act on the widget then, so a spinner would only hide it.
   */
  shouldStop?: () => boolean;
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const readToken = (turnstile: TurnstileInstance): string | undefined => {
  try {
    return turnstile.getResponse() || undefined;
  } catch {
    return undefined;
  }
};

// Note: we poll `getResponse()` instead of using `getResponsePromise()`. In
// @marsidev/react-turnstile the latter only waits for the widget to render and
// then rejects straight away if the challenge hasn't produced a token yet.
export const waitForTurnstileToken = async (
  turnstile: TurnstileInstance | null | undefined,
  {
    timeoutMs = TURNSTILE_TOKEN_WAIT_MS,
    intervalMs = TURNSTILE_TOKEN_POLL_MS,
    shouldStop,
  }: WaitForTurnstileTokenOptions = {},
): Promise<string | undefined> => {
  if (!turnstile) {
    return undefined;
  }

  const deadline = Date.now() + timeoutMs;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const token = readToken(turnstile);
    if (token) {
      return token;
    }

    if (shouldStop?.() || Date.now() >= deadline) {
      return undefined;
    }

    // eslint-disable-next-line no-await-in-loop
    await sleep(intervalMs);
  }
};
