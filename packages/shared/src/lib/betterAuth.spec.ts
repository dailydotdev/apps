import {
  betterAuthSignIn,
  getBetterAuthSignUpErrorField,
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

  it('should preserve Better Auth social state as returned by the API', async () => {
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
        url: 'https://auth.example.com/oauth?state=abc123',
      }),
    );
  });
});

describe('getBetterAuthSignUpErrorField', () => {
  it.each([
    [{ code: 'PASSWORD_TOO_SHORT', error: 'Password too short' }, 'password'],
    [{ code: 'PASSWORD_TOO_LONG', error: 'Password too long' }, 'password'],
    [{ error: 'Password too short' }, 'password'],
    [
      { code: 'BAD_REQUEST', error: 'username is already taken' },
      'traits.username',
    ],
    [{ code: 'BAD_REQUEST', error: 'username is invalid' }, 'traits.username'],
    [
      { code: 'BAD_REQUEST', error: 'experienceLevel is invalid' },
      'traits.experienceLevel',
    ],
    [
      { code: 'USER_ALREADY_EXISTS', error: 'User already exists' },
      'traits.email',
    ],
    [{ code: 'INVALID_EMAIL', error: 'Invalid email' }, 'traits.email'],
    [{ error: 'Sign up failed' }, 'traits.email'],
  ])('maps %o to %s', (response, field) => {
    expect(getBetterAuthSignUpErrorField(response)).toBe(field);
  });
});
