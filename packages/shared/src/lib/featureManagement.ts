import { isSameDay } from 'date-fns';
import { IFlags } from 'flagsmith';

export type FeaturesState = { lastSync: string; flags: IFlags };

export const FEATURES_STATE_KEY = 'features';

export const initFlagsmith = async (userId: string): Promise<IFlags> => {
  const state = JSON.parse(
    localStorage.getItem(FEATURES_STATE_KEY),
  ) as FeaturesState;
  const now = new Date();
  if (!state || !isSameDay(new Date(state.lastSync), now)) {
    const { default: flagsmith } = await import(
      /* webpackChunkName: "analytics" */ 'flagsmith'
    );
    flagsmith.identify(userId);
    return new Promise((resolve) => {
      flagsmith.init({
        environmentID: process.env.NEXT_PUBLIC_FLAGSMITH,
        enableAnalytics: true,
        onChange: (oldFlags, params) => {
          const { isFromServer } = params;
          if (isFromServer) {
            const features = {
              lastSync: now.toISOString(),
              flags: flagsmith.getAllFlags(),
            };
            localStorage.setItem(FEATURES_STATE_KEY, JSON.stringify(features));
            const event = new CustomEvent('featuresLoaded', {
              detail: features,
            });
            window.dispatchEvent(event);
            resolve({});
          }
        },
      });
    });
  }
  return state.flags;
};

export const getFeatureValue = (
  key: string,
  flags: IFlags,
): string | undefined => {
  const finalKey = `feat_${key}`;
  if (flags[finalKey]?.enabled) {
    return flags[finalKey].value;
  }
};
