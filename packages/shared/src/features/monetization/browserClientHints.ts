interface BrowserClientHints {
  brands: { brand: string; version: string }[];
  mobile: boolean;
  platform: string;
  architecture?: string;
  bitness?: string;
  model?: string;
  platformVersion?: string;
  fullVersionList?: { brand: string; version: string }[];
  uaFullVersion?: string;
}

interface BrowserUserAgentData {
  toJSON: () => BrowserClientHints;
  getHighEntropyValues?: (hints: string[]) => Promise<BrowserClientHints>;
}

const highEntropyCache = new WeakMap<
  BrowserUserAgentData,
  Promise<BrowserClientHints>
>();

export const getBrowserClientHints = async (
  allowHighEntropy = false,
): Promise<BrowserClientHints | undefined> => {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  const { userAgentData } = navigator as Navigator & {
    userAgentData?: BrowserUserAgentData;
  };
  if (!userAgentData) {
    return undefined;
  }

  const hints = userAgentData.toJSON();
  if (!allowHighEntropy || !userAgentData.getHighEntropyValues) {
    return hints;
  }

  let enriched = highEntropyCache.get(userAgentData);
  if (!enriched) {
    enriched = Promise.resolve()
      .then(() =>
        userAgentData.getHighEntropyValues?.([
          'architecture',
          'bitness',
          'model',
          'platformVersion',
          'fullVersionList',
          'uaFullVersion',
        ]),
      )
      .then((values) => ({ ...hints, ...values }))
      .catch(() => hints);
    highEntropyCache.set(userAgentData, enriched);
  }
  return enriched;
};
