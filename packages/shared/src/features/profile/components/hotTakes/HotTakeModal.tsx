import type { ReactElement } from 'react';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import dynamic from 'next/dynamic';
import type { ModalProps } from '../../../../components/modals/common/Modal';
import { Modal } from '../../../../components/modals/common/Modal';
import { TextField } from '../../../../components/fields/TextField';
import { Button, ButtonVariant } from '../../../../components/buttons/Button';
import { ModalHeader } from '../../../../components/modals/common/ModalHeader';
import { useViewSize, ViewSize } from '../../../../hooks';
import type {
  UserHotTake,
  AddUserHotTakeInput,
} from '../../../../graphql/user/userHotTake';

const EmojiPicker = dynamic(
  () =>
    import('../../../../components/fields/EmojiPicker').then(
      (mod) => mod.EmojiPicker,
    ),
  { ssr: false },
);

const hotTakeFormSchema = z.object({
  emoji: z.string().min(1, 'Emoji is required').max(50),
  title: z.string().min(1, 'Title is required').max(255),
  subtitle: z.string().max(500).optional(),
});

type HotTakeFormData = z.infer<typeof hotTakeFormSchema>;

type HotTakeModalProps = Omit<ModalProps, 'children'> & {
  onSubmit: (input: AddUserHotTakeInput) => Promise<void>;
  existingItem?: UserHotTake;
};

export function HotTakeModal({
  onSubmit,
  existingItem,
  ...rest
}: HotTakeModalProps): ReactElement {
  const isMobile = useViewSize(ViewSize.MobileL);
  const isEditing = !!existingItem;

  const methods = useForm<HotTakeFormData>({
    resolver: zodResolver(hotTakeFormSchema),
    defaultValues: {
      emoji: existingItem?.emoji ?? '',
      title: existingItem?.title ?? '',
      subtitle: existingItem?.subtitle ?? '',
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = methods;

  const emoji = watch('emoji');
  const title = watch('title');
  const canSubmit = emoji.length > 0 && title.trim().length > 0;

  const onFormSubmit = handleSubmit(async (data) => {
    await onSubmit({
      emoji: data.emoji,
      title: data.title.trim(),
      subtitle: data.subtitle?.trim() || undefined,
    });
    rest.onRequestClose?.(null);
  });

  return (
    <FormProvider {...methods}>
      <Modal
        formProps={{
          form: 'hot_take_form',
          title: (
            <div className="px-4">
              <ModalHeader.Title className="typo-title3">
                {isEditing ? 'Edit Hot Take' : 'Add Hot Take'}
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
        size={Modal.Size.Medium}
        {...rest}
      >
        <form onSubmit={onFormSubmit} id="hot_take_form" className="w-full">
          <ModalHeader showCloseButton={!isMobile}>
            <ModalHeader.Title className="typo-title3">
              {isEditing ? 'Edit Hot Take' : 'Add Hot Take'}
            </ModalHeader.Title>
          </ModalHeader>
          <Modal.Body className="flex flex-col gap-4">
            <Controller
              name="emoji"
              control={control}
              render={({ field }) => (
                <EmojiPicker
                  value={field.value || ''}
                  onChange={field.onChange}
                  label="Emoji"
                />
              )}
            />
            {errors.emoji && (
              <span className="text-status-error typo-caption1">
                {errors.emoji.message}
              </span>
            )}

            <TextField
              {...register('title')}
              autoComplete="off"
              inputId="hotTakeTitle"
              label="Your hot take"
              placeholder="e.g., Tabs are better than spaces"
              maxLength={255}
              valid={!errors.title}
              hint={errors.title?.message}
            />

            <TextField
              {...register('subtitle')}
              autoComplete="off"
              inputId="hotTakeSubtitle"
              label="Subtitle (optional)"
              placeholder="Add some context..."
              maxLength={500}
              valid={!errors.subtitle}
              hint={errors.subtitle?.message}
            />

            {!isMobile && (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                loading={isSubmitting}
                variant={ButtonVariant.Primary}
              >
                {isEditing ? 'Save changes' : 'Add hot take'}
              </Button>
            )}
          </Modal.Body>
        </form>
      </Modal>
    </FormProvider>
  );
}
