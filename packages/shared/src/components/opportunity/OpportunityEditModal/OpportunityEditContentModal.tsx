import React, { useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ModalProps } from '../../modals/common/Modal';
import { Modal } from '../../modals/common/Modal';
import { opportunityByIdOptions } from '../../../features/opportunity/queries';
import { Loader } from '../../Loader';

import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { labels } from '../../../lib';
import { editOpportunityContentMutationOptions } from '../../../features/opportunity/graphql';
import { ApiError } from '../../../graphql/common';
import { useUpdateQuery } from '../../../hooks/useUpdateQuery';
import { useToastNotification } from '../../../hooks';
import { opportunityEditContentSchema } from '../../../lib/schema/opportunity';
import MarkdownInput from '../../fields/MarkdownInput';
import { applyZodErrorsToForm } from '../../../lib/form';
import { useExitConfirmation } from '../../../hooks/useExitConfirmation';
import { usePrompt } from '../../../hooks/usePrompt';
import { opportunityEditDiscardPrompt } from './common';

export type OpportunityEditContentModalProps = {
  id: string;
  contentTitle: string;
  contentName: string;
};

export const OpportunityEditContentModal = ({
  id,
  contentTitle,
  contentName,
  ...rest
}: OpportunityEditContentModalProps & ModalProps) => {
  const { displayToast } = useToastNotification();
  const { data: opportunity, promise } = useQuery({
    ...opportunityByIdOptions({ id }),
    experimental_prefetchInRender: true,
  });

  const [, updateOpportunity] = useUpdateQuery(opportunityByIdOptions({ id }));

  const { mutateAsync } = useMutation({
    ...editOpportunityContentMutationOptions(),
    onSuccess: (result) => {
      updateOpportunity(result);

      rest.onRequestClose?.(null);
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
    setError,
    setValue,
  } = useForm({
    resolver: zodResolver(opportunityEditContentSchema),
    defaultValues: async () => {
      const opportunityData = await promise;

      return {
        content: {
          [contentName]: opportunityData.content[contentName]?.content,
        },
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

  if (!opportunity) {
    return <Loader />;
  }

  return (
    <Modal {...rest} isOpen onRequestClose={onRequestClose}>
      <Modal.Header className="flex justify-between" showCloseButton={false}>
        <Modal.Title className="typo-title3">{contentTitle}</Modal.Title>
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
        <Controller
          control={control}
          name={`content.${contentName}`}
          render={({ field }) => (
            <MarkdownInput
              allowPreview={false}
              textareaProps={{
                name: field.name,
                rows: 6,
                maxLength: 1440,
              }}
              className={{
                container: 'flex-1',
              }}
              initialContent={field.value}
              enabledCommand={{ upload: false, link: false, mention: false }}
              showMarkdownGuide={false}
              onValueUpdate={(value) => {
                field.onChange(value);
              }}
            />
          )}
        />
        <Button
          className="max-w-36"
          type="submit"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Small}
          onClick={() => {
            setValue(`content.${contentName}`, '');

            onSubmit();
          }}
          loading={isSubmitting}
        >
          Remove section
        </Button>
      </Modal.Body>
    </Modal>
  );
};
