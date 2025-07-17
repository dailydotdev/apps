import classNames from 'classnames';
import type {
  DragEvent,
  MutableRefObject,
  ReactElement,
  ReactNode,
} from 'react';
import React, {
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useToastNotification } from '../../hooks/useToastNotification';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { ChecklistAIcon, DocsIcon } from '../icons';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { Loader } from '../Loader';
import { IconSize } from '../Icon';

export interface DragDropValidation {
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Maximum file size in MB (convenience prop) */
  maxSizeMB?: number;
  /** Allowed file types (MIME types) */
  acceptedTypes?: string[];
  /** Allowed file extensions */
  acceptedExtensions?: string[];
  /** Maximum number of files allowed */
  maxFiles?: number;
  /** Whether to allow multiple files */
  multiple?: boolean;
}

export interface DragDropError {
  type: 'size' | 'format' | 'count' | 'unknown';
  message: string;
  file?: File;
}

type UploadState = 'loading' | 'success' | 'error';

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
  /** Content to show when no files are selected */
  children?: ReactNode;
  state?: UploadState;
  inputRef?: MutableRefObject<HTMLInputElement>;
  isCompactList?: boolean;
  renameFileTo?: string;
}

const BYTES_PER_MB = 1024 * 1024;

const defaultErrorMessages = {
  size: 'File size exceeds the maximum allowed size',
  format: 'File type is not supported',
  count: 'Too many files selected',
  unknown: 'An error occurred while processing the file',
};

const getIcon = (state: UploadState) => {
  if (state === 'loading') {
    return <Loader />;
  }

  if (state === 'success') {
    return <ChecklistAIcon className="text-accent-avocado-default" />;
  }

  return null;
};

interface ItemProps {
  name: string;
  state: UploadState;
  uploadAt?: Date;
}

const LargeItem = ({ name, state, uploadAt }: ItemProps) => (
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
  </div>
);

const CompactItem = ({ name, state }: ItemProps) => (
  <div className="flex w-full items-center gap-1">
    <DocsIcon secondary />
    <div className="min-w-0 flex-1 text-left">
      <Typography className="truncate" type={TypographyType.Footnote} bold>
        {name}
      </Typography>
    </div>
    {getIcon(state)}
  </div>
);

export function DragDrop({
  onFilesDrop,
  validation = {},
  errorMessages = {},
  disabled = false,
  className,
  children,
  state,
  inputRef: inputRefProps,
  isCompactList,
  renameFileTo,
}: DragDropProps): ReactElement {
  const inputRef = useRef<HTMLInputElement>();
  useImperativeHandle(inputRefProps, () => inputRef.current);
  const [filenames, setFilenames] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragValid, setIsDragValid] = useState(true);
  const toast = useToastNotification();

  const {
    maxSize,
    maxSizeMB = 10,
    acceptedTypes = [],
    acceptedExtensions = [],
    maxFiles = 1,
    multiple = false,
  } = validation;

  const finalMaxSize = maxSize || maxSizeMB * BYTES_PER_MB;
  const finalErrorMessages = { ...defaultErrorMessages, ...errorMessages };

  const getName = (file: File, index: number) => {
    const { name } = file;

    if (!renameFileTo) {
      return name;
    }

    const chunks = name.split('.');
    const extension = chunks.pop();

    return filenames.length === 1
      ? `${renameFileTo}.${extension}`
      : `${renameFileTo} (${index + 1}).${extension}`;
  };

  const validateFile = (file: File): DragDropError | null => {
    // Check file size
    if (file.size > finalMaxSize) {
      return {
        type: 'size',
        message: finalErrorMessages.size,
        file,
      };
    }

    // Check file type
    if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
      return {
        type: 'format',
        message: finalErrorMessages.format,
        file,
      };
    }

    // Check file extension
    if (acceptedExtensions.length > 0) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !acceptedExtensions.includes(fileExtension)) {
        return {
          type: 'format',
          message: finalErrorMessages.format,
          file,
        };
      }
    }

    return null;
  };

  const validateFiles = (
    files: File[],
  ): { validFiles: File[]; errors: DragDropError[] } => {
    const validFiles: File[] = [];
    const errors: DragDropError[] = [];

    // Check file count
    if (!multiple && files.length > 1) {
      errors.push({
        type: 'count',
        message: finalErrorMessages.count,
      });
      return { validFiles, errors };
    }

    if (maxFiles > 0 && files.length > maxFiles) {
      errors.push({
        type: 'count',
        message: finalErrorMessages.count,
      });
      return { validFiles, errors };
    }

    // Validate each file
    files.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    return { validFiles, errors };
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (disabled) {
      return;
    }

    setIsDragOver(true);

    // Check if drag contains files
    const hasFiles = event.dataTransfer.types.includes('Files');
    setIsDragValid(hasFiles);
  };

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    // Only set drag over to false if we're leaving the drop zone entirely
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragOver(false);
      setIsDragValid(true);
    }
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const fileArray = Array.from(files);
    const { validFiles, errors } = validateFiles(fileArray);

    // Show toast for errors
    errors.forEach((error) => {
      const fileName = error.file ? ` (${error.file.name})` : '';
      toast.displayToast(`${error.message}${fileName}`);
    });

    // Call callback with valid files and errors
    setFilenames(validFiles.map(getName));
    onFilesDrop(validFiles, errors.length > 0 ? errors : undefined);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (disabled) {
      return;
    }

    setIsDragOver(false);
    setIsDragValid(true);

    handleFiles(event.dataTransfer.files);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    // Reset the input value so the same file can be selected again
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }, 0);
  };

  const defaultContent = (
    <>
      <Typography
        className="flex flex-row gap-1"
        type={TypographyType.Footnote}
        bold
      >
        <DocsIcon secondary />
        Drag & Drop your CV or
      </Typography>
      <Button
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Small}
        onClick={() => inputRef.current.click()}
      >
        Browse
      </Button>
    </>
  );

  const ListItem =
    isCompactList || state === 'loading' ? CompactItem : LargeItem;
  const defaultContainer = (
    <div
      className={classNames(
        'flex w-full items-center justify-center gap-3 p-6 text-center',
        filenames?.length ? 'flex-col' : 'flex-row',
      )}
    >
      {!filenames?.length
        ? defaultContent
        : filenames?.map((name) => (
            <ListItem key={name} name={name} state={state} />
          ))}
    </div>
  );

  return (
    <div
      className={classNames(
        'relative flex flex-1 rounded-10 border border-dashed border-border-subtlest-secondary',
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
      {children || defaultContainer}
      <input
        type="file"
        hidden
        ref={inputRef}
        onChange={handleFileInput}
        accept={acceptedTypes.join(',')}
        multiple={multiple}
        disabled={disabled}
      />
    </div>
  );
}
