import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ModalProps } from '../../modals/common/Modal';
import { Modal } from '../../modals/common/Modal';
import { TextField } from '../../fields/TextField';
import { Button, ButtonVariant } from '../../buttons/Button';
import { ModalHeader } from '../../modals/common/ModalHeader';
import { useViewSize, ViewSize } from '../../../hooks';
import type {
  SourceStack,
  AddSourceStackInput,
} from '../../../graphql/source/sourceStack';
import type { DatasetTool } from '../../../graphql/user/userStack';
import { useStackSearch } from '../../../features/profile/hooks/useStackSearch';
import { PlusIcon } from '../../icons';

const sourceStackFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
});

type SourceStackFormData = z.infer<typeof sourceStackFormSchema>;

type SourceStackModalProps = Omit<ModalProps, 'children'> & {
  onSubmit: (input: AddSourceStackInput) => Promise<void>;
  existingItem?: SourceStack;
};

export function SourceStackModal({
  onSubmit,
  existingItem,
  ...rest
}: SourceStackModalProps): ReactElement {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const isMobile = useViewSize(ViewSize.MobileL);
  const isEditing = !!existingItem;

  const methods = useForm<SourceStackFormData>({
    resolver: zodResolver(sourceStackFormSchema),
    defaultValues: {
      title: existingItem?.title ?? existingItem?.tool.title ?? '',
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = methods;

  const title = watch('title');

  const { results: suggestions } = useStackSearch(title);

  const canSubmit = title.trim().length > 0;

  const handleSelectSuggestion = (suggestion: DatasetTool) => {
    setValue('title', suggestion.title);
    setShowSuggestions(false);
  };

  const onFormSubmit = handleSubmit(async (data) => {
    await onSubmit({
      title: data.title.trim(),
    });
    rest.onRequestClose?.(null);
  });

  const filteredSuggestions = useMemo(() => {
    if (!showSuggestions || title.length < 1) {
      return [];
    }
    return suggestions;
  }, [showSuggestions, suggestions, title.length]);

  return (
    <FormProvider {...methods}>
      <Modal
        formProps={{
          form: 'source_stack_form',
          title: (
            <div className="px-4">
              <ModalHeader.Title className="typo-title3">
                {isEditing ? 'Edit Stack Item' : 'Add to Squad Stack'}
              </ModalHeader.Title>
            </div>
          ),
          rightButtonProps: {
            variant: ButtonVariant.Primary,
            disabled: !canSubmit || isSubmitting,
            loading: isSubmitting,
          },
          copy: { right: isEditing ? 'Save' : 'Add' },
        }}
        kind={Modal.Kind.FlexibleCenter}
        size={Modal.Size.Small}
        {...rest}
      >
        <form onSubmit={onFormSubmit} id="source_stack_form" className="w-full">
          <ModalHeader showCloseButton={!isMobile}>
            <ModalHeader.Title className="typo-title3">
              {isEditing ? 'Edit Stack Item' : 'Add to Squad Stack'}
            </ModalHeader.Title>
          </ModalHeader>
          <Modal.Body className="flex flex-col gap-4">
            {/* Title with autocomplete */}
            <div className="relative">
              <TextField
                {...register('title')}
                autoComplete="off"
                autoFocus
                inputId="stackTitle"
                label="Technology or tool"
                maxLength={255}
                valid={!errors.title}
                hint={errors.title?.message}
                disabled={isEditing}
                onChange={(e) => {
                  setValue('title', e.target.value);
                  if (!isEditing) {
                    setShowSuggestions(true);
                  }
                }}
                onFocus={() => {
                  if (!isEditing) {
                    setShowSuggestions(true);
                  }
                }}
              />
              {!isEditing && showSuggestions && title.trim() && (
                <div className="absolute left-0 right-0 top-full z-1 mt-1 max-h-48 overflow-auto rounded-12 border border-border-subtlest-tertiary bg-background-default shadow-2">
                  {filteredSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-surface-hover"
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      {suggestion.faviconUrl ? (
                        <img
                          src={suggestion.faviconUrl}
                          alt=""
                          className="rounded size-4"
                        />
                      ) : (
                        <PlusIcon className="size-4 text-text-tertiary" />
                      )}
                      <span className="typo-callout">{suggestion.title}</span>
                    </button>
                  ))}
                  {!filteredSuggestions.some(
                    (s) => s.title.toLowerCase() === title.trim().toLowerCase(),
                  ) && (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-surface-hover"
                      onClick={() => {
                        setShowSuggestions(false);
                      }}
                    >
                      <PlusIcon className="size-4 text-text-tertiary" />
                      <span className="typo-callout">{title.trim()}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {!isMobile && (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                loading={isSubmitting}
                variant={ButtonVariant.Primary}
              >
                {isEditing ? 'Save changes' : 'Add to stack'}
              </Button>
            )}
          </Modal.Body>
        </form>
      </Modal>
    </FormProvider>
  );
}
