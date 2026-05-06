import type {
  Context,
  JSONValue,
  WidenPrimitives,
} from '@growthbook/growthbook';
import { GrowthBook } from '@growthbook/growthbook';
import type { BootApp, BootCacheData } from './boot';
import { apiUrl } from './config';
import type { Feature } from './featureManagement';
import { isGBDevMode, isProduction } from './constants';
import { getOrGenerateDeviceId } from '../hooks/log/useDeviceId';
import { BOOT_LOCAL_KEY } from '../contexts/common';
import { storageWrapper as storage } from './storageWrapper';

type ExperimentAttributes = Record<string, unknown>;

const getIsMobile = (): boolean =>
  globalThis.matchMedia?.('(max-width: 655px)').matches ?? false;

const getExtraAttributes = (
  attributes: NonNullable<BootCacheData['exp']>['a'] | undefined,
): ExperimentAttributes => {
  if (!attributes || Array.isArray(attributes)) {
    return {};
  }

  return attributes as ExperimentAttributes;
};

const getAttributes = ({
  bootData,
  app,
  deviceId,
  version,
}: {
  bootData: BootCacheData;
  app: BootApp;
  deviceId: string;
  version?: string;
}): ExperimentAttributes => {
  const { user } = bootData;
  const attributes: ExperimentAttributes = {
    userId: user?.id,
    deviceId,
    version,
    platform: app,
    mobile: getIsMobile(),
    ...getExtraAttributes(bootData.exp?.a),
  };

  if (!user) {
    return attributes;
  }

  if ('providers' in user) {
    return {
      ...attributes,
      loggedIn: true,
      registrationDate: user.createdAt,
    };
  }

  return {
    ...attributes,
    loggedIn: false,
    firstVisit: user.firstVisit,
  };
};

const cacheExperimentAllocation = (
  bootData: BootCacheData,
  key: string,
): void => {
  if (!bootData.exp) {
    return;
  }

  const cached = storage.getItem(BOOT_LOCAL_KEY);
  const parsed = cached ? (JSON.parse(cached) as BootCacheData) : bootData;
  const e = parsed.exp?.e ?? [];

  if (e.includes(key)) {
    return;
  }

  storage.setItem(
    BOOT_LOCAL_KEY,
    JSON.stringify({
      ...parsed,
      exp: {
        ...parsed.exp,
        e: [...e, key],
      },
      lastModifier: 'extension',
    }),
  );
};

const sendAllocation = async ({
  bootData,
  deviceId,
  experiment,
  result,
}: {
  bootData: BootCacheData;
  deviceId: string;
  experiment: Parameters<NonNullable<Context['trackingCallback']>>[0];
  result: Parameters<NonNullable<Context['trackingCallback']>>[1];
}): Promise<void> => {
  const variationId = result.variationId.toString();
  const key = btoa(`${experiment.key}:${variationId}`);

  if (bootData.exp?.e?.includes(key)) {
    return;
  }

  await fetch(`${apiUrl}/e/x`, {
    method: 'POST',
    keepalive: true,
    body: JSON.stringify({
      event_timestamp: new Date(),
      user_id: bootData.user?.id,
      device_id: deviceId,
      experiment_id: experiment.key,
      variation_id: variationId,
    }),
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
    },
  });
  cacheExperimentAllocation(bootData, key);
};

export const evaluateFeatureFromBoot = async <T extends JSONValue>({
  bootData,
  feature,
  app,
  version,
}: {
  bootData?: BootCacheData | null;
  feature: Feature<T>;
  app: BootApp;
  version?: string;
}): Promise<WidenPrimitives<T>> => {
  if (!bootData?.exp?.features) {
    return feature.defaultValue as WidenPrimitives<T>;
  }

  const deviceId = await getOrGenerateDeviceId();
  const trackingCalls: Promise<void>[] = [];
  const growthbook = new GrowthBook({
    enableDevMode: !isProduction || isGBDevMode,
    trackingCallback: (experiment, result) => {
      trackingCalls.push(
        sendAllocation({ bootData, deviceId, experiment, result }).catch(
          () => undefined,
        ),
      );
    },
  });

  growthbook.setFeatures(bootData.exp.features);
  growthbook.setAttributes(
    getAttributes({
      bootData,
      app,
      deviceId,
      version,
    }),
  );

  const value = growthbook.getFeatureValue(
    feature.id,
    feature.defaultValue,
  ) as WidenPrimitives<T>;

  await Promise.all(trackingCalls);

  return value;
};
