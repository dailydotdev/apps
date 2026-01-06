import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { editOpportunityRecruiterMutationOptions } from '../../../../features/opportunity/mutations';
import { opportunityEditRecruiterSchema } from '../../OpportunityEditModal/OpportunityEditRecruiterModal';
import { useUpdateQuery } from '../../../../hooks/useUpdateQuery';
import { opportunityByIdOptions } from '../../../../features/opportunity/queries';
import { useToastNotification } from '../../../../hooks';

export interface RecruiterSectionProps {
  /**
   * The opportunity being edited
   */
  opportunity: Opportunity;
}

/**
 * Recruiter section for the side-by-side edit panel.
 * Contains inline editable fields for recruiter title and bio.
 * Changes to recruiter profile are global across all job postings.
 */
export function RecruiterSection({
  opportunity,
}: RecruiterSectionProps): ReactElement {
  const { displayToast } = useToastNotification();
  const recruiter = opportunity?.recruiters?.[0];
  const hasRecruiter = !!recruiter?.name;

  const [, updateOpportunity] = useUpdateQuery(
    opportunityByIdOptions({ id: opportunity.id }),
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(opportunityEditRecruiterSchema),
    defaultValues: {
      recruiter: {
        userId: recruiter?.id || '',
        title: recruiter?.title || '',
        bio: recruiter?.bio || '',
      },
    },
  });

  // Reset form when opportunity data changes
  useEffect(() => {
    if (recruiter) {
      reset({
        recruiter: {
          userId: recruiter.id || '',
          title: recruiter.title || '',
          bio: recruiter.bio || '',
        },
      });
    }
  }, [recruiter, reset]);

  const { mutateAsync } = useMutation({
    ...editOpportunityRecruiterMutationOptions(),
    onSuccess: (result) => {
      updateOpportunity(result);
      displayToast('Recruiter info saved');
    },
    onError: () => {
      displayToast('Failed to save recruiter info');
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    await mutateAsync({
      id: opportunity.id,
      payload: data,
    });
  });

  if (!hasRecruiter) {
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
            Recruiter profile is shared across all your job postings. Changes
            here will update your info on all positions.
          </Typography>
        </div>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          No recruiter info added yet
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
          Recruiter profile is shared across all your job postings. Changes here
          will update your info on all positions.
        </Typography>
      </div>

      {/* Recruiter info header */}
      <div className="flex items-center gap-3">
        {recruiter?.image && (
          <img
            src={recruiter.image}
            alt={recruiter.name}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        )}
        <Typography type={TypographyType.Callout} bold>
          {recruiter.name}
        </Typography>
      </div>

      {/* Inline form fields */}
      <input type="hidden" {...register('recruiter.userId')} />

      <TextField
        {...register('recruiter.title')}
        type="text"
        inputId="recruiterTitle"
        label="Title"
        placeholder="e.g., Senior Engineering Manager"
        fieldType="secondary"
        valid={!errors.recruiter?.title}
        hint={errors.recruiter?.title?.message}
      />

      <Textarea
        {...register('recruiter.bio')}
        inputId="recruiterBio"
        label="Bio"
        placeholder="Tell candidates about yourself..."
        fieldType="secondary"
        maxLength={2000}
        rows={3}
        valid={!errors.recruiter?.bio}
        hint={errors.recruiter?.bio?.message}
      />

      {isDirty && (
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={onSubmit}
          loading={isSubmitting}
          className="self-start"
        >
          Save recruiter info
        </Button>
      )}
    </div>
  );
}

export default RecruiterSection;
