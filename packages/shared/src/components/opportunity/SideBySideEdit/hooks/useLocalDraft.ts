import { useCallback, useEffect, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { OpportunitySideBySideEditFormData } from './useOpportunityEditForm';

const DRAFT_KEY_PREFIX = 'opportunity_draft_';
const DEBOUNCE_MS = 1000;

export interface UseLocalDraftOptions {
  /**
   * Opportunity ID for localStorage key
   */
  opportunityId: string;
  /**
   * Form instance to watch and save
   */
  form: UseFormReturn<OpportunitySideBySideEditFormData>;
  /**
   * Whether to enable auto-save (default: true)
   */
  enabled?: boolean;
}

export interface UseLocalDraftReturn {
  /**
   * Whether a draft exists in localStorage
   */
  hasDraft: boolean;
  /**
   * The draft data if it exists
   */
  draftData: OpportunitySideBySideEditFormData | null;
  /**
   * Clear the draft from localStorage
   */
  clearDraft: () => void;
  /**
   * Manually save current form state to draft
   */
  saveDraft: () => void;
  /**
   * Last saved timestamp
   */
  lastSaved: Date | null;
}

function getDraftKey(opportunityId: string): string {
  return `${DRAFT_KEY_PREFIX}${opportunityId}`;
}

function loadDraft(
  opportunityId: string,
): OpportunitySideBySideEditFormData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const key = getDraftKey(opportunityId);
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load draft from localStorage:', error);
  }

  return null;
}

function saveDraftToStorage(
  opportunityId: string,
  data: OpportunitySideBySideEditFormData,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const key = getDraftKey(opportunityId);
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to save draft to localStorage:', error);
  }
}

function clearDraftFromStorage(opportunityId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const key = getDraftKey(opportunityId);
    localStorage.removeItem(key);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to clear draft from localStorage:', error);
  }
}

/**
 * Hook to manage local draft persistence for opportunity editing.
 *
 * Features:
 * - Auto-saves form changes to localStorage (debounced)
 * - Loads existing draft on mount
 * - Clears draft on successful server save
 * - Prevents data loss on accidental navigation
 */
export function useLocalDraft({
  opportunityId,
  form,
  enabled = true,
}: UseLocalDraftOptions): UseLocalDraftReturn {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [initialDraft] = useState(() => loadDraft(opportunityId));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveDraft = useCallback(() => {
    const values = form.getValues();
    saveDraftToStorage(opportunityId, values);
    setLastSaved(new Date());
  }, [form, opportunityId]);

  const clearDraft = useCallback(() => {
    clearDraftFromStorage(opportunityId);
    setLastSaved(null);
  }, [opportunityId]);

  // Watch form changes and auto-save with debounce
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const subscription = form.watch(() => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        if (form.formState.isDirty) {
          saveDraft();
        }
      }, DEBOUNCE_MS);
    });

    return () => {
      subscription.unsubscribe();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [enabled, form, saveDraft]);

  return {
    hasDraft: initialDraft !== null,
    draftData: initialDraft,
    clearDraft,
    saveDraft,
    lastSaved,
  };
}

export default useLocalDraft;
