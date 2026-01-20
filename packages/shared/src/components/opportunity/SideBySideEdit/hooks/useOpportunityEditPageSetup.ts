import { useCallback, useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Opportunity } from '../../../../features/opportunity/types';
import { opportunityByIdOptions } from '../../../../features/opportunity/queries';
import { EDIT_OPPORTUNITY_MUTATION } from '../../../../features/opportunity/graphql';
import { gqlClient } from '../../../../graphql/common';
import { generateQueryKey, RequestKey } from '../../../../lib/query';
import { useExitConfirmation } from '../../../../hooks/useExitConfirmation';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import {
  useOpportunityEditForm,
  formDataToPreviewOpportunity,
  formDataToMutationPayload,
} from './useOpportunityEditForm';
import type { OpportunitySideBySideEditFormData } from './useOpportunityEditForm';
import { useScrollSync } from './useScrollSync';
import type { ScrollSyncSection } from './useScrollSync';
import { useMissingFieldNavigation } from './useMissingFieldNavigation';

export interface UseOpportunityEditPageSetupOptions {
  opportunityId: string;
}

export interface UseOpportunityEditPageSetupReturn {
  // Data
  opportunity: Opportunity | undefined;
  isLoading: boolean;
  previewData: Partial<Opportunity> | undefined;

  // Form
  form: ReturnType<typeof useOpportunityEditForm>['form'];
  isDirty: boolean;

  // Save mutation
  saveOpportunity: (
    payload: ReturnType<typeof formDataToMutationPayload>,
  ) => Promise<{ editOpportunity: Opportunity }>;
  isSaving: boolean;

  // Handlers
  handleSectionFocus: (sectionId: string) => void;
  handleMissingClick: ReturnType<
    typeof useMissingFieldNavigation
  >['handleMissingClick'];
  scrollToSection: (sectionId: ScrollSyncSection) => void;

  // Utilities
  handleSave: () => Promise<boolean>;
}

export function useOpportunityEditPageSetup({
  opportunityId,
}: UseOpportunityEditPageSetupOptions): UseOpportunityEditPageSetupReturn {
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();

  // Fetch opportunity data
  const { data: opportunity, isLoading } = useQuery(
    opportunityByIdOptions({ id: opportunityId }),
  );

  // Save mutation
  const { mutateAsync: saveOpportunity, isPending: isSaving } = useMutation({
    mutationFn: async (payload: ReturnType<typeof formDataToMutationPayload>) =>
      gqlClient.request<{ editOpportunity: Opportunity }>(
        EDIT_OPPORTUNITY_MUTATION,
        {
          id: opportunityId,
          payload,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Opportunity, null, opportunityId),
      });
    },
  });

  // Initialize form with opportunity data
  const { form, isDirty } = useOpportunityEditForm({
    opportunity,
  });

  // Watch form values for real-time preview
  const formValues = useWatch({
    control: form.control,
  }) as OpportunitySideBySideEditFormData;

  // Convert form data to preview opportunity for real-time updates
  const previewData = useMemo(() => {
    if (!formValues) {
      return undefined;
    }
    return formDataToPreviewOpportunity(formValues);
  }, [formValues]);

  // Scroll sync between edit panel and preview
  const { scrollToSection } = useScrollSync({
    offset: 20,
    behavior: 'smooth',
  });

  const handleSectionFocus = useCallback(
    (sectionId: string) => {
      scrollToSection(sectionId as ScrollSyncSection);
    },
    [scrollToSection],
  );

  const { handleMissingClick } = useMissingFieldNavigation();

  // Exit confirmation when navigating away with unsaved changes
  useExitConfirmation({
    message: 'You have unsaved changes. Leave anyway?',
    onValidateAction: useCallback(() => !isDirty, [isDirty]),
  });

  // Save handler
  const handleSave = useCallback(async (): Promise<boolean> => {
    const isValid = await form.trigger();
    if (!isValid) {
      displayToast('Please complete all required fields');
      return false;
    }

    try {
      const formData = form.getValues();
      const payload = formDataToMutationPayload(formData);
      await saveOpportunity(payload);

      displayToast('Changes saved');
      form.reset(formData);
      return true;
    } catch (error) {
      displayToast('Failed to save changes. Please try again.');
      return false;
    }
  }, [form, displayToast, saveOpportunity]);

  return {
    // Data
    opportunity,
    isLoading,
    previewData,

    // Form
    form,
    isDirty,

    // Save mutation
    saveOpportunity,
    isSaving,

    // Handlers
    handleSectionFocus,
    handleMissingClick,
    scrollToSection,

    // Utilities
    handleSave,
  };
}

export default useOpportunityEditPageSetup;
