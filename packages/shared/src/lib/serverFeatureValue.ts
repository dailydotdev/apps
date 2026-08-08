import { GrowthBook } from '@growthbook/growthbook';
import type { JSONValue } from '@growthbook/growthbook';
import type { Feature } from './feature';

const DEFAULT_API_HOST = 'https://cdn.growthbook.io';
const DEFAULT_TIMEOUT = 2000;

interface GetServerFeatureValueOptions<T extends JSONValue> {
  attributes: Record<string, unknown>;
  clientKey?: string;
  feature: Feature<T>;
}

export const getServerFeatureValue = async <T extends JSONValue>({
  attributes,
  clientKey,
  feature,
}: GetServerFeatureValueOptions<T>): Promise<T> => {
  const { defaultValue, id } = feature;

  if (!clientKey) {
    return defaultValue;
  }

  const growthbook = new GrowthBook({
    apiHost: process.env.GROWTHBOOK_API_HOST ?? DEFAULT_API_HOST,
    attributes,
    clientKey,
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
