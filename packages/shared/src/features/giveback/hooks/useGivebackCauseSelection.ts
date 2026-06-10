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
  selectedCount: number;
  // Whether the visitor has confirmed causes before (drives the onboarded view).
  hasSavedCauses: boolean;
  // Resolves true when the picks persisted, false when the save failed.
  save: () => Promise<boolean>;
  isSaving: boolean;
}

// Owns the cause-picker selection so the grid and the sticky continue bar (which
// lives at the page root, outside the grid's animated wrapper) share one state.
export const useGivebackCauseSelection = (
  enabled: boolean,
): UseGivebackCauseSelection => {
  const { displayToast } = useToastNotification();
  const { causes, selectedCauseIds, isPending } =
    useContributionCausePicker(enabled);
  const { saveCausePreferences, isPending: isSaving } =
    useUpdateContributionCausePreferences();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
    selectedCount: selectedIds.size,
    hasSavedCauses: selectedCauseIds.length > 0,
    save,
    isSaving,
  };
};
