import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCallback, useEffect } from 'react';
import type { Opportunity } from '../../../../features/opportunity/types';
import {
  opportunityEditInfoSchema,
  createOpportunityEditContentSchema,
} from '../../../../lib/schema/opportunity';

/**
 * Unified schema combining info and content for side-by-side editing.
 * This schema is used for real-time validation and form state management.
 */
export const opportunitySideBySideEditSchema = opportunityEditInfoSchema.extend(
  {
    content: z.object({
      overview: createOpportunityEditContentSchema({
        errorLabel: 'Overview is required',
      }),
      responsibilities: createOpportunityEditContentSchema({
        errorLabel: 'Responsibilities are required',
      }),
      requirements: createOpportunityEditContentSchema({
        errorLabel: 'Requirements are required',
      }),
      whatYoullDo: createOpportunityEditContentSchema({ optional: true }),
      interviewProcess: createOpportunityEditContentSchema({ optional: true }),
    }),
  },
);

export type OpportunitySideBySideEditFormData = z.infer<
  typeof opportunitySideBySideEditSchema
>;

/**
 * Convert Opportunity data to form data format.
 */
export function opportunityToFormData(
  opportunity: Opportunity | undefined,
): OpportunitySideBySideEditFormData | undefined {
  if (!opportunity) {
    return undefined;
  }

  return {
    title: opportunity.title || '',
    tldr: opportunity.tldr || '',
    keywords: opportunity.keywords?.map((k) => ({ keyword: k.keyword })) || [],
    externalLocationId: opportunity.locations?.[0]?.location?.city || undefined,
    locationType: opportunity.locations?.[0]?.type?.value,
    meta: {
      employmentType: opportunity.meta?.employmentType?.value ?? 0,
      teamSize: opportunity.meta?.teamSize ?? 1,
      salary: {
        min: opportunity.meta?.salary?.min,
        max: opportunity.meta?.salary?.max,
        period: opportunity.meta?.salary?.period?.value ?? 0,
      },
      seniorityLevel: opportunity.meta?.seniorityLevel?.value ?? 0,
      roleType: opportunity.meta?.roleType ?? 0.5,
    },
    content: {
      overview: {
        content: opportunity.content?.overview?.content || '',
      },
      responsibilities: {
        content: opportunity.content?.responsibilities?.content || '',
      },
      requirements: {
        content: opportunity.content?.requirements?.content || '',
      },
      whatYoullDo: {
        content: opportunity.content?.whatYoullDo?.content || '',
      },
      interviewProcess: {
        content: opportunity.content?.interviewProcess?.content || '',
      },
    },
  };
}

export interface UseOpportunityEditFormOptions {
  /**
   * Initial opportunity data to populate the form
   */
  opportunity?: Opportunity;
  /**
   * Draft data from localStorage (takes precedence over opportunity)
   */
  draftData?: OpportunitySideBySideEditFormData;
}

export interface UseOpportunityEditFormReturn {
  form: UseFormReturn<OpportunitySideBySideEditFormData>;
  /**
   * Reset form to opportunity data (discard changes)
   */
  resetToOpportunity: () => void;
  /**
   * Check if form has unsaved changes
   */
  isDirty: boolean;
}

/**
 * Hook to manage the opportunity edit form state.
 *
 * Features:
 * - Unified form schema combining info and content
 * - Real-time validation
 * - Support for draft data from localStorage
 * - Reset functionality
 */
export function useOpportunityEditForm({
  opportunity,
  draftData,
}: UseOpportunityEditFormOptions): UseOpportunityEditFormReturn {
  const opportunityFormData = opportunityToFormData(opportunity);

  // Use draft data if available, otherwise use opportunity data
  const defaultValues = draftData || opportunityFormData;

  const form = useForm<OpportunitySideBySideEditFormData>({
    resolver: zodResolver(opportunitySideBySideEditSchema),
    defaultValues,
    mode: 'onChange',
  });

  // Reset form when opportunity data changes (e.g., after reimport)
  // We intentionally only depend on opportunity?.id to avoid resetting on every render
  useEffect(() => {
    if (opportunityFormData && !draftData) {
      form.reset(opportunityFormData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opportunity?.id]);

  const resetToOpportunity = useCallback(() => {
    if (opportunityFormData) {
      form.reset(opportunityFormData);
    }
  }, [form, opportunityFormData]);

  return {
    form,
    resetToOpportunity,
    isDirty: form.formState.isDirty,
  };
}

export default useOpportunityEditForm;
