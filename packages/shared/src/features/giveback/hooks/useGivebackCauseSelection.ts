import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  TOAST_NOTIF_KEY,
  useToastNotification,
} from '../../../hooks/useToastNotification';
import { labels } from '../../../lib/labels';
import { useContributionCausePicker } from './useContributionCausePicker';
import { useUpdateContributionCausePreferences } from './useUpdateContributionCausePreferences';
import type { ContributionCause } from '../types';

interface UseGivebackCauseSelection {
  causes: ContributionCause[];
  isLoading: boolean;
  selectedIds: Set<string>;
  toggleCause: (id: string) => void;
  // Toggle and persist immediately (no working-set/Save step). Used by the
  // manage tab; the funnel uses toggleCause + an explicit save instead.
  toggleAndSave: (id: string) => void;
  selectedCount: number;
  // Whether the visitor has confirmed causes before (drives the onboarded view).
  hasSavedCauses: boolean;
  // Resolves true when the picks persisted, false when the save failed.
  save: () => Promise<boolean>;
  isSaving: boolean;
}

// Owns the cause-picker selection so the grid and the sticky continue bar
// (rendered at the page root for its sticky-bottom positioning) share one state.
export const useGivebackCauseSelection = (
  enabled: boolean,
): UseGivebackCauseSelection => {
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();
  const { causes, selectedCauseIds, isPending } =
    useContributionCausePicker(enabled);
  const { saveCausePreferences, isPending: isSaving } =
    useUpdateContributionCausePreferences();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Tracks the pending toast force-clear timer so a quick unmount (or a second
  // save) doesn't leave a stray timeout firing later.
  const clearToastTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(clearToastTimer.current), []);

  // Seed from saved preferences once they resolve, so editing starts from the
  // visitor's current selection without stomping later in-picker toggles. Wait
  // for `enabled`: while the query is gated off it reports not-loading with an
  // empty list, which would otherwise seed (and lock) an empty selection before
  // the real fetch runs.
  const didSeedRef = useRef(false);
  useEffect(() => {
    if (didSeedRef.current || !enabled || isPending) {
      return;
    }
    didSeedRef.current = true;
    setSelectedIds(new Set(selectedCauseIds));
  }, [enabled, isPending, selectedCauseIds]);

  const toggleCause = useCallback((id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Persist on each toggle so the manage tab needs no "Save" step. The cause
  // visibly moving between sections is the feedback, so no toast on success.
  const toggleAndSave = useCallback(
    (id: string) => {
      const next = new Set(selectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      setSelectedIds(next);
      saveCausePreferences([...next]).catch(() =>
        displayToast(labels.error.generic),
      );
    },
    [selectedIds, saveCausePreferences, displayToast],
  );

  const save = useCallback(async () => {
    try {
      await saveCausePreferences([...selectedIds]);
      displayToast('Your causes are saved', { timer: 3000 });
      // Force-clear after the timer: the global toast only auto-dismisses when
      // the user's "auto-dismiss notifications" setting is on, and a save
      // confirmation should never sit there waiting to be closed manually.
      // Guard on identity so a newer toast is never clobbered.
      const shown = queryClient.getQueryData(TOAST_NOTIF_KEY);
      clearTimeout(clearToastTimer.current);
      clearToastTimer.current = setTimeout(() => {
        if (queryClient.getQueryData(TOAST_NOTIF_KEY) === shown) {
          queryClient.setQueryData(TOAST_NOTIF_KEY, null);
        }
      }, 3000);
      return true;
    } catch {
      displayToast(labels.error.generic);
      return false;
    }
  }, [saveCausePreferences, selectedIds, displayToast, queryClient]);

  return {
    causes,
    isLoading: isPending,
    selectedIds,
    toggleCause,
    toggleAndSave,
    selectedCount: selectedIds.size,
    hasSavedCauses: selectedCauseIds.length > 0,
    save,
    isSaving,
  };
};
