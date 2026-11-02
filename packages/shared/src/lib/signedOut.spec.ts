import { clearSignedOut, markSignedOut, SIGNED_OUT_COOKIE } from './signedOut';

const setCredentials = (value: unknown) =>
  Object.defineProperty(navigator, 'credentials', {
    configurable: true,
    value,
  });

describe('signed-out signal', () => {
  beforeEach(() => {
    document.cookie = `${SIGNED_OUT_COOKIE}=; max-age=0; path=/`;
    setCredentials(undefined);
  });

  it('leaves the cookie the homepage reads before it auto signs anyone in', async () => {
    await markSignedOut();
    expect(document.cookie).toContain(`${SIGNED_OUT_COOKIE}=1`);
  });

  it('tells the browser to stop silent FedCM sign-in', async () => {
    const preventSilentAccess = jest.fn().mockResolvedValue(undefined);
    setCredentials({ preventSilentAccess });
    await markSignedOut();
    expect(preventSilentAccess).toHaveBeenCalled();
  });

  it('still signs out when the browser refuses', async () => {
    setCredentials({
      preventSilentAccess: jest.fn().mockRejectedValue(new Error('denied')),
    });
    await expect(markSignedOut()).resolves.toBeUndefined();
    expect(document.cookie).toContain(`${SIGNED_OUT_COOKIE}=1`);
  });

  it('clears the cookie once the user is signed in again', async () => {
    await markSignedOut();
    clearSignedOut();
    expect(document.cookie).not.toContain(`${SIGNED_OUT_COOKIE}=1`);
  });
});
