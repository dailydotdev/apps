import { hasPublicWorld } from '../components/world/profileWorld';

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
});

const respond = (body: unknown) =>
  fetchMock.mockResolvedValue({ json: async () => body });

describe('hasPublicWorld', () => {
  it('opens the door once there is somewhere to walk into', async () => {
    respond({ data: { userWorld: [{ niche: { slug: 'ai_llm' } }] } });

    await expect(hasPublicWorld('u1')).resolves.toBe(true);
  });

  it('keeps it shut for a reader who has read nothing yet', async () => {
    respond({ data: { userWorld: [] } });

    await expect(hasPublicWorld('u1')).resolves.toBe(false);
  });

  it('keeps it shut for a world its owner has hidden', async () => {
    // Privacy is applied by the resolver, so a hidden world is indistinguishable
    // from an empty one here — which is exactly the answer a visitor should get.
    respond({ data: { userWorld: [] } });

    await expect(hasPublicWorld('u1')).resolves.toBe(false);
  });

  it('does not take the profile down with it', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    await expect(hasPublicWorld('u1')).resolves.toBe(false);
  });

  it('gives up rather than holding the profile open', async () => {
    jest.useFakeTimers();
    // A request that never settles — the profile's own render is awaiting this.
    fetchMock.mockImplementation(
      (_url: string, { signal }: { signal: AbortSignal }) =>
        new Promise((_, reject) =>
          signal.addEventListener('abort', () => reject(new Error('aborted'))),
        ),
    );

    const pending = hasPublicWorld('u1');
    jest.advanceTimersByTime(2000);

    await expect(pending).resolves.toBe(false);
    jest.useRealTimers();
  });

  it('survives an API that predates worlds', async () => {
    respond({ errors: [{ message: 'Cannot query field "userWorld"' }] });

    await expect(hasPublicWorld('u1')).resolves.toBe(false);
  });
});
