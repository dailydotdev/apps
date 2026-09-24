import { BootApp, getBootData } from './boot';
import { decrypt } from '../components/crypto';
import { storageWrapper as storage } from './storageWrapper';
import { BOOT_LOCAL_KEY } from '../contexts/common';

jest.mock('../components/crypto', () => ({
  decrypt: jest.fn(),
}));

const cachedFeatures = { cached_flag: { defaultValue: true } };
const freshFeatures = { fresh_flag: { defaultValue: true } };

const setCachedExp = (exp: Record<string, unknown>) =>
  storage.setItem(BOOT_LOCAL_KEY, JSON.stringify({ exp }));

const mockBootResponses = (...responses: Record<string, unknown>[]) => {
  const fetchMock = jest.fn();
  responses.forEach((response) =>
    fetchMock.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue(response),
    }),
  );
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
};

const getRequestedFv = (fetchMock: jest.Mock, call = 0) =>
  new URL(fetchMock.mock.calls[call][0]).searchParams.get('fv');

describe('getBootData', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_EXPERIMENTATION_KEY = 'key';
    jest.mocked(decrypt).mockResolvedValue(JSON.stringify(freshFeatures));
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.NEXT_PUBLIC_EXPERIMENTATION_KEY;
    jest.clearAllMocks();
  });

  it('should send fv and reuse cached features when the response omits f', async () => {
    setCachedExp({ f: 'cached-f', fv: 'v1', features: cachedFeatures });
    const fetchMock = mockBootResponses({
      exp: { fv: 'v1', e: ['e'], a: ['a'] },
    });

    const result = await getBootData({ app: BootApp.Webapp });

    expect(getRequestedFv(fetchMock)).toEqual('v1');
    expect(result.exp).toEqual({
      f: 'cached-f',
      fv: 'v1',
      e: ['e'],
      a: ['a'],
      features: cachedFeatures,
    });
    expect(decrypt).not.toHaveBeenCalled();
  });

  it('should not send fv without cached features and decrypt f', async () => {
    setCachedExp({ f: 'cached-f', fv: 'v1' });
    const fetchMock = mockBootResponses({
      exp: { f: 'fresh-f', fv: 'v2', e: [], a: [] },
    });

    const result = await getBootData({ app: BootApp.Webapp });

    expect(getRequestedFv(fetchMock)).toBeNull();
    expect(decrypt).toHaveBeenCalledWith('fresh-f', 'key', 'AES-CBC', 128);
    expect(result.exp?.features).toEqual(freshFeatures);
  });

  it('should never send fv for the companion app', async () => {
    setCachedExp({ f: 'cached-f', fv: 'v1', features: cachedFeatures });
    const fetchMock = mockBootResponses({
      exp: { f: 'fresh-f', fv: 'v1', e: [], a: [] },
    });

    await getBootData({ app: BootApp.Companion });

    expect(getRequestedFv(fetchMock)).toBeNull();
  });

  it('should refetch without fv when f is missing and no cached features match', async () => {
    const fetchMock = mockBootResponses(
      { exp: { fv: 'v2', e: [], a: [] } },
      { exp: { f: 'fresh-f', fv: 'v2', e: [], a: [] } },
    );

    const result = await getBootData({ app: BootApp.Webapp });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(getRequestedFv(fetchMock, 1)).toBeNull();
    expect(result.exp?.features).toEqual(freshFeatures);
  });
});
