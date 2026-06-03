import { generateStorageKey, StorageTopic } from './storage';
import { storageWrapper } from './storageWrapper';

const hasSeenTagsStorageKey = 'hasSeenTags';

export const getHasSeenTagsStorageKey = (userId: string): string =>
  generateStorageKey(StorageTopic.Onboarding, hasSeenTagsStorageKey, userId);

export const getHasSeenTags = (userId?: string | null): boolean | null => {
  if (!userId) {
    return null;
  }

  const value = storageWrapper.getItem(getHasSeenTagsStorageKey(userId));

  if (value === null) {
    return null;
  }

  return value === 'true';
};

export const setHasSeenTags = (userId: string, hasSeenTags: boolean): void => {
  storageWrapper.setItem(getHasSeenTagsStorageKey(userId), String(hasSeenTags));
};
