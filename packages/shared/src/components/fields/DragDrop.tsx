import classNames from 'classnames';
import type { ReactElement, ReactNode, MutableRefObject } from 'react';
import React, { useState } from 'react';
import type { MutationStatus } from '@tanstack/react-query';
import { useToastNotification } from '../../hooks/useToastNotification';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { ChecklistAIcon, ClearIcon, DocsIcon } from '../icons';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { Loader } from '../Loader';
import { IconSize } from '../Icon';
import { useViewSize, ViewSize } from '../../hooks';
import { UploadIcon } from '../icons/Upload';
import type {
  DragDropError,
  DragDropValidation,
} from '../../features/fileUpload/hooks/useFileValidation';
import { useFileValidation } from '../../features/fileUpload/hooks/useFileValidation';
import { useFileInput } from '../../features/fileUpload/hooks/useFileInput';
import { useDragAndDrop } from '../../features/fileUpload/hooks/useDragAndDrop';

export interface DragDropProps {
  /** Callback when files are dropped/selected */
  onFilesDrop: (files: File[], errors?: DragDropError[]) => void;
  /** Validation rules */
  validation?: DragDropValidation;
  /** Custom error messages */
  errorMessages?: {
    size?: string;
    format?: string;
    count?: string;
    unknown?: string;
  };
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Custom className for the drop zone */
  className?: string;
  state?: MutationStatus;
  inputRef?: MutableRefObject<HTMLInputElement>;
  isCompactList?: boolean;
  ctaSize?: ButtonSize;
  renderCta?: (onBrowseFile: () => void) => ReactNode;
  isCopyBold?: boolean;
  dragDropDescription?: string;
  ctaLabelDesktop?: string;
  ctaLabelMobile?: string;
  uploadIcon?: ReactNode;
  showRemove?: boolean;
}

const getIcon = (state: MutationStatus) => {
  if (state === 'pending') {
    return <Loader />;
  }

  if (state === 'success') {
    return <ChecklistAIcon className="text-accent-avocado-default" />;
  }

  return null;
};

interface ItemProps {
  name: string;
  state: MutationStatus;
  uploadAt?: Date;
  className?: string;
  showRemove?: boolean;
  onRemove?: () => void;
}

const LargeItem = ({
  name,
  state,
  uploadAt,
  showRemove,
  onRemove,
}: ItemProps) => (
  <div className="flex w-full items-center gap-1">
    <DocsIcon secondary size={IconSize.Size48} />
    <div className="flex min-w-0 flex-1 flex-col">
      <Typography className="truncate" type={TypographyType.Subhead} bold>
        {name}
      </Typography>
      {uploadAt && (
        <Typography
          className="truncate"
          type={TypographyType.Caption2}
          color={TypographyColor.Tertiary}
          bold
        >
          {uploadAt.toDateString()}
        </Typography>
      )}
    </div>
    {getIcon(state)}
    {showRemove && (
      <Button
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.XSmall}
        onClick={onRemove}
        icon={<ClearIcon />}
      />
    )}
  </div>
);

const CompactItem = ({
  name,
  state,
  className,
  showRemove,
  onRemove,
}: ItemProps) => (
  <div className={classNames('flex w-full items-center gap-1', className)}>
    <DocsIcon secondary />
    <div className="min-w-0 flex-1 text-left">
      <Typography className="truncate" type={TypographyType.Footnote} bold>
        {name}
      </Typography>
    </div>
    {getIcon(state)}
    {showRemove && (
      <Button
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.XSmall}
        onClick={onRemove}
        icon={<ClearIcon />}
      />
    )}
  </div>
);

export const dragDropClasses =
  'relative flex flex-1 rounded-10 border border-dashed border-border-subtlest-secondary';

export function DragDrop({
  onFilesDrop,
  validation = {},
  errorMessages = {},
  disabled = false,
  className,
  state,
  inputRef,
  isCompactList,
  ctaSize,
  renderCta,
  isCopyBold,
  dragDropDescription = 'Drag & Drop your CV or',
  ctaLabelDesktop = 'Upload PDF',
  ctaLabelMobile = 'Upload PDF',
  uploadIcon,
  showRemove,
}: DragDropProps): ReactElement {
  const [filenames, setFilenames] = useState<string[]>([]);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { displayToast } = useToastNotification();
  const isError = state === 'error';

  const { validateFiles } = useFileValidation(validation, errorMessages);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const { validFiles, errors } = validateFiles(files);

    if (errors.length > 0) {
      const first = errors[0];
      const fileName = first.file ? ` (${first.file.name})` : '';
      displayToast(`${first.message}${fileName}`);
      return;
    }

    setFilenames(validFiles.map((f) => f.name));
    onFilesDrop(validFiles, errors.length > 0 ? errors : undefined);
  };

  const { input, openFileInput } = useFileInput({
    inputRef,
    onFiles: handleFiles,
    accept: validation.acceptedTypes,
    multiple: validation.multiple,
    disabled,
  });

  const {
    isDragOver,
    isDragValid,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useDragAndDrop({ disabled, onFiles: handleFiles });

  const removeFile = (name: string) => {
    const newFilenames = filenames.filter((n) => n !== name);
    setFilenames(newFilenames);
    if (newFilenames.length === 0) {
      onFilesDrop([], []);
    }
  };

  if (!isLaptop) {
    const isProcessed = !isError && filenames?.length;
    const cta = renderCta?.(openFileInput) ?? (
      <Button
        type="button"
        className={classNames('w-fit', className)}
        variant={ButtonVariant.Primary}
        onClick={openFileInput}
        icon={<UploadIcon />}
        size={ctaSize}
      >
        {ctaLabelMobile}
      </Button>
    );

    return (
      <div className="flex flex-row">
        {input}
        {isProcessed ? (
          <CompactItem
            name={filenames[0]}
            state={state}
            className={classNames(className, 'h-10')}
          />
        ) : (
          cta
        )}
      </div>
    );
  }

  const defaultIcon = <DocsIcon secondary />;

  const defaultContent = (
    <span className="flex flex-row items-center gap-2">
      <Typography
        className="flex flex-row items-center gap-2"
        type={TypographyType.Footnote}
        bold={isCopyBold}
      >
        {uploadIcon ?? defaultIcon}
        {dragDropDescription}
      </Typography>
      {renderCta?.(openFileInput) ?? (
        <Button
          className="text-text-primary"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Small}
          onClick={openFileInput}
          type="button"
        >
          {ctaLabelDesktop}
        </Button>
      )}
    </span>
  );

  const shouldShowContent = !filenames?.length || isError;

  const ListItem =
    isCompactList || state === 'pending' ? CompactItem : LargeItem;

  return (
    <div
      className={classNames(
        dragDropClasses,
        {
          'bg-surface-float': !isDragOver,
          'bg-surface-hover': isDragOver && isDragValid,
          'bg-surface-disabled cursor-not-allowed': disabled,
        },
        className,
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={classNames(
          'flex w-full items-center justify-center gap-3 p-6 text-center',
          !shouldShowContent ? 'flex-col' : 'flex-row',
        )}
      >
        {shouldShowContent
          ? defaultContent
          : filenames?.map((name) => (
              <ListItem
                key={name}
                name={name}
                state={state}
                showRemove={showRemove}
                onRemove={() => removeFile(name)}
              />
            ))}
      </div>
      {input}
    </div>
  );
}
