import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
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
  UserStack,
  AddUserStackInput,
  DatasetTool,
} from '../../../../graphql/user/userStack';
import { useStackSearch } from '../../hooks/useStackSearch';
import { PlusIcon } from '../../../../components/icons';
import YearSelect from '../../../../components/profile/YearSelect';
import MonthSelect from '../../../../components/profile/MonthSelect';

const SECTION_OPTIONS = ['Primary', 'Hobby', 'Learning', 'Past'] as const;

const userStackFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  section: z.string().min(1, 'Section is required').max(100),
  customSection: z.string().max(100).optional(),
  startedAtYear: z.string().optional(),
  startedAtMonth: z.string().optional(),
});

type UserStackFormData = z.infer<typeof userStackFormSchema>;

type UserStackModalProps = Omit<ModalProps, 'children'> & {
  onSubmit: (input: AddUserStackInput) => Promise<void>;
  existingItem?: UserStack;
};

export function UserStackModal({
  onSubmit,
  existingItem,
  ...rest
}: UserStackModalProps): ReactElement {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const isMobile = useViewSize(ViewSize.MobileL);
  const isEditing = !!existingItem;

  const methods = useForm<UserStackFormData>({
    resolver: zodResolver(userStackFormSchema),
    defaultValues: {
      title: existingItem?.title ?? existingItem?.tool.title ?? '',
      section: existingItem?.section || 'Primary',
      customSection: '',
      startedAtYear: existingItem?.startedAt
        ? new Date(existingItem.startedAt).getUTCFullYear().toString()
        : '',
      startedAtMonth: existingItem?.startedAt
        ? new Date(existingItem.startedAt).getUTCMonth().toString()
        : '',
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = methods;

  const title = watch('title');
  const section = watch('section');
  const customSection = watch('customSection');
  const startedAtYear = watch('startedAtYear');

  const { results: suggestions } = useStackSearch(title);

  const isCustomSection = !SECTION_OPTIONS.includes(
    section as (typeof SECTION_OPTIONS)[number],
  );
  const finalSection = isCustomSection ? customSection || section : section;
  const canSubmit = title.trim().length > 0 && finalSection.trim().length > 0;

  const handleSelectSuggestion = (suggestion: DatasetTool) => {
    setValue('title', suggestion.title);
    setShowSuggestions(false);
  };

  const onFormSubmit = handleSubmit(async (data) => {
    let startedAtValue: string | undefined;
    if (data.startedAtYear) {
      const year = parseInt(data.startedAtYear, 10);
      const month = data.startedAtMonth ? parseInt(data.startedAtMonth, 10) : 0;
      const date = new Date(Date.UTC(year, month, 1, 12, 0, 0, 0));
      startedAtValue = date.toISOString();
    }

    const effectiveSection = isCustomSection
      ? data.customSection || data.section
      : data.section;

    await onSubmit({
      title: data.title.trim(),
      section: effectiveSection.trim(),
      startedAt: startedAtValue,
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
          form: 'user_stack_form',
          title: (
            <div className="px-4">
              <ModalHeader.Title className="typo-title3">
                {isEditing ? 'Edit stack/tool' : 'Add stack/tool'}
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
        <form onSubmit={onFormSubmit} id="user_stack_form">
          <ModalHeader showCloseButton={!isMobile}>
            <ModalHeader.Title className="typo-title3">
              {isEditing ? 'Edit stack/tool' : 'Add stack/tool'}
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
                label="Technology, tool, or skill"
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

            {/* Section selector */}
            <div className="flex flex-col gap-2">
              <Typography bold type={TypographyType.Callout}>
                Section
              </Typography>
              <div className="flex flex-wrap gap-2">
                {SECTION_OPTIONS.map((opt) => (
                  <Button
                    key={opt}
                    type="button"
                    variant={
                      section === opt
                        ? ButtonVariant.Primary
                        : ButtonVariant.Float
                    }
                    onClick={() => {
                      setValue('section', opt);
                      setValue('customSection', '');
                    }}
                  >
                    {opt}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant={
                    isCustomSection
                      ? ButtonVariant.Primary
                      : ButtonVariant.Float
                  }
                  onClick={() => setValue('section', 'custom')}
                >
                  Custom
                </Button>
              </div>
              {isCustomSection && (
                <TextField
                  {...register('customSection')}
                  autoComplete="off"
                  inputId="customSection"
                  label="Custom section name"
                  maxLength={100}
                  valid={!errors.customSection}
                  hint={errors.customSection?.message}
                />
              )}
            </div>

            {/* Started at - separate year and month */}
            <div className="flex flex-col gap-2">
              <Typography bold type={TypographyType.Callout}>
                Using since (optional)
              </Typography>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Controller
                    name="startedAtYear"
                    control={control}
                    render={({ field }) => (
                      <YearSelect
                        placeholder="Year"
                        value={field.value}
                        onSelect={field.onChange}
                      />
                    )}
                  />
                </div>
                <div className="flex-1">
                  <Controller
                    name="startedAtMonth"
                    control={control}
                    render={({ field }) => (
                      <MonthSelect
                        placeholder="Month"
                        value={field.value}
                        onSelect={field.onChange}
                        disabled={!startedAtYear}
                      />
                    )}
                  />
                </div>
              </div>
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
