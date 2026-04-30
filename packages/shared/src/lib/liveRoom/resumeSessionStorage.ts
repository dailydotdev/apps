interface StoredLiveRoomResumeSession {
  roomId: string;
  participantId: string;
  resumeToken: string;
  ttlMs: number;
  updatedAt: number;
}

const storageKeyPrefix = 'live-room-resume:';
const fallbackStorage = new Map<string, string>();

const readStorage = (): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage;
    }
  } catch {
    // Fall through to the in-memory store.
  }

  return {
    getItem: (key) => fallbackStorage.get(key) ?? null,
    setItem: (key, value) => {
      fallbackStorage.set(key, value);
    },
    removeItem: (key) => {
      fallbackStorage.delete(key);
    },
  };
};

const getStorageKey = (roomId: string): string =>
  `${storageKeyPrefix}${roomId}`;

const clearStoredSessionByKey = (roomId: string): void => {
  readStorage().removeItem(getStorageKey(roomId));
};

export const writeStoredLiveRoomResumeSession = (
  session: StoredLiveRoomResumeSession,
): void => {
  readStorage().setItem(getStorageKey(session.roomId), JSON.stringify(session));
};

export const readStoredLiveRoomResumeSession = (
  roomId: string,
  now = Date.now(),
): StoredLiveRoomResumeSession | null => {
  const raw = readStorage().getItem(getStorageKey(roomId));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredLiveRoomResumeSession>;
    if (
      parsed.roomId !== roomId ||
      typeof parsed.participantId !== 'string' ||
      typeof parsed.resumeToken !== 'string' ||
      typeof parsed.ttlMs !== 'number' ||
      typeof parsed.updatedAt !== 'number'
    ) {
      clearStoredSessionByKey(roomId);
      return null;
    }

    if (parsed.updatedAt + parsed.ttlMs <= now) {
      clearStoredSessionByKey(roomId);
      return null;
    }

    return {
      roomId: parsed.roomId,
      participantId: parsed.participantId,
      resumeToken: parsed.resumeToken,
      ttlMs: parsed.ttlMs,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    clearStoredSessionByKey(roomId);
    return null;
  }
};

export const touchStoredLiveRoomResumeSession = (
  roomId: string,
  now = Date.now(),
): void => {
  const stored = readStoredLiveRoomResumeSession(roomId, now);
  if (!stored) {
    return;
  }

  writeStoredLiveRoomResumeSession({
    ...stored,
    updatedAt: now,
  });
};

export const clearStoredLiveRoomResumeSession = (roomId: string): void => {
  clearStoredSessionByKey(roomId);
};

export type { StoredLiveRoomResumeSession };
