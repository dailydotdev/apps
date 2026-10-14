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

export const getBrowserClientHints = async (): Promise<
  BrowserClientHints | undefined
> => {
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
  if (!userAgentData.getHighEntropyValues) {
    return hints;
  }

  try {
    return {
      ...hints,
      ...(await userAgentData.getHighEntropyValues([
        'architecture',
        'bitness',
        'model',
        'platformVersion',
        'fullVersionList',
        'uaFullVersion',
      ])),
    };
  } catch {
    return hints;
  }
};
