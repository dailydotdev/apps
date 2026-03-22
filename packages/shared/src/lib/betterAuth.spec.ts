import {
  betterAuthSignIn,
  getBetterAuthSocialRedirectData,
} from './betterAuth';

describe('betterAuth', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return a structured error when sign in fetch fails', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockRejectedValueOnce(new TypeError('Network down'));

    await expect(
      betterAuthSignIn({
        email: 'test@daily.dev',
        password: 'secret',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        error: 'Network down',
      }),
    );
  });

  it('should preserve social redirect errors in the response payload', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({
        message: 'Social auth unavailable',
      }),
    } as unknown as Response);

    await expect(
      getBetterAuthSocialRedirectData(
        'github',
        'https://app.daily.dev/callback?login=true',
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        error: 'Social auth unavailable',
        url: undefined,
      }),
    );
  });

  it('should suffix Better Auth social state exactly once', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        url: 'https://auth.example.com/oauth?state=abc123',
      }),
    } as unknown as Response);

    await expect(
      getBetterAuthSocialRedirectData(
        'github',
        'https://app.daily.dev/callback?login=true',
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        url: 'https://auth.example.com/oauth?state=abc123_ba',
      }),
    );
  });
});
