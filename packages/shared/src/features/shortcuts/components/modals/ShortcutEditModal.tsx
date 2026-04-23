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
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { apiUrl } from '../../../../lib/config';
import { invokeOnRequestClose } from './closeModal';

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
  const { closeModal } = useLazyModal();
  const close = () => {
    closeModal();
    invokeOnRequestClose(props.onRequestClose);
  };
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
  const [customIconFailed, setCustomIconFailed] = useState(false);
  // Drop-on-avatar: users who have a favicon.ico / logo sitting on disk
  // should be able to fling it onto the icon picker without clicking
  // through a file dialog. Mirrors the AddShortcutTile drop affordance.
  const [isDropTarget, setIsDropTarget] = useState(false);
  // Debounced copy of the URL used solely for the live favicon preview.
  // Typing 15 characters shouldn't fire 15 requests to the icon proxy —
  // 250ms idle matches the "I stopped typing" feel of most address bars.
  const [debouncedUrl, setDebouncedUrl] = useState<string>(shortcut?.url ?? '');

  const handleIconBase64 = async (base64: string, file: File) => {
    clearErrors('iconUrl');
    // Show the base64 preview immediately while the upload finishes.
    setValue('iconUrl', base64, { shouldDirty: true });
    setIsUploading(true);
    try {
      const uploadedUrl = await uploadContentImage(file);
      setValue('iconUrl', uploadedUrl, { shouldDirty: true });
    } catch (error) {
      const message = (error as Error)?.message ?? 'Failed to upload the image';
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
    const handle = setTimeout(() => {
      setDebouncedUrl(values.url ?? '');
    }, 250);
    return () => clearTimeout(handle);
  }, [values.url]);

  // Same deal for the custom icon: if the user pastes a new URL, give it a
  // fresh chance to load instead of keeping the broken-image state.
  useEffect(() => {
    setCustomIconFailed(false);
  }, [values.iconUrl]);

  // Decide what to render inside the icon avatar:
  // 1. A valid custom icon (uploaded, base64 preview, or pasted URL that
  //    actually loads). If the user pasted a broken URL we fall through to
  //    the favicon instead of showing a broken-image glyph.
  // 2. Otherwise the site's favicon, derived from the URL as the user types.
  // 3. If neither is available, fall back to a neutral Earth glyph so the
  //    control still looks like "a picker", not an empty circle.
  const hasCustomIcon = !!values.iconUrl && !customIconFailed;
  const urlCandidate = debouncedUrl ? withHttps(debouncedUrl) : '';
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

  // File drop onto the avatar: we only accept a single image file. Multiple
  // files or non-images are silently ignored — the user barely interacted,
  // we shouldn't punish them with a modal error. The visual ring handles
  // the feedback loop (green-ish while hovering a valid file, cleared on
  // leave/drop).
  const handleAvatarDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer.types.includes('Files')) {
      setIsDropTarget(true);
    }
  };
  const handleAvatarDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    // Assigning to `dropEffect` is the standard HTML5 DnD pattern — the
    // drop cursor is only configurable through the event's dataTransfer.
    // eslint-disable-next-line no-param-reassign
    event.dataTransfer.dropEffect = 'copy';
  };
  const handleAvatarDragLeave = () => setIsDropTarget(false);
  const handleAvatarDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDropTarget(false);
    const file = Array.from(event.dataTransfer.files || []).find((candidate) =>
      candidate.type.startsWith('image/'),
    );
    if (!file) {
      return;
    }
    onFileChange(file);
  };

  // Live character counter for the name field. Swaps from muted to warning
  // tone as we close in on the 40-char cap, so users feel the limit before
  // they hit it.
  const nameValue = values.name ?? '';
  const nameLen = nameValue.length;
  const nameNearCap = nameLen >= 32;
  const nameHint = nameLen
    ? `${nameLen} / 40 characters`
    : 'Up to 40 characters';

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      url: data.url,
      name: data.name || undefined,
      iconUrl: data.iconUrl || undefined,
    };

    try {
      const result =
        mode === 'add'
          ? await manager.addShortcut(payload)
          : await manager.updateShortcut(shortcut!.url, payload);

      if (result.error) {
        setError('url', { message: result.error });
        return;
      }
    } catch {
      // The write is optimistic — local state already reflects the change.
      // If the remote mutation rejects, SettingsContext rolls it back and will
      // toast its own error. We still close here so the user isn't trapped.
    }

    onSubmitted?.();
    close();
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
                derived from the URL fills it by default; uploading (or
                dropping an image onto the avatar) swaps it out. */}
            <div className="mb-5 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={openFilePicker}
                onDragEnter={handleAvatarDragEnter}
                onDragOver={handleAvatarDragOver}
                onDragLeave={handleAvatarDragLeave}
                onDrop={handleAvatarDrop}
                aria-label={
                  hasCustomIcon
                    ? 'Replace shortcut icon'
                    : 'Upload shortcut icon'
                }
                className={classNames(
                  'group relative flex size-16 items-center justify-center overflow-hidden rounded-16 border bg-surface-float transition-all duration-150 hover:-translate-y-px hover:bg-surface-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default focus-visible:ring-offset-2 focus-visible:ring-offset-background-default motion-reduce:transition-none motion-reduce:hover:transform-none',
                  isDropTarget
                    ? 'ring-accent-cabbage-default/30 border-accent-cabbage-default bg-overlay-float-cabbage ring-2'
                    : 'border-border-subtlest-tertiary hover:border-border-subtlest-secondary',
                  isUploading && 'opacity-60',
                )}
              >
                {/* eslint-disable-next-line no-nested-ternary */}
                {hasCustomIcon ? (
                  <img
                    src={values.iconUrl}
                    alt=""
                    onError={() => setCustomIconFailed(true)}
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
                  <EarthIcon secondary className="size-6 text-text-tertiary" />
                )}
                {/* Upload ring: a spinning cabbage arc that feels like real
                    progress rather than just "something dimmed". Covers the
                    icon while the asset is being posted to the server. */}
                {isUploading && (
                  <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center bg-overlay-primary-pepper"
                  >
                    <span className="size-8 animate-spin rounded-full border-[3px] border-border-subtlest-tertiary border-t-accent-cabbage-default motion-reduce:animate-none" />
                  </span>
                )}
                {!isUploading && (
                  <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center bg-overlay-primary-pepper text-text-primary opacity-0 transition-opacity duration-150 group-hover:opacity-100 motion-reduce:transition-none"
                  >
                    <CameraIcon secondary />
                  </span>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  onFileChange(event.target.files?.[0] ?? null);
                  // Reset the input so picking the same file again still
                  // fires a change event.
                  // eslint-disable-next-line no-param-reassign
                  event.target.value = '';
                }}
              />
              {/* All icon-related affordances live with the avatar:
                  upload status, remove, and the "paste URL" escape hatch.
                  Keeping them together means a user scanning the form
                  doesn't have to hunt around for icon controls. */}
              <div
                aria-live="polite"
                className="flex min-h-[18px] flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-center text-text-tertiary typo-caption1"
              >
                {/* eslint-disable-next-line no-nested-ternary */}
                {isUploading ? (
                  <span className="inline-flex items-center gap-2 text-accent-cabbage-default">
                    <span className="size-1.5 animate-pulse rounded-full bg-accent-cabbage-default" />
                    Uploading…
                  </span>
                ) : isDropTarget ? (
                  <span className="text-accent-cabbage-default">
                    Drop to use this image
                  </span>
                ) : (
                  <>
                    {/* eslint-disable-next-line no-nested-ternary */}
                    {hasCustomIcon ? (
                      <button
                        type="button"
                        onClick={clearCustomIcon}
                        className="underline-offset-2 hover:text-text-primary hover:underline"
                      >
                        Remove custom icon
                      </button>
                    ) : customIconFailed ? (
                      <span className="text-status-error">
                        Couldn&apos;t load that image. Showing favicon instead.
                      </span>
                    ) : (
                      <span>
                        {faviconSrc
                          ? 'Tap or drop to upload'
                          : 'Tap or drop an image to upload'}
                      </span>
                    )}
                    <span aria-hidden className="text-text-quaternary">
                      ·
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput((prev) => !prev)}
                      className="underline-offset-2 hover:text-text-primary hover:underline"
                    >
                      {showUrlInput ? 'Hide icon URL' : 'Paste image URL'}
                    </button>
                  </>
                )}
              </div>
              {showUrlInput && (
                <div className="mt-2 w-full">
                  <ControlledTextField
                    name="iconUrl"
                    label="Icon URL"
                    placeholder="https://example.com/icon.png"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <ControlledTextField
                  name="name"
                  label="Name (optional)"
                  placeholder="My shortcut"
                />
                <div
                  className={classNames(
                    'flex justify-end px-1 text-right tabular-nums transition-colors duration-150 typo-caption1 motion-reduce:transition-none',
                    nameNearCap
                      ? 'text-accent-cabbage-default'
                      : 'text-text-tertiary',
                  )}
                  aria-live="polite"
                >
                  {nameHint}
                </div>
              </div>
              <ControlledTextField
                name="url"
                label="URL"
                placeholder="https://example.com"
              />
            </div>
          </form>
        </FormProvider>
      </Modal.Body>
      <Modal.Footer justify={Justify.End}>
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          onClick={close}
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
