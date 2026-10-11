// The browser session that finishes onboarding is the new user's first look at
// their feed, so the app sheet sits it out and asks from the next visit on.
// sessionStorage clears when the tab closes, which is exactly that window.
export const ONBOARDING_SESSION_KEY = 'onboarding_session';

export const markOnboardingSession = (): void => {
  try {
    window.sessionStorage.setItem(ONBOARDING_SESSION_KEY, '1');
  } catch {
    // Storage can be blocked; the sheet then behaves as before.
  }
};

export const isOnboardingSession = (): boolean => {
  try {
    return !!window.sessionStorage.getItem(ONBOARDING_SESSION_KEY);
  } catch {
    return false;
  }
};
