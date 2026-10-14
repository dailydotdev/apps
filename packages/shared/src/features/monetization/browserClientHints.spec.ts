import { getBrowserClientHints } from './browserClientHints';

const hints = {
  brands: [{ brand: 'Chromium', version: '134' }],
  mobile: false,
  platform: 'macOS',
};

const setHints = (getHighEntropyValues: jest.Mock) => {
  Object.defineProperty(navigator, 'userAgentData', {
    configurable: true,
    value: { toJSON: () => hints, getHighEntropyValues },
  });
};

describe('browser client hints', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'userAgentData');
  });

  it('omits hints when the browser does not expose them', async () => {
    expect(await getBrowserClientHints()).toBeUndefined();
  });

  it('keeps low-entropy hints without consent, even after a previous grant', async () => {
    const getHighEntropyValues = jest
      .fn()
      .mockResolvedValue({ model: 'native' });
    setHints(getHighEntropyValues);
    expect(await getBrowserClientHints()).toEqual(hints);
    expect(getHighEntropyValues).not.toHaveBeenCalled();
    await getBrowserClientHints(true);
    expect(await getBrowserClientHints(false)).toEqual(hints);
    expect(getHighEntropyValues).toHaveBeenCalledTimes(1);
  });

  it('resolves native high-entropy hints once across concurrent ad requests', async () => {
    const getHighEntropyValues = jest.fn().mockResolvedValue({
      platformVersion: '14.0.0',
      architecture: 'arm',
    });
    setHints(getHighEntropyValues);
    const results = await Promise.all([
      getBrowserClientHints(true),
      getBrowserClientHints(true),
    ]);
    expect(results).toEqual([
      { ...hints, platformVersion: '14.0.0', architecture: 'arm' },
      { ...hints, platformVersion: '14.0.0', architecture: 'arm' },
    ]);
    await getBrowserClientHints(true);
    expect(getHighEntropyValues).toHaveBeenCalledTimes(1);
  });

  it('caches low-entropy fallback when native access is denied', async () => {
    const getHighEntropyValues = jest
      .fn()
      .mockRejectedValue(new Error('unavailable'));
    setHints(getHighEntropyValues);
    expect(await getBrowserClientHints(true)).toEqual(hints);
    expect(await getBrowserClientHints(true)).toEqual(hints);
    expect(getHighEntropyValues).toHaveBeenCalledTimes(1);
  });
});
