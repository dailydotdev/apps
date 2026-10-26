import type { TurnstileInstance } from '@marsidev/react-turnstile';

// Turnstile's managed challenge usually solves in the background within a few
// seconds. Users who submit straight away (e.g. with a password manager) used
// to hit "Turnstile not valid" because the token wasn't ready yet, so wait for
// it briefly instead of failing immediately.
export const TURNSTILE_TOKEN_WAIT_MS = 10_000;

export const waitForTurnstileToken = async (
  turnstile: TurnstileInstance | null | undefined,
  timeoutMs: number = TURNSTILE_TOKEN_WAIT_MS,
): Promise<string | undefined> => {
  if (!turnstile) {
    return undefined;
  }

  const token = turnstile.getResponse();
  if (token) {
    return token;
  }

  try {
    return (await turnstile.getResponsePromise(timeoutMs)) || undefined;
  } catch {
    return undefined;
  }
};
