import type { ReactElement, ChangeEvent, DragEvent } from 'react';
import React, { useState, useRef, useCallback } from 'react';
import classNames from 'classnames';
import type { ModalProps } from '../../../../components/modals/common/Modal';
import { Modal } from '../../../../components/modals/common/Modal';
import { Button, ButtonVariant } from '../../../../components/buttons/Button';
import { ModalHeader } from '../../../../components/modals/common/ModalHeader';
import { useViewSize, ViewSize } from '../../../../hooks';
import { CameraIcon, TrashIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import {
  uploadContentImage,
  acceptedTypesList,
  imageSizeLimitMB,
} from '../../../../graphql/posts';
import type { AddUserWorkspacePhotoInput } from '../../../../graphql/user/userWorkspacePhoto';

type WorkspacePhotoUploadModalProps = Omit<ModalProps, 'children'> & {
  onSubmit: (input: AddUserWorkspacePhotoInput) => Promise<void>;
};

export function WorkspacePhotoUploadModal({
  onSubmit,
  ...rest
}: WorkspacePhotoUploadModalProps): ReactElement {
  const isMobile = useViewSize(ViewSize.MobileL);
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback((file: File | undefined) => {
    if (!file) {
      return;
    }

    setError(null);

    if (!acceptedTypesList.includes(file.type)) {
      setError('File type not supported. Please use JPG, PNG, or WEBP.');
      return;
    }

    if (file.size > imageSizeLimitMB * 1024 * 1024) {
      setError(`File size exceeds ${imageSizeLimitMB}MB limit.`);
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files?.[0]);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const imageUrl = await uploadContentImage(selectedFile);
      await onSubmit({ image: imageUrl });
      rest.onRequestClose?.(null);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const canSubmit = !!selectedFile && !isUploading;

  return (
    <Modal
      formProps={{
        form: 'workspace_photo_form',
        title: (
          <div className="px-4">
            <ModalHeader.Title className="typo-title3">
              Add Workspace Photo
            </ModalHeader.Title>
          </div>
        ),
        rightButtonProps: {
          variant: ButtonVariant.Primary,
          disabled: !canSubmit,
          loading: isUploading,
          onClick: handleSubmit,
        },
        copy: { right: 'Add photo' },
      }}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Medium}
      {...rest}
    >
      <ModalHeader showCloseButton={!isMobile}>
        <ModalHeader.Title className="typo-title3">
          Add Workspace Photo
        </ModalHeader.Title>
      </ModalHeader>
      <Modal.Body className="flex flex-col gap-4">
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypesList.join(',')}
          className="hidden"
          onChange={handleInputChange}
        />

        {preview ? (
          <div className="relative">
            <div className="aspect-video overflow-hidden rounded-16">
              <img
                src={preview}
                alt="Preview"
                className="size-full object-cover"
              />
            </div>
            <Button
              variant={ButtonVariant.Float}
              icon={<TrashIcon />}
              onClick={handleRemoveImage}
              className="absolute right-2 top-2 bg-overlay-float-pepper"
              aria-label="Remove image"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={classNames(
              'flex aspect-video flex-col items-center justify-center gap-3 rounded-16 border-2 border-dashed transition-colors',
              isDragging
                ? 'border-accent-cabbage-default bg-surface-float'
                : 'border-border-subtlest-tertiary bg-surface-float hover:border-border-subtlest-secondary',
            )}
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-overlay-quaternary-cabbage">
              <CameraIcon size={IconSize.XLarge} />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <Typography
                type={TypographyType.Body}
                color={TypographyColor.Primary}
                bold
              >
                Drop your image here
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                or click to browse • Max {imageSizeLimitMB}MB
              </Typography>
            </div>
          </button>
        )}

        {error && (
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.StatusError}
          >
            {error}
          </Typography>
        )}

        {!isMobile && (
          <Button
            type="button"
            disabled={!canSubmit}
            loading={isUploading}
            variant={ButtonVariant.Primary}
            onClick={handleSubmit}
          >
            Add photo
          </Button>
        )}
      </Modal.Body>
    </Modal>
  );
}
