import { useCallback, useEffect, useRef, useState } from 'react';
import { useToastNotification } from '../../../hooks/useToastNotification';
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
  const { causes, selectedCauseIds, isPending } =
    useContributionCausePicker(enabled);
  const { saveCausePreferences, isPending: isSaving } =
    useUpdateContributionCausePreferences();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Mirror of the committed selection so toggleAndSave reads the freshest set
  // (and chains correctly across same-tick toggles) without a stale closure.
  const selectedIdsRef = useRef(selectedIds);
  selectedIdsRef.current = selectedIds;

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
  // Derive the next set from the committed state (not the closed-over value) so
  // back-to-back toggles can't persist from a stale snapshot, and roll the
  // optimistic change back if the save fails.
  const toggleAndSave = useCallback(
    (id: string) => {
      const previous = selectedIdsRef.current;
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      selectedIdsRef.current = next;
      setSelectedIds(next);
      saveCausePreferences([...next]).catch(() => {
        displayToast(labels.error.generic);
        selectedIdsRef.current = previous;
        setSelectedIds(previous);
      });
    },
    [saveCausePreferences, displayToast],
  );

  const save = useCallback(async () => {
    try {
      await saveCausePreferences([...selectedIds]);
      displayToast('Your causes are saved');
      return true;
    } catch {
      displayToast(labels.error.generic);
      return false;
    }
  }, [saveCausePreferences, selectedIds, displayToast]);

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
