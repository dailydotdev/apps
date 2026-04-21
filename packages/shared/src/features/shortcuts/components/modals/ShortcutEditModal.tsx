import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import classNames from 'classnames';
import {
  Button,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import ControlledTextField from '../../../../components/fields/ControlledTextField';
import ImageInput from '../../../../components/fields/ImageInput';
import type { ModalProps } from '../../../../components/modals/common/Modal';
import { Modal } from '../../../../components/modals/common/Modal';
import { Justify } from '../../../../components/utilities';
import { useShortcutsManager } from '../../hooks/useShortcutsManager';
import { ShortcutTile } from '../ShortcutTile';
import type { Shortcut, ShortcutColor } from '../../types';
import { shortcutColorPalette } from '../../types';
import { isValidHttpUrl, withHttps } from '../../../../lib/links';
import { CameraIcon } from '../../../../components/icons';
import {
  imageSizeLimitMB,
  uploadContentImage,
} from '../../../../graphql/posts';
import { useToastNotification } from '../../../../hooks/useToastNotification';

const schema = z.object({
  name: z
    .string()
    .max(40, 'Name must be 40 characters or less')
    .optional()
    .or(z.literal('')),
  url: z
    .string()
    .min(1, 'URL is required')
    .refine(
      (value) => isValidHttpUrl(withHttps(value)),
      'Must be a valid HTTP/S URL',
    ),
  iconUrl: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value ||
        value.startsWith('data:image/') ||
        isValidHttpUrl(withHttps(value)),
      'Must be a valid URL',
    ),
  color: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type ShortcutEditModalProps = ModalProps & {
  mode: 'add' | 'edit';
  shortcut?: Shortcut;
  onSubmitted?: () => void;
};

const colorSwatchClass: Record<ShortcutColor, string> = {
  burger: 'bg-accent-burger-bolder',
  cheese: 'bg-accent-cheese-bolder',
  avocado: 'bg-accent-avocado-bolder',
  bacon: 'bg-accent-bacon-bolder',
  blueCheese: 'bg-accent-blueCheese-bolder',
  cabbage: 'bg-accent-cabbage-bolder',
};

const colorLabel: Record<ShortcutColor, string> = {
  burger: 'Burger',
  cheese: 'Cheese',
  avocado: 'Avocado',
  bacon: 'Bacon',
  blueCheese: 'Blue cheese',
  cabbage: 'Cabbage',
};

export default function ShortcutEditModal({
  mode,
  shortcut,
  onSubmitted,
  ...props
}: ShortcutEditModalProps): ReactElement {
  const manager = useShortcutsManager();
  const { displayToast } = useToastNotification();
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: shortcut?.name ?? '',
      url: shortcut?.url ?? '',
      iconUrl: shortcut?.iconUrl ?? '',
      color: shortcut?.color ?? '',
    },
    mode: 'onBlur',
  });

  const {
    handleSubmit,
    watch,
    setError,
    clearErrors,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const handleIconUpload = async (base64: string | null, file?: File) => {
    if (!file || !base64) {
      clearErrors('iconUrl');
      setValue('iconUrl', '', { shouldDirty: true });
      return;
    }
    clearErrors('iconUrl');
    // Show the base64 preview immediately while the upload finishes.
    setValue('iconUrl', base64, { shouldDirty: true });
    setIsUploading(true);
    try {
      const uploadedUrl = await uploadContentImage(file);
      setValue('iconUrl', uploadedUrl, { shouldDirty: true });
    } catch (error) {
      const message =
        (error as Error)?.message ?? 'Failed to upload the image';
      setError('iconUrl', { message });
      displayToast(message);
      setValue('iconUrl', shortcut?.iconUrl ?? '', { shouldDirty: true });
    } finally {
      setIsUploading(false);
    }
  };

  const values = watch();
  const previewShortcut = useMemo<Shortcut>(
    () => ({
      url: values.url || 'https://example.com',
      name: values.name || undefined,
      iconUrl: values.iconUrl || undefined,
      color: (values.color as ShortcutColor) || 'burger',
    }),
    [values.color, values.iconUrl, values.name, values.url],
  );

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      url: data.url,
      name: data.name || undefined,
      iconUrl: data.iconUrl || undefined,
      color: data.color || undefined,
    };

    const result =
      mode === 'add'
        ? await manager.addShortcut(payload)
        : await manager.updateShortcut(shortcut!.url, payload);

    if (result.error) {
      setError('url', { message: result.error });
      return;
    }

    onSubmitted?.();
    props.onRequestClose?.(undefined as never);
  });

  return (
    <Modal kind={Modal.Kind.FlexibleCenter} size={Modal.Size.Small} {...props}>
      <Modal.Header>
        <Modal.Title>
          {mode === 'add' ? 'Add shortcut' : 'Edit shortcut'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormProvider {...methods}>
          <form id="shortcut-edit-form" onSubmit={onSubmit}>
            <div className="relative mb-6 flex justify-center overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float py-6">
              <div className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full bg-accent-cabbage-default/10 blur-3xl" />
              <div className="pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-accent-onion-default/10 blur-3xl" />
              <ShortcutTile shortcut={previewShortcut} draggable={false} />
            </div>

            <div className="flex flex-col gap-4">
              <ControlledTextField
                name="name"
                label="Name (optional)"
                placeholder="My shortcut"
                hint="Max 40 characters"
              />
              <ControlledTextField
                name="url"
                label="URL"
                placeholder="https://example.com"
              />
              <div>
                <span className="mb-2 block text-text-tertiary typo-caption1">
                  Custom icon (optional)
                </span>
                <div className="flex items-center gap-4">
                  <ImageInput
                    initialValue={values.iconUrl || null}
                    fallbackImage={null}
                    closeable
                    size="medium"
                    fileSizeLimitMB={imageSizeLimitMB}
                    onChange={handleIconUpload}
                    hoverIcon={<CameraIcon secondary />}
                    className={{
                      container: classNames(
                        'rounded-14 border-border-subtlest-tertiary bg-surface-float',
                        isUploading && 'opacity-60',
                      ),
                    }}
                  >
                    <CameraIcon
                      className="text-text-tertiary"
                      secondary
                    />
                  </ImageInput>
                  <div className="flex flex-col gap-1 text-text-tertiary typo-caption1">
                    <span>
                      Upload an image or drag & drop. Leave empty to use the
                      site favicon.
                    </span>
                    {isUploading && (
                      <span className="text-accent-cabbage-default">
                        Uploading…
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUrlInput((prev) => !prev)}
                  className="mt-3 text-text-tertiary underline typo-caption1 hover:text-text-primary"
                >
                  {showUrlInput
                    ? 'Hide icon URL'
                    : 'Or paste an image URL instead'}
                </button>
                {showUrlInput && (
                  <div className="mt-2">
                    <ControlledTextField
                      name="iconUrl"
                      label=""
                      placeholder="https://example.com/icon.png"
                    />
                  </div>
                )}
              </div>
              <div>
                <span className="mb-2 block text-text-tertiary typo-caption1">
                  Accent color (used when no favicon is available)
                </span>
                <div
                  role="radiogroup"
                  aria-label="Accent color"
                  className="flex flex-wrap gap-3"
                >
                  {shortcutColorPalette.map((color: ShortcutColor) => {
                    const checked = values.color === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        aria-label={colorLabel[color]}
                        title={colorLabel[color]}
                        role="radio"
                        aria-checked={checked}
                        onClick={() =>
                          methods.setValue('color', color, {
                            shouldDirty: true,
                          })
                        }
                        className={classNames(
                          'size-8 rounded-full transition-all duration-150 ease-out motion-reduce:transition-none',
                          colorSwatchClass[color],
                          checked
                            ? 'scale-110 ring-2 ring-border-subtlest-primary ring-offset-2 ring-offset-background-default'
                            : 'opacity-80 hover:scale-105 hover:opacity-100 motion-reduce:hover:scale-100',
                        )}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </form>
        </FormProvider>
      </Modal.Body>
      <Modal.Footer justify={Justify.End}>
        <Button
          type="button"
          variant={ButtonVariant.Float}
          onClick={() => props.onRequestClose?.(undefined as never)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="shortcut-edit-form"
          variant={ButtonVariant.Primary}
          disabled={isSubmitting || isUploading}
        >
          {mode === 'add' ? 'Add' : 'Save'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
