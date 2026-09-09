import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import { worldPayloadHash } from './authoredPayload';
import type {
  WorldAuthoredEntry,
  WorldAuthoredTarget,
  WorldEngine,
} from './worldState';

/** Where `world dev` listens unless it was told otherwise. */
const DEFAULT_AUTHORING_ENDPOINT = 'http://localhost:4321';

const FLY_MS = 2200;
const RETRY_MS = 2000;
/* A dropped CLI is not "reconnecting" forever. After this many misses the
   panel says the agent is gone and what still stands. */
const LOST_AFTER = 5;
const AUTHORING_PROTOCOL = 2;

interface AuthoringReport extends WorldAuthoredTarget {
  opsVersion: number;
  level: number | null;
  sourceHash: string | null;
  payloadHash: string | null;
  warnings: string[];
  errors: string[];
  payload?: WorldAuthoredEntry['payload'];
}

export interface AuthoringStatus {
  connected: boolean;
  /** The connection has been down long enough to stop calling it a blip. */
  lostContact: boolean;
  connectionError?: string;
  scope?: 'realm' | 'district';
  realm?: string;
  niche?: string | null;
  family?: string;
  level?: number | null;
  errors: string[];
  warnings: string[];
  builds: number;
  /** Distinct realm-family builders and district overrides in the project. */
  changes: number;
  /** Distinct realms covered by the project. */
  realms: number;
  /** Project entries and explicit reverts that differ from the saved world. */
  unsaved: number;
  /** Authored families currently persisted by the API. */
  saved: number;
  applied: boolean;
}

export interface AuthoringActions {
  show: () => void;
  toggleSaved: () => void;
  toggleOriginal: () => void;
  revertSaved: () => Promise<void>;
  save: () => Promise<void>;
  isSaving: boolean;
  saveError?: string;
}

type ReadyMessage = {
  type: 'ready';
  protocol: number;
  user: AuthoringUser;
  version: number;
  builders: number;
};

type PatchMessage = {
  type: 'patch';
  version: number;
  upserts: AuthoringReport[];
  removals: WorldAuthoredTarget[];
  reports: AuthoringReport[];
};

type Snapshot = {
  protocol: number;
  user: AuthoringUser;
  version: number;
  entries: AuthoringReport[];
  reports: AuthoringReport[];
  removals: WorldAuthoredTarget[];
};

type ProjectContext = {
  protocol?: number;
  user?: AuthoringUser;
};

type AuthoringUser = {
  id: string;
  username: string;
};

const ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export const authoringEndpoint = (value?: string | string[]): string => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return DEFAULT_AUTHORING_ENDPOINT;
  }
  try {
    const url = new URL(raw);
    return ORIGIN.test(url.origin) ? url.origin : DEFAULT_AUTHORING_ENDPOINT;
  } catch {
    return DEFAULT_AUTHORING_ENDPOINT;
  }
};

const EMPTY: AuthoringStatus = {
  connected: false,
  lostContact: false,
  errors: [],
  warnings: [],
  builds: 0,
  changes: 0,
  realms: 0,
  unsaved: 0,
  saved: 0,
  applied: true,
};

const targetKey = ({
  scope,
  realm,
  niche,
  family,
}: WorldAuthoredTarget): string =>
  `${scope}:${scope === 'realm' ? realm : niche}:${family}`;

const asTarget = ({
  scope,
  realm,
  niche,
  family,
}: WorldAuthoredTarget): WorldAuthoredTarget => ({
  scope,
  realm,
  niche,
  family,
});

/* The hash is recomputed here rather than trusted from the CLI, so live and
   saved entries always hash the same payload the same way and the engine can
   skip rebuilding what has not changed. */
const asEntry = (report: AuthoringReport): WorldAuthoredEntry | null =>
  report.payload
    ? {
        scope: report.scope,
        realm: report.realm,
        niche: report.niche,
        family: report.family,
        opsVersion: report.opsVersion,
        payloadHash: worldPayloadHash(report.payload),
        payload: report.payload,
      }
    : null;

/* Hash equality is the system's one identity for a payload — the same compare
   the engine uses to skip rebuilds — so counting and saving use it too instead
   of re-serialising whole payloads. */
const sameEntry = (a: WorldAuthoredEntry, b: WorldAuthoredEntry): boolean =>
  a.opsVersion === b.opsVersion && a.payloadHash === b.payloadHash;

const entriesByTarget = (
  entries: WorldAuthoredEntry[],
): Map<string, WorldAuthoredEntry> =>
  new Map(entries.map((entry) => [targetKey(entry), entry]));

const saveErrorMessage = (error: unknown): string => {
  const apiError = error as {
    response?: { errors?: Array<{ message?: string }> };
  };
  return (
    apiError.response?.errors?.[0]?.message ??
    (error as Error)?.message ??
    'Your world changes could not be saved.'
  );
};

export const useWorldAuthoring = (
  engineRef: MutableRefObject<WorldEngine | null>,
  {
    endpoint,
    enabled,
    userId,
    handle,
    baseline,
    onSave,
  }: {
    endpoint: string;
    enabled: boolean;
    userId: string;
    handle: string;
    baseline: WorldAuthoredEntry[];
    onSave: (
      upserts: WorldAuthoredEntry[],
      reverts: WorldAuthoredTarget[],
    ) => Promise<WorldAuthoredEntry[]>;
  },
): AuthoringStatus & AuthoringActions => {
  const [status, setStatus] = useState<AuthoringStatus>(() => ({
    ...EMPTY,
    saved: baseline.length,
  }));
  const last = useRef<AuthoringReport | null>(null);
  const changes = useRef(new Map<string, AuthoringReport>());
  const reverts = useRef(new Map<string, WorldAuthoredTarget>());
  const baselineRef = useRef(baseline);
  const onSaveRef = useRef(onSave);
  const applied = useRef(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  baselineRef.current = baseline;
  onSaveRef.current = onSave;

  const unsavedCount = useCallback(() => {
    const saved = entriesByTarget(baselineRef.current);
    const changed = [...changes.current.values()].reduce((total, report) => {
      const entry = asEntry(report);
      if (!entry) {
        return total;
      }
      const previous = saved.get(targetKey(entry));
      return total + (!previous || !sameEntry(previous, entry) ? 1 : 0);
    }, 0);
    return changed + reverts.current.size;
  }, []);

  /* What the connected preview shows and what Save would produce: the saved
     world with the project's entries layered over it and its explicit reverts
     taken out. Never the project alone — saved families the project does not
     cover keep standing. */
  const projectView = useCallback(() => {
    const merged = entriesByTarget(baselineRef.current);
    reverts.current.forEach((_, key) => merged.delete(key));
    changes.current.forEach((report) => {
      const entry = asEntry(report);
      if (entry) {
        merged.set(targetKey(entry), entry);
      }
    });
    return [...merged.values()];
  }, []);

  useEffect(() => {
    setStatus((current) => ({
      ...current,
      saved: baseline.length,
      unsaved: unsavedCount(),
    }));
  }, [baseline, unsavedCount]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const projectChanges = changes.current;
    const projectReverts = reverts.current;
    const mountedEngine = engineRef.current;
    let source: EventSource | null = null;
    let retry: number | undefined;
    let closed = false;
    let synchronized = false;
    let appliedVersion = -1;
    let misses = 0;
    const pending: PatchMessage[] = [];

    /* Mutually recursive with `connect`; the timeout is the one forward reference. */
    const retryConnection = () => {
      source?.close();
      window.clearTimeout(retry);
      if (!closed) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        retry = window.setTimeout(() => connect(), RETRY_MS);
      }
    };

    const dropped = () => {
      misses += 1;
      setStatus((current) => ({
        ...current,
        connected: false,
        lostContact: misses >= LOST_AFTER,
      }));
      retryConnection();
    };

    const projectError = (project: ProjectContext): string | null => {
      if (project.protocol !== AUTHORING_PROTOCOL || !project.user) {
        /* npx runs @latest, so the common skew is a NEWER CLI against an older
           page — telling that user to update the CLI would send them in
           circles. */
        return typeof project.protocol === 'number' &&
          project.protocol > AUTHORING_PROTOCOL
          ? 'Your world CLI is newer than this page. Refresh the page to reconnect.'
          : 'The local world CLI is outdated. Restart it with the latest version.';
      }
      if (project.user.id !== userId) {
        return `The local project belongs to @${project.user.username}, not @${handle}.`;
      }
      return null;
    };

    const rejectProject = (error: string) => {
      projectChanges.clear();
      projectReverts.clear();
      mountedEngine?.replaceAuthored(baselineRef.current);
      last.current = null;
      pending.splice(0);
      synchronized = false;
      misses = 0;
      applied.current = true;
      setStatus({
        ...EMPTY,
        connected: true,
        connectionError: error,
        saved: baselineRef.current.length,
      });
      retryConnection();
    };

    const updateStatus = (latest: AuthoringReport | null, builds = 0) => {
      misses = 0;
      const realmCount = new Set(
        [...projectChanges.values()].map((entry) => entry.realm),
      ).size;
      setStatus((current) => ({
        ...current,
        connected: true,
        lostContact: false,
        connectionError: undefined,
        scope: latest?.scope,
        realm: latest?.realm,
        niche: latest?.niche,
        family: latest?.family,
        level: latest?.level,
        warnings: latest?.warnings ?? [],
        errors: latest?.errors ?? [],
        builds: current.builds + builds,
        changes: projectChanges.size,
        realms: realmCount,
        unsaved: unsavedCount(),
        saved: baselineRef.current.length,
        applied: applied.current,
      }));
    };

    const applyPatch = (message: PatchMessage) => {
      if (message.version <= appliedVersion) {
        return;
      }
      const saved = entriesByTarget(baselineRef.current);
      message.removals.forEach((target) => {
        const key = targetKey(target);
        projectChanges.delete(key);
        if (saved.has(key)) {
          projectReverts.set(key, asTarget(target));
        }
      });
      const upserts = message.upserts.flatMap((report) => {
        const entry = asEntry(report);
        if (!entry) {
          return [];
        }
        const key = targetKey(entry);
        projectReverts.delete(key);
        projectChanges.set(key, report);
        return [entry];
      });
      message.reports.forEach((report) => {
        const key = targetKey(report);
        const previous = projectChanges.get(key);
        if (previous) {
          projectChanges.set(key, { ...previous, ...report });
        }
      });
      if (applied.current) {
        engineRef.current?.patchAuthored(upserts, message.removals);
      }
      const latest =
        message.reports.at(-1) ??
        message.upserts.at(-1) ??
        [...projectChanges.values()].at(-1) ??
        null;
      last.current = latest;
      appliedVersion = message.version;
      updateStatus(latest, upserts.length);
    };

    const synchronize = async () => {
      synchronized = false;
      const response = await fetch(`${endpoint}/snapshot`);
      if (!response.ok) {
        throw new Error(`Authoring snapshot returned ${response.status}.`);
      }
      const snapshot = (await response.json()) as Snapshot;
      if (closed) {
        return;
      }
      const error = projectError(snapshot);
      if (error) {
        throw new Error(error);
      }

      projectChanges.clear();
      projectReverts.clear();
      const saved = entriesByTarget(baselineRef.current);
      (snapshot.removals ?? []).forEach((target) => {
        const key = targetKey(target);
        if (saved.has(key)) {
          projectReverts.set(key, asTarget(target));
        }
      });
      snapshot.entries.forEach((report) => {
        if (!report.payload) {
          return;
        }
        const key = targetKey(report);
        if (!projectReverts.has(key)) {
          projectChanges.set(key, report);
        }
      });
      snapshot.reports.forEach((report) => {
        const key = targetKey(report);
        const previous = projectChanges.get(key);
        if (previous) {
          projectChanges.set(key, { ...previous, ...report });
        }
      });
      /* Connecting starts a live session: whatever compare was toggled while
         disconnected is over, and the engine shows the merged project view. */
      applied.current = true;
      engineRef.current?.replaceAuthored(projectView());
      appliedVersion = snapshot.version;
      synchronized = true;
      /* Unfiltered on purpose, matching the live patch path: a builder that
         has only ever failed carries no payload, but its errors are exactly
         what the panel must show after a refresh. */
      const latest =
        snapshot.reports.at(-1) ?? [...projectChanges.values()].at(-1) ?? null;
      last.current = latest;
      updateStatus(latest);
      pending
        .sort((a, b) => a.version - b.version)
        .splice(0)
        .forEach(applyPatch);
    };

    async function connect() {
      if (closed) {
        return;
      }
      try {
        const response = await fetch(`${endpoint}/context`, {
          cache: 'no-store',
        });
        if (closed) {
          return;
        }
        if (!response.ok) {
          if (response.status === 403) {
            rejectProject(
              'The local world CLI is outdated. Restart it with the latest version.',
            );
            return;
          }
          throw new Error(`Authoring context returned ${response.status}.`);
        }
        const context = (await response.json()) as ProjectContext;
        const error = projectError(context);
        if (error) {
          rejectProject(error);
          return;
        }
      } catch {
        dropped();
        return;
      }

      source = new EventSource(`${endpoint}/events`);

      source.onerror = () => {
        dropped();
      };

      source.onmessage = (event) => {
        const message = JSON.parse(event.data) as ReadyMessage | PatchMessage;
        if (message.type === 'ready') {
          const error = projectError(message);
          if (error) {
            rejectProject(error);
            return;
          }
          synchronize().catch((cause: Error) => {
            if (!closed) {
              setStatus((current) => ({
                ...current,
                connected: true,
                lostContact: false,
                connectionError: cause.message,
              }));
              retryConnection();
            }
          });
          return;
        }
        if (message.type !== 'patch') {
          return;
        }
        if (!synchronized) {
          pending.push(message);
          return;
        }
        applyPatch(message);
      };
    }

    connect();

    return () => {
      closed = true;
      window.clearTimeout(retry);
      source?.close();
      mountedEngine?.replaceAuthored(baselineRef.current);
      projectChanges.clear();
      projectReverts.clear();
      last.current = null;
      applied.current = true;
      setStatus({ ...EMPTY, saved: baselineRef.current.length });
    };
  }, [enabled, endpoint, engineRef, handle, projectView, unsavedCount, userId]);

  const show = useCallback(() => {
    const message = last.current;
    const engine = engineRef.current;
    if (!message || !engine) {
      return;
    }
    engine.focus(message.realm);
    if (message.niche) {
      window.setTimeout(() => engine.focus(message.niche as string), FLY_MS);
    }
  }, [engineRef]);

  const toggleSaved = useCallback(() => {
    const engine = engineRef.current;
    if (!changes.current.size || !engine) {
      return;
    }
    const nextApplied = !applied.current;
    engine.replaceAuthored(nextApplied ? projectView() : baselineRef.current);
    applied.current = nextApplied;
    setStatus((current) => ({ ...current, applied: nextApplied }));
  }, [engineRef, projectView]);

  const toggleOriginal = useCallback(() => {
    const engine = engineRef.current;
    if (!baselineRef.current.length || !engine) {
      return;
    }
    const nextApplied = !applied.current;
    engine.replaceAuthored(nextApplied ? baselineRef.current : []);
    applied.current = nextApplied;
    setStatus((current) => ({ ...current, applied: nextApplied }));
  }, [engineRef]);

  const revertSaved = useCallback(async () => {
    if (isSaving || !baselineRef.current.length) {
      return;
    }
    setIsSaving(true);
    setSaveError(undefined);
    try {
      const next = await onSaveRef.current(
        [],
        baselineRef.current.map(asTarget),
      );
      baselineRef.current = next;
      applied.current = true;
      engineRef.current?.replaceAuthored(next);
      setStatus((current) => ({
        ...current,
        applied: true,
        unsaved: 0,
        saved: next.length,
      }));
    } catch (error) {
      setSaveError(saveErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }, [engineRef, isSaving]);

  const save = useCallback(async () => {
    if (isSaving) {
      return;
    }
    const saved = entriesByTarget(baselineRef.current);
    const upserts = [...changes.current.values()].flatMap((report) => {
      const entry = asEntry(report);
      if (!entry) {
        return [];
      }
      const previous = saved.get(targetKey(entry));
      return !previous || !sameEntry(previous, entry) ? [entry] : [];
    });
    const removed = [...reverts.current.values()];
    if (!upserts.length && !removed.length) {
      return;
    }

    setIsSaving(true);
    setSaveError(undefined);
    try {
      const next = await onSaveRef.current(upserts, removed);
      baselineRef.current = next;
      reverts.current.clear();
      applied.current = true;
      engineRef.current?.replaceAuthored(next);
      setStatus((current) => ({
        ...current,
        applied: true,
        unsaved: 0,
        saved: next.length,
      }));
    } catch (error) {
      setSaveError(saveErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }, [engineRef, isSaving]);

  /* Memoised so the builder panel's own memo can hold while the engine pushes
     a fresh world state through the rail every frame of a replay. */
  return useMemo(
    () => ({
      ...status,
      show,
      toggleSaved,
      toggleOriginal,
      revertSaved,
      save,
      isSaving,
      saveError,
    }),
    [
      status,
      show,
      toggleSaved,
      toggleOriginal,
      revertSaved,
      save,
      isSaving,
      saveError,
    ],
  );
};

export interface WorldBuildState {
  handle: string;
  authoring: AuthoringStatus & AuthoringActions;
  isOpen: boolean;
  open: () => void;
  close: () => void;
}
