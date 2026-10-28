import { markSignedOut, SIGNED_OUT_COOKIE } from './signedOut';

describe('markSignedOut', () => {
  beforeEach(() => {
    document.cookie = `${SIGNED_OUT_COOKIE}=; max-age=0; path=/`;
  });

  it('leaves the cookie the homepage reads before it auto signs anyone in', async () => {
    await markSignedOut();
    expect(document.cookie).toContain(`${SIGNED_OUT_COOKIE}=1`);
  });

  it('tells the browser to stop silent FedCM sign-in', async () => {
    const preventSilentAccess = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'credentials', {
      configurable: true,
      value: { preventSilentAccess },
    });
    await markSignedOut();
    expect(preventSilentAccess).toHaveBeenCalled();
  });
});
