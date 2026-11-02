import { OnboardingActions } from '@dailydotdev/shared/src/components/auth/common';
import { onboardingUrl } from '@dailydotdev/shared/src/lib/constants';

// The extension can't run social OAuth from its own origin (the API rejects it
// with a 403), so auth is handed off to the webapp onboarding flow, which runs
// on a trusted origin and auto-triggers the relevant auth screen.
const buildOnboardingHref = (action?: OnboardingActions): string => {
  const base = new URL(onboardingUrl);
  base.searchParams.append('r', 'extension');
  if (action) {
    base.searchParams.append('action', action);
  }

  return base.toString();
};

export const onboardingHref = buildOnboardingHref();
export const loginHref = buildOnboardingHref(OnboardingActions.Login);
