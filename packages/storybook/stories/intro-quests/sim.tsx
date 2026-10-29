import type { ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { IntroQuest, ProfileFieldId, QuestId } from './data';
import { allQuests, introQuests, mockToken, profileFields } from './data';

// A fake backend for the review. Every action in a variant runs through here,
// so clicking "Turn on" really raises the permission prompt, "Create key" really
// reveals a key, and a quest really moves todo → working → ready to claim →
// claimed. Timings are short on purpose: this is for judging flow, not latency.

export type Phase = 'todo' | 'working' | 'ready' | 'claimed';
export type Permission = 'default' | 'prompting' | 'granted' | 'blocked';

export type Scenario =
  | 'fresh'
  | 'midway'
  | 'blocked'
  | 'almostDone'
  | 'allDone';

export const scenarioLabels: Record<Scenario, string> = {
  fresh: 'Day one, nothing done',
  midway: 'Two done, one to claim',
  blocked: 'Notifications blocked',
  almostDone: 'One left',
  allDone: 'All claimed',
};

interface SimState {
  phases: Record<QuestId, Phase>;
  permission: Permission;
  profileDone: ProfileFieldId[];
  token: string | null;
  copied: string | null;
  toast: string | null;
}

const allPhases = (phase: Phase): Record<QuestId, Phase> =>
  allQuests.reduce(
    (acc, quest) => ({ ...acc, [quest.id]: phase }),
    {} as Record<QuestId, Phase>,
  );

const buildScenario = (scenario: Scenario): SimState => {
  const base: SimState = {
    phases: allPhases('todo'),
    permission: 'default',
    profileDone: ['photo', 'experience'],
    token: null,
    copied: null,
    toast: null,
  };

  switch (scenario) {
    case 'midway':
      return {
        ...base,
        phases: {
          ...base.phases,
          extension: 'claimed',
          notifications: 'ready',
        },
        permission: 'granted',
        profileDone: ['photo', 'headline', 'experience'],
      };
    case 'blocked':
      return {
        ...base,
        phases: { ...base.phases, extension: 'claimed' },
        permission: 'blocked',
      };
    case 'almostDone':
      return {
        ...base,
        phases: { ...allPhases('claimed'), apiCall: 'todo' },
        permission: 'granted',
        profileDone: profileFields.map(({ id }) => id),
        token: mockToken,
      };
    case 'allDone':
      return {
        ...base,
        phases: allPhases('claimed'),
        permission: 'granted',
        profileDone: profileFields.map(({ id }) => id),
        token: mockToken,
      };
    default:
      return base;
  }
};

export interface QuestSim {
  state: SimState;
  phaseOf: (id: QuestId) => Phase;
  isDone: (id: QuestId) => boolean;
  isBlockedBy: (quest: IntroQuest) => IntroQuest | null;
  doneCount: number;
  claimableCount: number;
  earned: { xp: number; cores: number };
  nextQuest: IntroQuest | null;
  start: (id: QuestId) => void;
  allowPermission: () => void;
  blockPermission: () => void;
  completeField: (field: ProfileFieldId) => void;
  copy: (key: string) => void;
  claim: (id: QuestId) => void;
  claimAll: () => void;
  reset: () => void;
}

const SimContext = createContext<QuestSim | null>(null);

export const useSim = (): QuestSim => {
  const sim = useContext(SimContext);

  if (!sim) {
    throw new Error('useSim must be used inside <SimProvider>');
  }

  return sim;
};

const WORK_MS: Partial<Record<QuestId, number>> = {
  extension: 1800,
  brief: 2200,
  read3: 1600,
  reminder: 500,
  story: 500,
  apiKey: 700,
  apiCall: 2600,
  profile: 500,
};

export const SimProvider = ({
  scenario,
  children,
}: {
  scenario: Scenario;
  children: ReactNode;
}): ReactElement => {
  const [state, setState] = useState<SimState>(() => buildScenario(scenario));
  const timers = useRef<number[]>([]);

  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    setState(buildScenario(scenario));
  }, [scenario]);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  const setPhase = useCallback((id: QuestId, phase: Phase) => {
    setState((current) => ({
      ...current,
      phases: { ...current.phases, [id]: phase },
    }));
  }, []);

  const toast = useCallback(
    (message: string) => {
      setState((current) => ({ ...current, toast: message }));
      later(2400, () =>
        setState((current) =>
          current.toast === message ? { ...current, toast: null } : current,
        ),
      );
    },
    [later],
  );

  const finishWork = useCallback(
    (id: QuestId) => {
      setPhase(id, 'working');
      later(WORK_MS[id] ?? 800, () => setPhase(id, 'ready'));
    },
    [later, setPhase],
  );

  const start = useCallback(
    (id: QuestId) => {
      switch (id) {
        case 'extension':
          toast('Chrome Web Store opened in a new tab');
          finishWork(id);
          return;
        case 'notifications':
          setState((current) =>
            current.permission === 'blocked'
              ? current
              : { ...current, permission: 'prompting' },
          );
          return;
        case 'apiKey':
          setPhase(id, 'working');
          later(WORK_MS.apiKey ?? 700, () =>
            setState((current) => ({
              ...current,
              token: mockToken,
              phases: { ...current.phases, apiKey: 'ready' },
            })),
          );
          return;
        case 'apiCall':
          setState((current) => ({ ...current, copied: 'curl' }));
          toast('Command copied. Run it in your terminal');
          finishWork(id);
          return;
        case 'read3':
          toast('Today’s picks opened in the reader');
          finishWork(id);
          return;
        case 'reminder':
          toast('Daily reading reminder set');
          finishWork(id);
          return;
        case 'story':
          toast('You will hear when the story moves');
          finishWork(id);
          return;
        case 'profile':
          toast('Profile settings opened in a new tab');
          setState((current) => ({
            ...current,
            profileDone: profileFields.map(({ id: field }) => field),
          }));
          finishWork(id);
          return;
        default:
          finishWork(id);
      }
    },
    [finishWork, later, setPhase, toast],
  );

  const allowPermission = useCallback(() => {
    setState((current) => ({
      ...current,
      permission: 'granted',
      phases: { ...current.phases, notifications: 'ready' },
    }));
  }, []);

  const blockPermission = useCallback(() => {
    setState((current) => ({ ...current, permission: 'blocked' }));
  }, []);

  const completeField = useCallback((field: ProfileFieldId) => {
    setState((current) => {
      if (current.profileDone.includes(field)) {
        return current;
      }

      const profileDone = [...current.profileDone, field];
      const isComplete = profileDone.length === profileFields.length;

      return {
        ...current,
        profileDone,
        phases: isComplete
          ? { ...current.phases, profile: 'ready' }
          : current.phases,
      };
    });
  }, []);

  const copy = useCallback(
    (key: string) => {
      setState((current) => ({ ...current, copied: key }));
      later(1600, () =>
        setState((current) =>
          current.copied === key ? { ...current, copied: null } : current,
        ),
      );
    },
    [later],
  );

  const claim = useCallback(
    (id: QuestId) => setPhase(id, 'claimed'),
    [setPhase],
  );

  const claimAll = useCallback(() => {
    setState((current) => ({
      ...current,
      phases: Object.fromEntries(
        Object.entries(current.phases).map(([id, phase]) => [
          id,
          phase === 'ready' ? 'claimed' : phase,
        ]),
      ) as Record<QuestId, Phase>,
    }));
  }, []);

  const reset = useCallback(
    () => setState(buildScenario(scenario)),
    [scenario],
  );

  const value = useMemo<QuestSim>(() => {
    const phaseOf = (id: QuestId) => state.phases[id];
    const isDone = (id: QuestId) =>
      state.phases[id] === 'ready' || state.phases[id] === 'claimed';
    const isBlockedBy = (quest: IntroQuest) => {
      if (!quest.requires || isDone(quest.requires)) {
        return null;
      }

      return introQuests.find(({ id }) => id === quest.requires) ?? null;
    };
    const claimed = introQuests.filter(({ id }) => phaseOf(id) === 'claimed');

    return {
      state,
      phaseOf,
      isDone,
      isBlockedBy,
      doneCount: introQuests.filter(({ id }) => isDone(id)).length,
      claimableCount: introQuests.filter(({ id }) => phaseOf(id) === 'ready')
        .length,
      earned: claimed.reduce(
        (acc, quest) => ({
          xp: acc.xp + quest.xp,
          cores: acc.cores + quest.cores,
        }),
        { xp: 0, cores: 0 },
      ),
      nextQuest:
        introQuests.find(
          (quest) => phaseOf(quest.id) !== 'claimed' && !isBlockedBy(quest),
        ) ?? null,
      start,
      allowPermission,
      blockPermission,
      completeField,
      copy,
      claim,
      claimAll,
      reset,
    };
  }, [
    state,
    start,
    allowPermission,
    blockPermission,
    completeField,
    copy,
    claim,
    claimAll,
    reset,
  ]);

  return <SimContext.Provider value={value}>{children}</SimContext.Provider>;
};
