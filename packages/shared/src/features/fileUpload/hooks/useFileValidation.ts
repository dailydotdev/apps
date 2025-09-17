import { useMemo } from 'react';

export interface DragDropValidation {
  maxSize?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  acceptedExtensions?: string[];
  maxFiles?: number;
  multiple?: boolean;
}

export interface DragDropError {
  type: 'size' | 'format' | 'count' | 'unknown';
  message: string;
  file?: File;
}

const BYTES_PER_MB = 1024 * 1024;

const defaultErrorMessages = {
  size: 'File size exceeds the maximum allowed size',
  format: 'File type is not supported',
  count: 'Too many files selected',
  unknown: 'An error occurred while processing the file',
};

export const useFileValidation = (
  validation: DragDropValidation = {},
  errorMessages: Partial<typeof defaultErrorMessages> = {},
) => {
  const {
    maxSize,
    maxSizeMB = 10,
    acceptedTypes = [],
    acceptedExtensions = [],
    maxFiles = 1,
    multiple = false,
  } = validation;

  const finalMaxSize = maxSize ?? maxSizeMB * BYTES_PER_MB;
  const messages = useMemo(
    () => ({ ...defaultErrorMessages, ...errorMessages }),
    [errorMessages],
  );

  const validateFile = (file: File): DragDropError | null => {
    if (file.size > finalMaxSize) {
      return { type: 'size', message: messages.size, file };
    }

    if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
      return { type: 'format', message: messages.format, file };
    }

    if (acceptedExtensions.length > 0) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !acceptedExtensions.includes(ext)) {
        return { type: 'format', message: messages.format, file };
      }
    }

    return null;
  };

  const validateFiles = (
    files: File[],
  ): { validFiles: File[]; errors: DragDropError[] } => {
    const validFiles: File[] = [];
    const errors: DragDropError[] = [];

    if (!multiple && files.length > 1) {
      errors.push({ type: 'count', message: messages.count });
      return { validFiles, errors };
    }

    if (maxFiles > 0 && files.length > maxFiles) {
      errors.push({ type: 'count', message: messages.count });
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

  return { validateFiles, messages };
};
