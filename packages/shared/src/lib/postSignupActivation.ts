import { generateStorageKey, StorageTopic } from './storage';
import { storageWrapper as storage } from './storageWrapper';

const activationStorageKey = generateStorageKey(
  StorageTopic.Onboarding,
  'postSignupActivation',
);

const activationTtl = 7 * 24 * 60 * 60 * 1000;

interface PostSignupActivation {
  userId: string;
  postPath: string;
  createdAt: number;
}

interface ActivationUser {
  id?: string;
}

const getCurrentPostPath = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const { pathname } = window.location;
  return pathname.startsWith('/posts/') ? pathname : null;
};

const readPostSignupActivation = (): PostSignupActivation | null => {
  const value = storage.getItem(activationStorageKey);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as PostSignupActivation;
  } catch {
    storage.removeItem(activationStorageKey);
    return null;
  }
};

export const markPostSignupActivation = (user?: ActivationUser): void => {
  const postPath = getCurrentPostPath();
  if (!user?.id || !postPath) {
    return;
  }

  storage.setItem(
    activationStorageKey,
    JSON.stringify({
      userId: user.id,
      postPath,
      createdAt: Date.now(),
    } satisfies PostSignupActivation),
  );
};

export const hasPostSignupActivation = (userId?: string): boolean => {
  const postPath = getCurrentPostPath();
  if (!userId || !postPath) {
    return false;
  }

  const activation = readPostSignupActivation();
  if (!activation) {
    return false;
  }

  if (Date.now() - activation.createdAt > activationTtl) {
    storage.removeItem(activationStorageKey);
    return false;
  }

  return activation.userId === userId && activation.postPath === postPath;
};

export const clearPostSignupActivation = (): void => {
  storage.removeItem(activationStorageKey);
};
