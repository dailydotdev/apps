import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ModalProps } from '../../../../components/modals/common/Modal';
import { Modal } from '../../../../components/modals/common/Modal';
import { TextField } from '../../../../components/fields/TextField';
import {
  Typography,
  TypographyType,
} from '../../../../components/typography/Typography';
import { Button, ButtonVariant } from '../../../../components/buttons/Button';
import { ModalHeader } from '../../../../components/modals/common/ModalHeader';
import { useViewSize, ViewSize } from '../../../../hooks';
import type {
  UserTool,
  AddUserToolInput,
  DatasetTool,
} from '../../../../graphql/user/userTool';
import { useToolSearch } from '../../hooks/useToolSearch';
import { PlusIcon } from '../../../../components/icons';

const CATEGORY_OPTIONS = [
  'Development',
  'Design',
  'Productivity',
  'Communication',
  'AI',
] as const;

const userToolFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  category: z.string().min(1, 'Category is required').max(100),
  customCategory: z.string().max(100).optional(),
});

type UserToolFormData = z.infer<typeof userToolFormSchema>;

type UserToolModalProps = Omit<ModalProps, 'children'> & {
  onSubmit: (input: AddUserToolInput) => Promise<void>;
  existingItem?: UserTool;
};

export function UserToolModal({
  onSubmit,
  existingItem,
  ...rest
}: UserToolModalProps): ReactElement {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const isMobile = useViewSize(ViewSize.MobileL);
  const isEditing = !!existingItem;

  const methods = useForm<UserToolFormData>({
    resolver: zodResolver(userToolFormSchema),
    defaultValues: {
      title: existingItem?.tool.title ?? '',
      category: existingItem?.category || 'Development',
      customCategory: '',
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
  const category = watch('category');
  const customCategory = watch('customCategory');

  const { results: suggestions } = useToolSearch(title);

  const isCustomCategory = !CATEGORY_OPTIONS.includes(
    category as (typeof CATEGORY_OPTIONS)[number],
  );
  const finalCategory = isCustomCategory
    ? customCategory || category
    : category;
  const canSubmit = title.trim().length > 0 && finalCategory.trim().length > 0;

  const handleSelectSuggestion = (suggestion: DatasetTool) => {
    setValue('title', suggestion.title);
    setShowSuggestions(false);
  };

  const onFormSubmit = handleSubmit(async (data) => {
    const effectiveCategory = isCustomCategory
      ? data.customCategory || data.category
      : data.category;

    await onSubmit({
      title: data.title.trim(),
      category: effectiveCategory.trim(),
    });
    rest.onRequestClose?.(null);
  });

  const filteredSuggestions = useMemo(() => {
    if (!showSuggestions || title.length < 1) {
      return [];
    }
    return suggestions;
  }, [suggestions, showSuggestions, title]);

  return (
    <FormProvider {...methods}>
      <Modal
        formProps={{
          form: 'user_tool_form',
          title: (
            <div className="px-4">
              <ModalHeader.Title className="typo-title3">
                {isEditing ? 'Edit Tool' : 'Add Tool'}
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
        <form onSubmit={onFormSubmit} id="user_tool_form">
          <ModalHeader showCloseButton={!isMobile}>
            <ModalHeader.Title className="typo-title3">
              {isEditing ? 'Edit Tool' : 'Add Tool'}
            </ModalHeader.Title>
          </ModalHeader>
          <Modal.Body className="flex flex-col gap-4">
            {/* Title with autocomplete */}
            <div className="relative">
              <TextField
                {...register('title')}
                autoComplete="off"
                autoFocus
                inputId="toolTitle"
                label="Tool name"
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

            {/* Category selector */}
            <div className="flex flex-col gap-2">
              <Typography bold type={TypographyType.Callout}>
                Category
              </Typography>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((opt) => (
                  <Button
                    key={opt}
                    type="button"
                    variant={
                      category === opt
                        ? ButtonVariant.Primary
                        : ButtonVariant.Float
                    }
                    onClick={() => {
                      setValue('category', opt);
                      setValue('customCategory', '');
                    }}
                  >
                    {opt}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant={
                    isCustomCategory
                      ? ButtonVariant.Primary
                      : ButtonVariant.Float
                  }
                  onClick={() => setValue('category', 'custom')}
                >
                  Custom
                </Button>
              </div>
              {isCustomCategory && (
                <TextField
                  {...register('customCategory')}
                  autoComplete="off"
                  inputId="customCategory"
                  label="Custom category name"
                  maxLength={100}
                  valid={!errors.customCategory}
                  hint={errors.customCategory?.message}
                />
              )}
            </div>

            {!isMobile && (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                loading={isSubmitting}
                variant={ButtonVariant.Primary}
              >
                {isEditing ? 'Save changes' : 'Add tool'}
              </Button>
            )}
          </Modal.Body>
        </form>
      </Modal>
    </FormProvider>
  );
}
