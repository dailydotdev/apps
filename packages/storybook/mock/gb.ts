import { fn } from '@storybook/test';

// GrowthBook enables feature flagging and experimentation.
export class GrowthBook {
  constructor() {
    return this;
  }

  getFeatureValue = (name: string, value: any) => {
    if (name === 'show_error') {
      return false;
    }
    return value || 'control';
  };

  setAttributes = fn().mockName('setAttributes');

  getFeatures = fn().mockName('getFeatures').mockReturnValue({});
}

export const setPolyfills = fn();

export const configureCache = fn();

export const clearCache = fn();

export const setAttributes = fn();
