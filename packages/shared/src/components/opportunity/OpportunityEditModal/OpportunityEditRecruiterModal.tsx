import React, { useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import type { ModalProps } from '../../modals/common/Modal';
import { Modal } from '../../modals/common/Modal';
import { TextField } from '../../fields/TextField';
import { opportunityByIdOptions } from '../../../features/opportunity/queries';
import { Loader } from '../../Loader';
import Textarea from '../../fields/Textarea';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { labels } from '../../../lib';
import { editOpportunityRecruiterMutationOptions } from '../../../features/opportunity/mutations';
import { ApiError } from '../../../graphql/common';
import { useUpdateQuery } from '../../../hooks/useUpdateQuery';
import { useToastNotification } from '../../../hooks';
import { applyZodErrorsToForm } from '../../../lib/form';
import { opportunityEditDiscardPrompt } from './common';
import { useExitConfirmation } from '../../../hooks/useExitConfirmation';
import { usePrompt } from '../../../hooks/usePrompt';

// This is exported from here because extension fails to build when it is imported from lib/schema/opportunity.ts
export const opportunityEditRecruiterSchema = z.object({
  recruiter: z.object({
    userId: z.string(),
    title: z.string().max(240).optional(),
    bio: z.string().max(2000).optional(),
  }),
});

export type OpportunityEditRecruiterModalProps = {
  id: string;
  recruiterId?: string;
};

export const OpportunityEditRecruiterModal = ({
  id,
  recruiterId,
  ...rest
}: OpportunityEditRecruiterModalProps & ModalProps) => {
  const { displayToast } = useToastNotification();
  const { data: opportunity, promise } = useQuery({
    ...opportunityByIdOptions({ id }),
    experimental_prefetchInRender: true,
  });

  const [, updateOpportunity] = useUpdateQuery(opportunityByIdOptions({ id }));

  const { mutateAsync } = useMutation({
    ...editOpportunityRecruiterMutationOptions(),
    onSuccess: (result) => {
      updateOpportunity(result);

      rest.onRequestClose?.(null);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setError,
  } = useForm({
    resolver: zodResolver(opportunityEditRecruiterSchema),
    defaultValues: async () => {
      const opportunityData = await promise;

      // Find specific recruiter by ID, or fall back to first recruiter
      const recruiter = recruiterId
        ? opportunityData.recruiters?.find((r) => r.id === recruiterId)
        : opportunityData.recruiters?.[0];

      return {
        recruiter: {
          userId: recruiter?.id,
          title: recruiter?.title || '',
          bio: recruiter?.bio || '',
        },
      };
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await mutateAsync({
        id,
        payload: data as z.infer<typeof opportunityEditRecruiterSchema>,
      });
    } catch (originalError) {
      if (
        originalError.response?.errors?.[0]?.extensions?.code ===
        ApiError.ZodValidationError
      ) {
        applyZodErrorsToForm({
          error: originalError,
          setError,
        });
      } else {
        displayToast(
          originalError.response?.errors?.[0]?.message || labels.error.generic,
        );
      }

      throw originalError;
    }
  });

  const onValidateAction = useCallback(() => {
    return !isDirty;
  }, [isDirty]);

  const { showPrompt } = usePrompt();

  useExitConfirmation({
    message: labels.form.discard.description,
    onValidateAction,
  });

  const onRequestClose: ModalProps['onRequestClose'] = async (event) => {
    const shouldPrompt = !onValidateAction();

    if (shouldPrompt) {
      const shouldSave = await showPrompt(opportunityEditDiscardPrompt);

      if (shouldSave) {
        await onSubmit();

        return;
      }
    }

    rest.onRequestClose?.(event);
  };

  if (!opportunity) {
    return <Loader />;
  }

  return (
    <Modal {...rest} isOpen onRequestClose={onRequestClose}>
      <Modal.Header className="flex justify-between" showCloseButton={false}>
        <Modal.Title className="typo-title3">Recruiter information</Modal.Title>
        <div className="flex items-center gap-4">
          <Button
            type="text"
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
            onClick={onRequestClose}
          >
            Discard
          </Button>
          <Button
            type="submit"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            onClick={onSubmit}
            loading={isSubmitting}
          >
            Save
          </Button>
        </div>
      </Modal.Header>
      <Modal.Body className="gap-6 p-4">
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
          valid={!errors.recruiter?.bio}
          hint={errors.recruiter?.bio?.message}
        />
      </Modal.Body>
    </Modal>
  );
};
