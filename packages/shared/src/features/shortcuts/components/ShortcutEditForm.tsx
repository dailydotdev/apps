import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import classNames from 'classnames';
import ControlledTextField from '../../../components/fields/ControlledTextField';
import { useShortcutsManager } from '../hooks/useShortcutsManager';
import type { Shortcut } from '../types';
import { isValidHttpUrl, withHttps } from '../../../lib/links';
import { CameraIcon, EarthIcon } from '../../../components/icons';
import { apiUrl } from '../../../lib/config';
import {
  allowedContentImage,
  imageSizeLimitMB,
  uploadContentImage,
} from '../../../graphql/posts';
import { useFileInput } from '../../../hooks/utils/useFileInput';
import { useToastNotification } from '../../../hooks/useToastNotification';

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
      (value) => !value || isValidHttpUrl(withHttps(value)),
      'Must be a valid URL',
    ),
});

type FormValues = z.infer<typeof schema>;

export type ShortcutEditFormState = {
  isSubmitting: boolean;
  isUploading: boolean;
};

export type ShortcutEditFormProps = {
  mode: 'add' | 'edit';
  shortcut?: Shortcut;
  formId?: string;
  onDone: () => void;
  onStateChange?: (state: ShortcutEditFormState) => void;
};

// Reused by both `ShortcutEditModal` (standalone) and `ShortcutsManageModal`
// (inline). The parent owns the action buttons and binds them to this form
// via `formId` + `onStateChange` — the modal places them in `Modal.Footer`,
// the inline version renders them below the form.
export function ShortcutEditForm({
  mode,
  shortcut,
  formId = 'shortcut-edit-form',
  onDone,
  onStateChange,
}: ShortcutEditFormProps): ReactElement {
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

  // Only notify the parent when either boolean actually flips, otherwise
  // every keystroke would re-invoke `onStateChange`.
  const lastReportedRef = useRef<ShortcutEditFormState | null>(null);
  useEffect(() => {
    const next = { isSubmitting, isUploading };
    const prev = lastReportedRef.current;
    if (
      prev &&
      prev.isSubmitting === next.isSubmitting &&
      prev.isUploading === next.isUploading
    ) {
      return;
    }
    lastReportedRef.current = next;
    onStateChange?.(next);
  }, [isSubmitting, isUploading, onStateChange]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [faviconFailed, setFaviconFailed] = useState(false);
  const [customIconFailed, setCustomIconFailed] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);
  // 250ms debounce on favicon requests while the user is typing.
  const [debouncedUrl, setDebouncedUrl] = useState<string>(shortcut?.url ?? '');

  const handleIconBase64 = async (base64: string, file: File) => {
    clearErrors('iconUrl');
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
    acceptedTypes: allowedContentImage,
    onChange: handleIconBase64,
  });

  const values = watch();

  useEffect(() => {
    setFaviconFailed(false);
    const handle = setTimeout(() => {
      setDebouncedUrl(values.url ?? '');
    }, 250);
    return () => clearTimeout(handle);
  }, [values.url]);

  useEffect(() => {
    setCustomIconFailed(false);
  }, [values.iconUrl]);

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

  const handleAvatarDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer.types.includes('Files')) {
      setIsDropTarget(true);
    }
  };

  const handleAvatarDragOver = (event: React.DragEvent) => {
    event.preventDefault();
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
      // If the remote mutation rejects, SettingsContext rolls it back and
      // will toast its own error. We still finish here so the user isn't
      // trapped.
    }

    onDone();
  });

  return (
    <FormProvider {...methods}>
      <form id={formId} onSubmit={onSubmit}>
        <div className="mb-5 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={openFilePicker}
            onDragEnter={handleAvatarDragEnter}
            onDragOver={handleAvatarDragOver}
            onDragLeave={handleAvatarDragLeave}
            onDrop={handleAvatarDrop}
            aria-label={
              hasCustomIcon ? 'Replace shortcut icon' : 'Upload shortcut icon'
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
            {isUploading && (
              <span
                aria-hidden
                className="absolute inset-0 flex items-center justify-center bg-overlay-primary-pepper"
              >
                <span className="size-8 animate-spin rounded-full border-[0.1875rem] border-border-subtlest-tertiary border-t-accent-cabbage-default motion-reduce:animate-none" />
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
            accept={allowedContentImage.join(',')}
            className="sr-only"
            onChange={(event) => {
              onFileChange(event.target.files?.[0] ?? null);
              // eslint-disable-next-line no-param-reassign
              event.target.value = '';
            }}
          />
          <div
            aria-live="polite"
            className="flex min-h-[1.125rem] flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-center text-text-tertiary typo-caption1"
          >
            {isUploading ? (
              <span className="inline-flex items-center gap-2 text-accent-cabbage-default">
                <span className="size-1.5 animate-pulse rounded-full bg-accent-cabbage-default" />
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
            ) : customIconFailed ? (
              <span className="text-status-error">
                Couldn&apos;t load that image. Showing favicon instead.
              </span>
            ) : isDropTarget ? (
              <span className="text-accent-cabbage-default">
                Drop to use this image
              </span>
            ) : (
              <>
                <span>
                  {faviconSrc
                    ? 'Tap or drop to upload'
                    : 'Tap or drop an image to upload'}
                </span>
                <span aria-hidden className="text-text-quaternary">
                  ·
                </span>
                <button
                  type="button"
                  onClick={() => setShowUrlInput((prev) => !prev)}
                  className="underline-offset-2 hover:text-text-primary hover:underline"
                >
                  {showUrlInput ? 'Hide image URL' : 'Paste image URL'}
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
  );
}
