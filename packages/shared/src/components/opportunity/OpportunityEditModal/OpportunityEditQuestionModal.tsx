import React, { useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ModalProps } from '../../modals/common/Modal';
import { Modal } from '../../modals/common/Modal';
import { opportunityByIdOptions } from '../../../features/opportunity/queries';
import { Loader } from '../../Loader';

import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { labels } from '../../../lib';
import { editOpportunityQuestionMutationOptions } from '../../../features/opportunity/graphql';
import { ApiError } from '../../../graphql/common';
import { useUpdateQuery } from '../../../hooks/useUpdateQuery';
import { useToastNotification } from '../../../hooks';
import { opportunityEditQuestionsSchema } from '../../../lib/schema/opportunity';
import { applyZodErrorsToForm } from '../../../lib/form';
import { useExitConfirmation } from '../../../hooks/useExitConfirmation';
import { usePrompt } from '../../../hooks/usePrompt';
import { opportunityEditDiscardPrompt } from './common';
import { TextField } from '../../fields/TextField';
import Textarea from '../../fields/Textarea';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { SimpleTooltip } from '../../tooltips';
import { isTesting } from '../../../lib/constants';

export type OpportunityEditQuestionModalProps = {
  id: string;
  index: number;
};

export const OpportunityEditQuestionModal = ({
  id,
  index,
  ...rest
}: OpportunityEditQuestionModalProps & ModalProps) => {
  const { displayToast } = useToastNotification();
  const { data: opportunity, promise } = useQuery({
    ...opportunityByIdOptions({ id }),
    experimental_prefetchInRender: true,
  });

  const [, updateOpportunity] = useUpdateQuery(opportunityByIdOptions({ id }));

  const { mutateAsync } = useMutation({
    ...editOpportunityQuestionMutationOptions(),
    onSuccess: (result) => {
      updateOpportunity(result);

      rest.onRequestClose?.(null);
    },
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty, errors },
    setError,
    setValue,
    getValues,
  } = useForm({
    resolver: zodResolver(opportunityEditQuestionsSchema),
    defaultValues: async () => {
      const opportunityData = await promise;

      return {
        questions: opportunityData.questions,
      };
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await mutateAsync({
        id,
        payload: data,
      });

      return result;
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
        onSubmit();

        return;
      }
    }

    rest.onRequestClose?.(event);
  };

  const canRemoveQuestion =
    useWatch({ control, name: 'questions' })?.length > 1;

  if (!opportunity) {
    return <Loader />;
  }

  return (
    <Modal {...rest} isOpen onRequestClose={onRequestClose}>
      <Modal.Header className="flex justify-between" showCloseButton={false}>
        <Modal.Title className="typo-title3">Question</Modal.Title>
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
        <TextField
          {...register(`questions.${index}.title`)}
          type="text"
          inputId={`questionTitle_${index}`}
          label="Question"
          fieldType="quaternary"
          valid={!errors.questions?.[index]?.title}
          hint={errors.questions?.[index]?.title?.message}
          maxLength={240}
        />
        <div className="flex flex-col gap-2">
          <div>
            <Typography bold>Answer hint (placeholder)</Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Explain to candidates what kind of answer you&apos;re looking for.
            </Typography>
          </div>
          <Textarea
            {...register(`questions.${index}.placeholder`)}
            inputId={`questionPlaceholder_${index}`}
            label="Placeholder"
            fieldType="quaternary"
            maxLength={480}
            valid={!errors.questions?.[index]?.placeholder}
            hint={errors.questions?.[index]?.placeholder?.message}
          />
        </div>
        <SimpleTooltip
          forceLoad={!isTesting}
          content={
            canRemoveQuestion ? '' : 'You need to provide at least one question'
          }
        >
          <div className="max-w-40">
            <Button
              type="submit"
              variant={ButtonVariant.Subtle}
              size={ButtonSize.Small}
              onClick={() => {
                const questionsCopy = getValues().questions;
                questionsCopy.splice(index, 1);

                setValue('questions', questionsCopy);

                onSubmit();
              }}
              loading={isSubmitting}
              disabled={!canRemoveQuestion}
            >
              Remove question
            </Button>
          </div>
        </SimpleTooltip>
      </Modal.Body>
    </Modal>
  );
};
