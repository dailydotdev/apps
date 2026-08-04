import { useCallback, useMemo, useState } from 'react';
import type { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import type { WorldSettings } from '../../graphql/world';
import type { WorldSettingsPatch } from './useWorldSettings';
import { useUpdateWorldSettings } from './useWorldSettings';

/** The four customisations, with the "never touched it" shape filled in. */
export type WorldDraftSettings = Pick<
  WorldSettings,
  'name' | 'sky' | 'crest' | 'look' | 'private'
>;

export interface WorldDraft {
  isOpen: boolean;
  /** Non-null exactly while the bench is open. */
  settings: WorldDraftSettings | null;
  setSettings: (next: WorldDraftSettings) => void;
  open: () => void;
  cancel: () => void;
  save: () => Promise<void>;
  isSaving: boolean;
  error?: string;
  /**
   * What the world is drawn with right now: the draft while the bench is open,
   * and what is stored otherwise. The bench edits a LIVE frame — every chip
   * lands on the world behind it — so this is what the engine is told about.
   */
  applied: WorldSettings | null;
}

const EMPTY: WorldDraftSettings = {
  name: null,
  sky: null,
  crest: null,
  look: null,
  private: false,
};

const toDraft = (settings?: WorldSettings | null): WorldDraftSettings =>
  settings
    ? {
        name: settings.name,
        sky: settings.sky,
        crest: settings.crest,
        look: settings.look,
        private: settings.private,
      }
    : EMPTY;

/**
 * Only what actually changed.
 *
 * The mutation is a patch: an absent key leaves the stored value alone and an
 * explicit null clears it back to the derived suggestion. Sending all four every
 * time would turn "I renamed my world" into a write that also pins the crest and
 * the look at whatever the suggestion happened to be that day, which is exactly
 * what the API refuses to do on its own side.
 */
export const worldSettingsPatch = (
  draft: WorldDraftSettings,
  saved?: WorldSettings | null,
): WorldSettingsPatch => {
  const base = toDraft(saved);
  const patch: WorldSettingsPatch = {};
  const name = draft.name?.trim() || null;
  if (name !== (base.name?.trim() || null)) {
    patch.name = name;
  }
  if (JSON.stringify(draft.sky) !== JSON.stringify(base.sky)) {
    patch.sky = draft.sky;
  }
  if (JSON.stringify(draft.crest) !== JSON.stringify(base.crest)) {
    patch.crest = draft.crest;
  }
  if (JSON.stringify(draft.look) !== JSON.stringify(base.look)) {
    patch.look = draft.look;
  }
  if (draft.private !== base.private) {
    patch.private = draft.private;
  }
  return patch;
};

/* What the API refused, in its own words — a rejected crest says which charge or
   tincture was not earned, and that is more useful than anything written here. */
const reasonFor = (error?: Error): string | undefined => {
  if (!error) {
    return undefined;
  }
  const [first] = (error as unknown as ApiErrorResult)?.response?.errors ?? [];
  return first?.message ?? 'That could not be saved. Try again in a moment.';
};

export const useWorldDraft = (
  userId: string,
  saved?: WorldSettings | null,
): WorldDraft => {
  const [settings, setSettings] = useState<WorldDraftSettings | null>(null);
  const { save: persist, isSaving, error } = useUpdateWorldSettings(userId);

  const open = useCallback(() => setSettings(toDraft(saved)), [saved]);
  const cancel = useCallback(() => setSettings(null), []);

  const save = useCallback(async () => {
    if (!settings) {
      return;
    }
    const patch = worldSettingsPatch(settings, saved);
    /* A bench somebody opened and closed again is not a write. The API upserts
       nothing for an empty patch either, but this also spares the round trip. */
    if (Object.keys(patch).length) {
      await persist(patch);
    }
    setSettings(null);
  }, [persist, saved, settings]);

  /* The draft while the bench is open, so a chip is on the world before it is
     saved, and the stored settings the moment it closes — which is what makes
     Cancel put the place back the way it was found. */
  const applied = useMemo<WorldSettings | null>(
    () => (settings ? { ...toDraft(saved), ...settings } : saved ?? null),
    [saved, settings],
  );

  return {
    isOpen: !!settings,
    settings,
    setSettings,
    open,
    cancel,
    save,
    isSaving,
    error: reasonFor(error),
    applied,
  };
};
