import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { featureAgentOnboarding } from '@dailydotdev/shared/src/lib/serverFeatures';
import { getServerFeatureValue } from '@dailydotdev/shared/src/lib/serverFeatureValue';

export const AGENT_ONBOARDING_PATHS = ['/agents/claim'];

export const isAgentOnboardingEnabled = (deviceId: string): Promise<boolean> =>
  getServerFeatureValue({
    attributes: {
      deviceId,
      loggedIn: false,
      mobile: false,
      platform: BootApp.Webapp,
      userId: deviceId,
      version: process.env.CURRENT_VERSION,
    },
    clientKey: process.env.GROWTHBOOK_CLIENT_KEY,
    feature: featureAgentOnboarding,
  });
