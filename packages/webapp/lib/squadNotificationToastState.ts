interface SquadNotificationToastState {
  date: string;
  shownSquadIds: string[];
  joinedMemberSquadIds: string[];
  dismissed: boolean;
}

interface RegisterToastViewParams {
  squadId: string;
  isSquadMember: boolean;
}

interface DismissToastParams {
  squadId: string;
}

export interface SquadNotificationToastStateStore {
  registerToastView: (params: RegisterToastViewParams) => boolean;
  dismissUntilTomorrow: (params: DismissToastParams) => void;
}

const STATE_KEY_PREFIX = 'SQUAD_NOTIF_TOAST_STATE';

const getTodayDateKey = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getStorageKey = (userId?: string): string =>
  `${STATE_KEY_PREFIX}:${userId ?? 'anonymous'}`;

const getDefaultState = (): SquadNotificationToastState => ({
  date: getTodayDateKey(),
  shownSquadIds: [],
  joinedMemberSquadIds: [],
  dismissed: false,
});

const readState = (storageKey: string): SquadNotificationToastState => {
  if (typeof window === 'undefined') {
    return getDefaultState();
  }

  const fallback = getDefaultState();

  try {
    const rawState = window.localStorage.getItem(storageKey);
    if (!rawState) {
      return fallback;
    }

    const parsedState = JSON.parse(rawState) as SquadNotificationToastState;
    if (parsedState.date !== fallback.date) {
      return fallback;
    }

    return {
      date: parsedState.date,
      shownSquadIds: parsedState.shownSquadIds ?? [],
      joinedMemberSquadIds: parsedState.joinedMemberSquadIds ?? [],
      dismissed: !!parsedState.dismissed,
    };
  } catch {
    return fallback;
  }
};

const writeState = (
  storageKey: string,
  state: SquadNotificationToastState,
): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(state));
};

export const createSquadNotificationToastStateStore = (
  userId?: string,
): SquadNotificationToastStateStore => {
  const storageKey = getStorageKey(userId);

  return {
    registerToastView: ({ squadId, isSquadMember }) => {
      const state = readState(storageKey);
      const isFreshJoinEvent =
        isSquadMember && !state.joinedMemberSquadIds.includes(squadId);

      if (isFreshJoinEvent) {
        state.joinedMemberSquadIds.push(squadId);
      }

      if (state.dismissed) {
        writeState(storageKey, state);
        return false;
      }

      const hasShownAnyToastToday = state.shownSquadIds.length > 0;
      const shouldShowToast = isFreshJoinEvent || !hasShownAnyToastToday;
      if (!shouldShowToast) {
        writeState(storageKey, state);
        return false;
      }

      if (!state.shownSquadIds.includes(squadId)) {
        state.shownSquadIds.push(squadId);
      }

      writeState(storageKey, state);
      return true;
    },
    dismissUntilTomorrow: ({ squadId }) => {
      const state = readState(storageKey);

      if (!state.shownSquadIds.includes(squadId)) {
        state.shownSquadIds.push(squadId);
      }

      state.dismissed = true;
      writeState(storageKey, state);
    },
  };
};
