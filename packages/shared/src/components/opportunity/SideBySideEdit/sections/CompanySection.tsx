import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import { InfoIcon } from '../../../icons';
import { IconSize } from '../../../Icon';
import type { Opportunity } from '../../../../features/opportunity/types';
import { TextField } from '../../../fields/TextField';
import Textarea from '../../../fields/Textarea';
import { Button, ButtonSize, ButtonVariant } from '../../../buttons/Button';
import { updateRecruiterOrganizationMutationOptions } from '../../../../features/opportunity/mutations';
import { useUpdateQuery } from '../../../../hooks/useUpdateQuery';
import { opportunityByIdOptions } from '../../../../features/opportunity/queries';
import { useToastNotification } from '../../../../hooks';
import { RequestKey } from '../../../../lib/query';

// Simplified schema for inline company editing
const companyInlineEditSchema = z.object({
  name: z
    .string()
    .nonempty('Company name is required')
    .max(60, 'Company name is too long (max 60 characters)'),
  description: z
    .string()
    .max(2000, 'Description is too long (max 2000 characters)')
    .optional(),
});

type CompanyInlineFormData = z.infer<typeof companyInlineEditSchema>;

export interface CompanySectionProps {
  /**
   * The opportunity being edited
   */
  opportunity: Opportunity;
}

/**
 * Company section for the side-by-side edit panel.
 * Contains inline editable fields for company name and description.
 * Changes to company are global across all job postings.
 */
export function CompanySection({
  opportunity,
}: CompanySectionProps): ReactElement {
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();
  const company = opportunity?.organization;
  const hasCompany = !!company?.name;

  const [get, updateOpportunity] = useUpdateQuery(
    opportunityByIdOptions({ id: opportunity.id }),
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm<CompanyInlineFormData>({
    resolver: zodResolver(companyInlineEditSchema),
    defaultValues: {
      name: company?.name || '',
      description: company?.description || '',
    },
  });

  // Reset form when opportunity data changes
  useEffect(() => {
    if (company) {
      reset({
        name: company.name || '',
        description: company.description || '',
      });
    }
  }, [company, reset]);

  const { mutateAsync } = useMutation({
    ...updateRecruiterOrganizationMutationOptions(),
    onSuccess: (result) => {
      const currentOpportunity = get();
      updateOpportunity({
        ...currentOpportunity,
        organization: {
          ...currentOpportunity.organization,
          ...result,
        },
      });

      // Invalidate opportunities query to update sidebar
      queryClient.invalidateQueries({
        queryKey: [RequestKey.Opportunities],
      });

      displayToast('Company info saved');
    },
    onError: () => {
      displayToast('Failed to save company info');
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!company?.id) {
      displayToast('Company not found. Please refresh the page.');
      return;
    }

    await mutateAsync({
      id: company.id,
      payload: {
        name: data.name,
        description: data.description,
      },
    });
  });

  if (!hasCompany) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 rounded-8 bg-surface-float p-3">
          <InfoIcon
            size={IconSize.Small}
            className="shrink-0 text-text-tertiary"
          />
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
            className="min-w-0"
          >
            Company details are shared across all job postings. Changes here
            will update all positions from this company.
          </Typography>
        </div>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          No company info added yet
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Global changes notice */}
      <div className="flex items-center gap-2 rounded-8 bg-surface-float p-3">
        <InfoIcon
          size={IconSize.Small}
          className="shrink-0 text-text-tertiary"
        />
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Tertiary}
          className="min-w-0"
        >
          Company details are shared across all job postings. Changes here will
          update all positions from this company.
        </Typography>
      </div>

      {/* Company logo */}
      {company?.image && (
        <div className="flex items-center gap-3">
          <img
            src={company.image}
            alt={company.name}
            className="h-10 w-10 shrink-0 rounded-8 object-cover"
          />
        </div>
      )}

      {/* Inline form fields */}
      <TextField
        {...register('name')}
        type="text"
        inputId="companyName"
        label="Company name"
        fieldType="secondary"
        valid={!errors.name}
        hint={errors.name?.message}
      />

      <Textarea
        {...register('description')}
        inputId="companyDescription"
        label="Description"
        placeholder="Tell candidates about the company..."
        fieldType="secondary"
        maxLength={2000}
        rows={3}
        valid={!errors.description}
        hint={errors.description?.message}
      />

      {isDirty && (
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={onSubmit}
          loading={isSubmitting}
          className="self-start"
        >
          Save company info
        </Button>
      )}
    </div>
  );
}

export default CompanySection;
