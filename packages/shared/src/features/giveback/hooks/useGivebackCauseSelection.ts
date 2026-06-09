import { useCallback, useEffect, useRef, useState } from 'react';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { useContributionCauses } from './useContributionCauses';
import { useContributionCausePreferences } from './useContributionCausePreferences';
import { useUpdateContributionCausePreferences } from './useUpdateContributionCausePreferences';
import type { ContributionCause } from '../types';

interface UseGivebackCauseSelection {
  causes: ContributionCause[];
  isLoading: boolean;
  selectedIds: Set<string>;
  toggleCause: (id: string) => void;
  selectedCount: number;
  save: () => Promise<void>;
  isSaving: boolean;
}

// Owns the cause-picker selection so the grid and the sticky continue bar (which
// lives at the page root, outside the grid's animated wrapper) share one state.
export const useGivebackCauseSelection = (
  enabled: boolean,
): UseGivebackCauseSelection => {
  const { displayToast } = useToastNotification();
  const { causes, isPending: isLoading } = useContributionCauses(enabled);
  const { selectedCauseIds, isPending: isLoadingPreferences } =
    useContributionCausePreferences(enabled);
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
    if (didSeedRef.current || !enabled || isLoadingPreferences) {
      return;
    }
    didSeedRef.current = true;
    setSelectedIds(new Set(selectedCauseIds));
  }, [enabled, isLoadingPreferences, selectedCauseIds]);

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
    await saveCausePreferences([...selectedIds]);
    displayToast('Your causes are saved');
  }, [saveCausePreferences, selectedIds, displayToast]);

  return {
    causes,
    isLoading,
    selectedIds,
    toggleCause,
    selectedCount: selectedIds.size,
    save,
    isSaving,
  };
};
