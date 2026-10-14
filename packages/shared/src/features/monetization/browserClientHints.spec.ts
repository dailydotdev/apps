import { getBrowserClientHints } from './browserClientHints';

describe('browser client hints', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'userAgentData');
  });

  it('omits hints when the browser does not expose them', async () => {
    expect(await getBrowserClientHints()).toBeUndefined();
  });

  it('forwards native values and keeps low-entropy hints when access is denied', async () => {
    const hints = {
      brands: [{ brand: 'Chromium', version: '134' }],
      mobile: false,
      platform: 'macOS',
    };
    const getHighEntropyValues = jest
      .fn()
      .mockResolvedValue({ platformVersion: '14.0.0', architecture: 'arm' });
    Object.defineProperty(navigator, 'userAgentData', {
      configurable: true,
      value: { toJSON: () => hints, getHighEntropyValues },
    });
    expect(await getBrowserClientHints()).toEqual({
      ...hints,
      platformVersion: '14.0.0',
      architecture: 'arm',
    });
    getHighEntropyValues.mockRejectedValueOnce(new Error('unavailable'));
    expect(await getBrowserClientHints()).toEqual(hints);
  });
});
