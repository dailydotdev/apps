import {
  getSocialAuthCallbackError,
  hasSocialAuthBootUser,
  refetchSocialAuthBoot,
} from './socialAuth';

describe('socialAuth', () => {
  describe('getSocialAuthCallbackError', () => {
    it('returns the first callback error message', () => {
      expect(
        getSocialAuthCallbackError({
          error: 'access_denied',
          error_description: 'User denied access',
          message: 'Fallback message',
        }),
      ).toBe('access_denied');
    });

    it('ignores empty callback error fields', () => {
      expect(
        getSocialAuthCallbackError({
          error: '   ',
          error_description: '',
          message: 'Fallback message',
        }),
      ).toBe('Fallback message');
    });
  });

  describe('hasSocialAuthBootUser', () => {
    it('requires a boot user with an email field', () => {
      expect(hasSocialAuthBootUser({ id: 'anonymous' })).toBe(false);
      expect(
        hasSocialAuthBootUser({
          id: 'user',
          email: 'user@daily.dev',
        }),
      ).toBe(true);
    });
  });

  describe('refetchSocialAuthBoot', () => {
    it('retries until boot contains the authenticated user', async () => {
      const refetchBoot = jest
        .fn()
        .mockResolvedValueOnce({ data: { user: { id: 'anonymous' } } })
        .mockResolvedValueOnce({
          data: { user: { id: 'user', email: 'user@daily.dev' } },
        });

      await expect(refetchSocialAuthBoot(refetchBoot, [0, 0])).resolves.toEqual(
        {
          user: { id: 'user', email: 'user@daily.dev' },
        },
      );
      expect(refetchBoot).toHaveBeenCalledTimes(2);
    });

    it('returns the last boot response when auth never completes', async () => {
      const refetchBoot = jest
        .fn()
        .mockResolvedValueOnce({ data: { user: { id: 'anonymous-1' } } })
        .mockResolvedValueOnce({ data: { user: { id: 'anonymous-2' } } });

      await expect(refetchSocialAuthBoot(refetchBoot, [0, 0])).resolves.toEqual(
        {
          user: { id: 'anonymous-2' },
        },
      );
      expect(refetchBoot).toHaveBeenCalledTimes(2);
    });
  });
});
