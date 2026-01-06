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
    locationType: opportunity.locations?.[0]?.type,
    meta: {
      employmentType: opportunity.meta?.employmentType ?? 0,
      teamSize: opportunity.meta?.teamSize ?? 1,
      salary: {
        min: opportunity.meta?.salary?.min,
        max: opportunity.meta?.salary?.max,
        period: opportunity.meta?.salary?.period ?? 0,
      },
      seniorityLevel: opportunity.meta?.seniorityLevel ?? 0,
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

/**
 * Convert form data back to Opportunity format for preview.
 * Returns a partial opportunity that can be merged with fetched data.
 * Handles undefined values during form initialization.
 */
export function formDataToPreviewOpportunity(
  formData: Partial<OpportunitySideBySideEditFormData>,
): Partial<Opportunity> {
  return {
    title: formData.title,
    tldr: formData.tldr,
    keywords: formData.keywords,
    meta: formData.meta
      ? {
          employmentType: formData.meta.employmentType,
          teamSize: formData.meta.teamSize,
          salary: formData.meta.salary
            ? {
                min: formData.meta.salary.min,
                max: formData.meta.salary.max,
                period: formData.meta.salary.period,
              }
            : undefined,
          seniorityLevel: formData.meta.seniorityLevel,
          roleType: formData.meta.roleType,
        }
      : undefined,
    content: formData.content
      ? {
          overview: {
            content: formData.content.overview?.content || '',
            html: formData.content.overview?.content || '',
          },
          responsibilities: {
            content: formData.content.responsibilities?.content || '',
            html: formData.content.responsibilities?.content || '',
          },
          requirements: {
            content: formData.content.requirements?.content || '',
            html: formData.content.requirements?.content || '',
          },
          whatYoullDo: {
            content: formData.content.whatYoullDo?.content || '',
            html: formData.content.whatYoullDo?.content || '',
          },
          interviewProcess: {
            content: formData.content.interviewProcess?.content || '',
            html: formData.content.interviewProcess?.content || '',
          },
        }
      : undefined,
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
