import type { DragEvent, ReactElement } from 'react';
import React, { useRef } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { Loader } from '../../../components/Loader';
import CloseButton from '../../../components/CloseButton';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { UploadIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useFileInput } from '../../../hooks/utils/useFileInput';
import { ACCEPTED_TYPES, acceptedTypesList } from '../../../graphql/posts';

const SIZE_LIMIT_MB = 5;

interface GivebackScreenshotFieldProps {
  inputId: string;
  // Base64 of the picked file, shown immediately while the upload runs.
  previewSrc?: string;
  isUploading: boolean;
  onSelect: (base64: string, file: File) => void;
  onClear: () => void;
}

// Proof screenshot picker: a dashed drop zone when empty, a contained preview
// with a remove control once a file is chosen, and an "uploading" overlay while
// it transfers. Click or drag-and-drop to pick.
export const GivebackScreenshotField = ({
  inputId,
  previewSrc,
  isUploading,
  onSelect,
  onClear,
}: GivebackScreenshotFieldProps): ReactElement => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { onFileChange } = useFileInput({
    acceptedTypes: acceptedTypesList,
    limitMb: SIZE_LIMIT_MB,
    onChange: onSelect,
  });

  const openPicker = () => inputRef.current?.click();

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onFileChange(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="relative">
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={(event) => onFileChange(event.target.files?.[0])}
      />

      {previewSrc ? (
        <div className="relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float">
          <img
            src={previewSrc}
            alt="Screenshot preview"
            className="max-h-56 w-full object-contain"
          />
          {isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-overlay-primary-pepper">
              <Loader />
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Primary}
              >
                Uploading…
              </Typography>
            </div>
          ) : (
            <CloseButton
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              className="absolute right-2 top-2 z-1 !shadow-2"
              title="Remove screenshot"
              onClick={onClear}
            />
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
          className="group flex w-full flex-col items-center justify-center gap-2 rounded-16 border border-dashed border-border-subtlest-secondary bg-surface-float px-4 py-8 text-center transition-colors hover:border-accent-cabbage-default hover:bg-surface-hover"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-surface-hover text-text-secondary transition-colors group-hover:text-accent-cabbage-default">
            <UploadIcon size={IconSize.Small} />
          </span>
          <Typography type={TypographyType.Callout} bold>
            Upload a screenshot
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            PNG, JPG or WebP · up to {SIZE_LIMIT_MB} MB
          </Typography>
        </button>
      )}
    </div>
  );
};
