export enum StorageTopic {
  Squad = 'squad',
}

export const generateStorageKey = (
  topic: StorageTopic,
  key: string,
  identifier = 'anonymous',
): string => `${topic}:${key}:${identifier}`;
