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
  /** What the engine is told: the draft while the bench is open, stored settings otherwise. */
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
 * Only what actually changed: an absent key leaves the stored value alone, an
 * explicit null clears it back to the derived suggestion.
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

/* What the API refused, in its own words — a rejected crest names the charge or
   tincture that was not earned. */
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
    // An untouched bench is not a write; an empty patch spares the round trip.
    if (Object.keys(patch).length) {
      try {
        await persist(patch);
      } catch {
        // The mutation's own error state carries the message; the bench stays
        // open so nothing typed is lost.
        return;
      }
    }
    setSettings(null);
  }, [persist, saved, settings]);

  /* The draft while the bench is open, stored settings the moment it closes —
     what makes Cancel put the place back the way it was found. */
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
