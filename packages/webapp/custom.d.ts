type SvgrComponent = React.FC<React.SVGAttributes<SVGElement>>;

declare module '*.svg' {
  const value: SvgrComponent;
  export default value;
}

declare module '@growthbook/growthbook' {
  type GrowthBookContext = {
    apiHost?: string;
    clientKey?: string;
    attributes?: Record<string, unknown>;
    trackingCallback?: (
      experiment: { key: string },
      result: { variationId: number },
    ) => void;
  };

  export class GrowthBook {
    constructor(context?: GrowthBookContext);
    loadFeatures(options?: { timeout?: number }): Promise<void>;
    getFeatureValue<T>(key: string, defaultValue: T): T;
    destroy(): void;
  }
}
