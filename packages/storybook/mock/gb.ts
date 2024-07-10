import { fn } from '@storybook/test';

// GrowthBook enables feature flagging and experimentation.
export class GrowthBook {
  constructor() {
    return this;
  }

  getFeatureValue = fn().mockName('featureVersion').mockReturnValue('control');
}

export function setPolyfills() {}

export function configureCache() {}

export function clearCache() {}
