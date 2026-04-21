import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import ControlledTextField from '../../../../components/fields/ControlledTextField';
import type { ModalProps } from '../../../../components/modals/common/Modal';
import { Modal } from '../../../../components/modals/common/Modal';
import { Justify } from '../../../../components/utilities';
import { useShortcutsManager } from '../../hooks/useShortcutsManager';
import type { Shortcut } from '../../types';
import { isValidHttpUrl, withHttps } from '../../../../lib/links';
import { CameraIcon, EarthIcon } from '../../../../components/icons';
import {
  imageSizeLimitMB,
  uploadContentImage,
} from '../../../../graphql/posts';
import { useFileInput } from '../../../../hooks/utils/useFileInput';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import { apiUrl } from '../../../../lib/config';

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
});

type FormValues = z.infer<typeof schema>;

type ShortcutEditModalProps = ModalProps & {
  mode: 'add' | 'edit';
  shortcut?: Shortcut;
  onSubmitted?: () => void;
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [faviconFailed, setFaviconFailed] = useState(false);

  const handleIconBase64 = async (base64: string, file: File) => {
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

  const { onFileChange } = useFileInput({
    limitMb: imageSizeLimitMB,
    onChange: handleIconBase64,
  });

  const values = watch();

  // Reset the favicon-failed flag whenever the user edits the URL, so typing
  // past a transiently-broken state recovers and shows the new favicon.
  useEffect(() => {
    setFaviconFailed(false);
  }, [values.url]);

  // Decide what to render inside the icon avatar:
  // 1. A custom icon (uploaded, base64 preview, or pasted URL) — takes priority.
  // 2. Otherwise the site's favicon, derived from the URL as the user types.
  // 3. If neither is available, fall back to a neutral Earth glyph so the
  //    control still looks like "a picker", not an empty circle.
  const hasCustomIcon = !!values.iconUrl;
  const urlCandidate = values.url ? withHttps(values.url) : '';
  const canShowFavicon =
    !hasCustomIcon && !faviconFailed && isValidHttpUrl(urlCandidate);
  const faviconSrc = canShowFavicon
    ? `${apiUrl}/icon?url=${encodeURIComponent(urlCandidate)}&size=96`
    : null;

  const openFilePicker = () => fileInputRef.current?.click();
  const clearCustomIcon = () => {
    clearErrors('iconUrl');
    setValue('iconUrl', '', { shouldDirty: true });
  };

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      url: data.url,
      name: data.name || undefined,
      iconUrl: data.iconUrl || undefined,
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
      {/* Title uses the same Body+bold rhythm as the Manage modal so the two
          surfaces feel like siblings, not different products. */}
      <Modal.Header showCloseButton>
        <Typography tag={TypographyTag.H3} type={TypographyType.Body} bold>
          {mode === 'add' ? 'Add shortcut' : 'Edit shortcut'}
        </Typography>
      </Modal.Header>
      <Modal.Body>
        <FormProvider {...methods}>
          <form id="shortcut-edit-form" onSubmit={onSubmit}>
            {/* Icon-first: a single tappable avatar at the top. The favicon
                derived from the URL fills it by default; uploading swaps it
                out. */}
            <div className="mb-5 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={openFilePicker}
                aria-label={
                  hasCustomIcon ? 'Replace shortcut icon' : 'Upload shortcut icon'
                }
                className={classNames(
                  'group relative flex size-16 items-center justify-center overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float transition-colors duration-150 hover:border-border-subtlest-secondary hover:bg-surface-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default focus-visible:ring-offset-2 focus-visible:ring-offset-background-default motion-reduce:transition-none',
                  isUploading && 'opacity-60',
                )}
              >
                {hasCustomIcon ? (
                  <img
                    src={values.iconUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : faviconSrc ? (
                  <img
                    src={faviconSrc}
                    alt=""
                    onError={() => setFaviconFailed(true)}
                    className="size-8 rounded-6"
                  />
                ) : (
                  <EarthIcon
                    secondary
                    className="size-6 text-text-tertiary"
                  />
                )}
                <span
                  aria-hidden
                  className="absolute inset-0 flex items-center justify-center bg-overlay-primary-pepper text-text-primary opacity-0 transition-opacity duration-150 group-hover:opacity-100 motion-reduce:transition-none"
                >
                  <CameraIcon secondary />
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  onFileChange(event.target.files?.[0] ?? null);
                  event.target.value = '';
                }}
              />
              <div
                aria-live="polite"
                className="min-h-[18px] text-center text-text-tertiary typo-caption1"
              >
                {isUploading ? (
                  <span className="inline-flex items-center gap-2 text-text-tertiary">
                    <span className="size-1.5 animate-pulse rounded-full bg-text-tertiary" />
                    Uploading…
                  </span>
                ) : hasCustomIcon ? (
                  <button
                    type="button"
                    onClick={clearCustomIcon}
                    className="underline-offset-2 hover:text-text-primary hover:underline"
                  >
                    Remove custom icon
                  </button>
                ) : (
                  <span>
                    {faviconSrc ? 'Tap to upload your own' : 'Tap to upload'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <ControlledTextField
                name="url"
                label="URL"
                placeholder="https://example.com"
              />
              <ControlledTextField
                name="name"
                label="Name (optional)"
                placeholder="My shortcut"
                hint="Max 40 characters"
              />
              <button
                type="button"
                onClick={() => setShowUrlInput((prev) => !prev)}
                className="self-start text-text-tertiary underline-offset-2 typo-caption1 hover:text-text-primary hover:underline"
              >
                {showUrlInput
                  ? 'Hide icon URL'
                  : 'Or paste an image URL instead'}
              </button>
              {showUrlInput && (
                <ControlledTextField
                  name="iconUrl"
                  label="Icon URL"
                  placeholder="https://example.com/icon.png"
                />
              )}
            </div>
          </form>
        </FormProvider>
      </Modal.Body>
      <Modal.Footer justify={Justify.End}>
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          onClick={() => props.onRequestClose?.(undefined as never)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="shortcut-edit-form"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          disabled={isSubmitting || isUploading}
        >
          {mode === 'add' ? 'Add' : 'Save'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
