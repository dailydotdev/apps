import { fn } from '@storybook/test';

// GrowthBook enables feature flagging and experimentation.
export class GrowthBook {
  constructor() {
    return this;
  }

  getFeatureValue = fn().mockName('featureVersion').mockReturnValue('control');

  setAttributes = fn().mockName('setAttributes');

  getFeatures = fn().mockName('getFeatures').mockReturnValue({});
}

export const setPolyfills = fn();

export const configureCache = fn();

export const clearCache = fn();

export const setAttributes = fn();
