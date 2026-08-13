import { GrowthBook } from '@growthbook/growthbook';
import type { Experiment, JSONValue, Result } from '@growthbook/growthbook';
import type { Feature } from './feature';

const DEFAULT_API_HOST = 'https://cdn.growthbook.io';
const DEFAULT_TIMEOUT = 2000;

type GetServerFeatureValueOptions<T extends JSONValue> = {
  attributes: Record<string, unknown>;
  clientKey?: string;
  feature: Feature<T>;
  trackingCallback?: (
    experiment: Experiment<JSONValue>,
    result: Result<JSONValue>,
  ) => void;
};

export const getServerFeatureValue = async <T extends JSONValue>({
  attributes,
  clientKey,
  feature,
  trackingCallback,
}: GetServerFeatureValueOptions<T>): Promise<T> => {
  const { defaultValue, id } = feature;

  if (!clientKey) {
    return defaultValue;
  }

  const growthbook = new GrowthBook({
    apiHost: process.env.GROWTHBOOK_API_HOST ?? DEFAULT_API_HOST,
    attributes,
    clientKey,
    trackingCallback,
  });

  try {
    await growthbook.loadFeatures({ timeout: DEFAULT_TIMEOUT });
    return growthbook.getFeatureValue(id, defaultValue) as T;
  } catch {
    return defaultValue;
  } finally {
    growthbook.destroy();
  }
};
