import React from 'react';
import type { ReactElement } from 'react';
import { useToastNotification } from '../../hooks';
import { useFileValidation } from '../../features/fileUpload/hooks/useFileValidation';
import { useFileInput } from '../../features/fileUpload/hooks/useFileInput';
import type { ButtonProps } from './Button';
import { Button } from './Button';
import type { DragDropProps } from '../fields/DragDrop';

export type UploadButtonProps = ButtonProps<'button'> &
  Pick<DragDropProps, 'onFilesDrop' | 'validation' | 'errorMessages'>;

export const UploadButton = ({
  onFilesDrop,
  validation = {},
  errorMessages = {},
  disabled,
  ...buttonProps
}: UploadButtonProps): ReactElement => {
  const { displayToast } = useToastNotification();

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

    onFilesDrop(validFiles);
  };

  const { input, openFileInput } = useFileInput({
    onFiles: handleFiles,
    accept: validation.acceptedTypes,
    multiple: validation.multiple,
    disabled,
  });

  return (
    <>
      {input}
      <Button onClick={openFileInput} disabled={disabled} {...buttonProps} />
    </>
  );
};
