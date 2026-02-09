import type { ReactNode } from 'react';
import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Opportunity } from '../../../../features/opportunity/types';
import { OpportunityState } from '../../../../features/opportunity/protobuf/opportunity';
import {
  opportunityEditInfoSchema,
  createOpportunityEditContentSchema,
} from '../../../../lib/schema/opportunity';
import { labels } from '../../../../lib/labels';

export function getOpportunityStateLabel(state: OpportunityState): string {
  switch (state) {
    case OpportunityState.DRAFT:
      return 'DRAFT';
    case OpportunityState.LIVE:
      return 'LIVE';
    case OpportunityState.CLOSED:
      return 'CLOSED';
    case OpportunityState.IN_REVIEW:
      return 'IN REVIEW';
    default:
      return 'DRAFT';
  }
}

export function getOpportunityStateBadgeClass(state: OpportunityState): string {
  switch (state) {
    case OpportunityState.DRAFT:
      return 'bg-status-warning text-white';
    case OpportunityState.LIVE:
      return 'bg-status-success text-white';
    case OpportunityState.CLOSED:
      return 'bg-text-disabled text-white';
    case OpportunityState.IN_REVIEW:
      return 'bg-status-info text-white';
    default:
      return 'bg-status-warning text-white';
  }
}

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
    locationType: opportunity.locations?.[0]?.type,
    locations:
      opportunity.locations?.map((loc) => ({
        locationId: loc.locationId || undefined,
        externalLocationId: undefined,
        locationData: loc.location
          ? {
              id: '',
              city: loc.location.city,
              country: loc.location.country || '',
              subdivision: loc.location.subdivision,
            }
          : undefined,
      })) || [],
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

export function formDataToPreviewOpportunity(
  formData: Partial<OpportunitySideBySideEditFormData>,
): Partial<Opportunity> {
  return {
    title: formData.title,
    tldr: formData.tldr,
    keywords: formData.keywords,
    locations:
      formData.locations?.map((loc) => ({
        type: formData.locationType,
        location: loc.locationData
          ? {
              city: loc.locationData.city,
              country: loc.locationData.country,
              subdivision: loc.locationData.subdivision,
            }
          : null,
      })) || [],
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

export function formDataToMutationPayload(
  formData: OpportunitySideBySideEditFormData,
) {
  return {
    title: formData.title,
    tldr: formData.tldr,
    keywords: formData.keywords,
    location: formData.locations?.map((loc) => ({
      locationId: loc.locationId,
      externalLocationId: loc.externalLocationId,
      type: formData.locationType,
      city: loc.locationData?.city,
      country: loc.locationData?.country,
      subdivision: loc.locationData?.subdivision,
    })),
    meta: {
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
    },
    content: {
      overview: { content: formData.content.overview?.content || '' },
      responsibilities: {
        content: formData.content.responsibilities?.content || '',
      },
      requirements: { content: formData.content.requirements?.content || '' },
      whatYoullDo: formData.content.whatYoullDo?.content
        ? { content: formData.content.whatYoullDo.content }
        : undefined,
      interviewProcess: formData.content.interviewProcess?.content
        ? { content: formData.content.interviewProcess.content }
        : undefined,
    },
  };
}

export interface ValidationIssue {
  path?: PropertyKey[];
  message: string;
}

export interface ValidationErrorPromptConfig {
  title: string;
  description: ReactNode;
  okButton: {
    className: string;
    title: string;
  };
  cancelButton: null;
}

/**
 * Creates the prompt config for displaying validation errors.
 * Use with `showPrompt` from `usePrompt` hook.
 */
export function getValidationErrorPromptConfig(
  issues: ValidationIssue[],
): ValidationErrorPromptConfig {
  return {
    title: labels.opportunity.requiredMissingNotice.title,
    description: (
      <div className="flex flex-col gap-4">
        <span>{labels.opportunity.requiredMissingNotice.description}</span>
        <ul className="text-text-tertiary">
          {issues.map((issue) => {
            const key = issue.path?.join('.') || issue.message;
            return <li key={key}>• {issue.message}</li>;
          })}
        </ul>
      </div>
    ),
    okButton: {
      className: '!w-full',
      title: labels.opportunity.requiredMissingNotice.okButton,
    },
    cancelButton: null,
  };
}

export interface UseOpportunityEditFormOptions {
  opportunity?: Opportunity;
  draftData?: OpportunitySideBySideEditFormData;
}

export interface UseOpportunityEditFormReturn {
  form: UseFormReturn<OpportunitySideBySideEditFormData>;
  resetToOpportunity: () => void;
  isDirty: boolean;
}

export function useOpportunityEditForm({
  opportunity,
  draftData,
}: UseOpportunityEditFormOptions): UseOpportunityEditFormReturn {
  const opportunityFormData = opportunityToFormData(opportunity);
  const defaultValues = draftData || opportunityFormData;

  const form = useForm<OpportunitySideBySideEditFormData>({
    resolver: zodResolver(opportunitySideBySideEditSchema),
    defaultValues,
    mode: 'onChange',
  });

  // Reset form when opportunity data changes (e.g., after reimport)
  useEffect(() => {
    if (opportunity && !draftData) {
      // Compute form data inside effect to avoid stale closure
      const freshFormData = opportunityToFormData(opportunity);
      if (freshFormData) {
        form.reset(freshFormData);
      }
    }
  }, [opportunity, draftData, form]);

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
