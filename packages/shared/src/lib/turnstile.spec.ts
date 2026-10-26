import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { waitForTurnstileToken } from './turnstile';

const createInstance = (
  getResponse: () => string | undefined,
): TurnstileInstance =>
  ({
    getResponse: jest.fn(getResponse),
    getResponsePromise: jest.fn(),
  } as unknown as TurnstileInstance);

describe('waitForTurnstileToken', () => {
  it('returns undefined without a widget', async () => {
    expect(await waitForTurnstileToken(null)).toBeUndefined();
  });

  it('returns the current token without waiting', async () => {
    const instance = createInstance(() => 'token');
    expect(await waitForTurnstileToken(instance)).toBe('token');
    expect(instance.getResponse).toHaveBeenCalledTimes(1);
  });

  it('waits for a pending challenge to produce a token', async () => {
    let calls = 0;
    const instance = createInstance(() => {
      calls += 1;
      return calls >= 3 ? 'late-token' : undefined;
    });
    expect(
      await waitForTurnstileToken(instance, { timeoutMs: 1000, intervalMs: 1 }),
    ).toBe('late-token');
    expect(instance.getResponsePromise).not.toHaveBeenCalled();
  });

  it('returns undefined when the challenge does not resolve in time', async () => {
    const instance = createInstance(() => undefined);
    expect(
      await waitForTurnstileToken(instance, { timeoutMs: 20, intervalMs: 1 }),
    ).toBeUndefined();
  });

  it('stops waiting when asked to, e.g. for an interactive challenge', async () => {
    const instance = createInstance(() => undefined);
    const shouldStop = jest.fn(() => true);
    expect(
      await waitForTurnstileToken(instance, { timeoutMs: 10_000, shouldStop }),
    ).toBeUndefined();
    expect(shouldStop).toHaveBeenCalledTimes(1);
  });

  it('treats a throwing widget as having no token', async () => {
    const instance = createInstance(() => {
      throw new Error('not rendered');
    });
    expect(
      await waitForTurnstileToken(instance, { timeoutMs: 5, intervalMs: 1 }),
    ).toBeUndefined();
  });
});
