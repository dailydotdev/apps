export enum StorageTopic {
  Squad = 'squad',
}

export const APP_KEY_PREFIX = 'dailydev';

export const generateStorageKey = (
  topic: StorageTopic,
  key: string,
  identifier = 'global',
): string => `${APP_KEY_PREFIX}:${topic}:${key}:${identifier}`;
