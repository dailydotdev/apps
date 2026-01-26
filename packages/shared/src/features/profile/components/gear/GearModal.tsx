import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ModalProps } from '../../../../components/modals/common/Modal';
import { Modal } from '../../../../components/modals/common/Modal';
import { TextField } from '../../../../components/fields/TextField';
import { Button, ButtonVariant } from '../../../../components/buttons/Button';
import { ModalHeader } from '../../../../components/modals/common/ModalHeader';
import { useViewSize, ViewSize } from '../../../../hooks';
import type { AddGearInput, DatasetGear } from '../../../../graphql/user/gear';
import { useGearSearch } from '../../hooks/useGearSearch';

const gearFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
});

type GearFormData = z.infer<typeof gearFormSchema>;

type GearModalProps = Omit<ModalProps, 'children'> & {
  onSubmit: (input: AddGearInput) => Promise<void>;
};

export function GearModal({ onSubmit, ...rest }: GearModalProps): ReactElement {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const isMobile = useViewSize(ViewSize.MobileL);

  const methods = useForm<GearFormData>({
    resolver: zodResolver(gearFormSchema),
    defaultValues: {
      name: '',
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = methods;

  const name = watch('name');

  const { results: suggestions } = useGearSearch(name);

  const canSubmit = name.trim().length > 0;

  const handleSelectSuggestion = (suggestion: DatasetGear) => {
    setValue('name', suggestion.name);
    setShowSuggestions(false);
  };

  const onFormSubmit = handleSubmit(async (data) => {
    await onSubmit({
      name: data.name.trim(),
    });
    rest.onRequestClose?.(null);
  });

  const filteredSuggestions = useMemo(() => {
    if (!showSuggestions || name.length < 1) {
      return [];
    }
    return suggestions;
  }, [suggestions, showSuggestions, name]);

  return (
    <FormProvider {...methods}>
      <Modal kind={Modal.Kind.FlexibleCenter} size={Modal.Size.Small} {...rest}>
        <form onSubmit={onFormSubmit} id="gear_form" className="w-full">
          <ModalHeader showCloseButton={!isMobile}>
            <ModalHeader.Title className="typo-title3">
              Add Gear
            </ModalHeader.Title>
          </ModalHeader>
          <Modal.Body className="flex flex-1 flex-col gap-4">
            {/* Name with autocomplete */}
            <div className="relative">
              <TextField
                {...register('name')}
                autoComplete="off"
                autoFocus
                inputId="gearName"
                label="Gear name"
                maxLength={255}
                valid={!errors.name}
                hint={errors.name?.message}
                onChange={(e) => {
                  setValue('name', e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  setShowSuggestions(true);
                }}
              />
              {filteredSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-1 mt-1 max-h-48 overflow-auto rounded-12 border border-border-subtlest-tertiary bg-background-default shadow-2">
                  {filteredSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-surface-hover"
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      <span className="typo-callout">{suggestion.name}</span>
                    </button>
                  ))}
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
                Add gear
              </Button>
            )}
          </Modal.Body>
        </form>
      </Modal>
    </FormProvider>
  );
}
