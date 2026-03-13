const SAFARI_NAVIGATION_PRELOAD_BLOCKLIST =
  /(Chrome|CriOS|Chromium|Android|Edg|EdgiOS|Firefox|FxiOS|OPR|Opera)/;

export const shouldEnableNavigationPreload = (userAgent: string): boolean => {
  const isSafariBrowser =
    userAgent.includes('Safari/') &&
    !SAFARI_NAVIGATION_PRELOAD_BLOCKLIST.test(userAgent);

  return !isSafariBrowser;
};
