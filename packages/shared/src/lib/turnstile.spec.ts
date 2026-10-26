import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { waitForTurnstileToken } from './turnstile';

const createInstance = (
  overrides: Partial<TurnstileInstance>,
): TurnstileInstance =>
  ({
    getResponse: jest.fn(() => undefined),
    getResponsePromise: jest.fn(() => Promise.reject(new Error('timeout'))),
    ...overrides,
  } as unknown as TurnstileInstance);

describe('waitForTurnstileToken', () => {
  it('returns undefined without a widget', async () => {
    expect(await waitForTurnstileToken(null)).toBeUndefined();
  });

  it('returns the current token without waiting', async () => {
    const instance = createInstance({ getResponse: jest.fn(() => 'token') });
    expect(await waitForTurnstileToken(instance)).toBe('token');
    expect(instance.getResponsePromise).not.toHaveBeenCalled();
  });

  it('waits for a pending challenge to resolve', async () => {
    const instance = createInstance({
      getResponsePromise: jest.fn(() => Promise.resolve('late-token')),
    });
    expect(await waitForTurnstileToken(instance, 1000)).toBe('late-token');
    expect(instance.getResponsePromise).toHaveBeenCalledWith(1000);
  });

  it('returns undefined when the challenge does not resolve in time', async () => {
    const instance = createInstance({});
    expect(await waitForTurnstileToken(instance)).toBeUndefined();
  });
});
