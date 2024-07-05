// GrowthBook enables feature flagging and experimentation.
export class GrowthBook {
  constructor() {
    return this;
  }

  /*
  * this is a mock implementation for the `GrowthBook.getFeatureValue` method
  * will return the default value for all the features.
  * */
  getFeatureValue(key: string, defaultValue: unknown) {
    return 'control';
  };
}

export function setPolyfills() {
}

export function configureCache() {
}

export function clearCache() {
}
