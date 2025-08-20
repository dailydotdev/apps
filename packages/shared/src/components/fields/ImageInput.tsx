import classNames from 'classnames';
import type { ChangeEvent, DragEvent, ReactElement, ReactNode } from 'react';
import React, { useRef, useState } from 'react';
import { blobToBase64 } from '../../lib/blob';
import { fallbackImages } from '../../lib/config';
import { EditIcon } from '../icons';
import { IconSize } from '../Icon';
import { useToastNotification } from '../../hooks/useToastNotification';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import CloseButton from '../CloseButton';
import {
  MEGABYTE,
  acceptedTypesList,
  ACCEPTED_TYPES,
} from '../../graphql/posts';
import { Button } from '../buttons/Button';

type Size = 'medium' | 'large' | 'cover';

interface ClassName {
  root?: string;
  container?: string;
  img?: string;
}

interface ImageInputProps {
  className?: ClassName;
  initialValue?: string;
  onChange?: (base64: string, raw?: File) => void;
  name?: string;
  size?: Size;
  id?: string;
  viewOnly?: boolean;
  fallbackImage?: string | null;
  hoverIcon?: ReactNode;
  enableHover?: boolean;
  closeable?: boolean;
  alwaysShowHover?: boolean;
  children?: ReactNode;
  fileSizeLimitMB?: number;
  uploadButton?: boolean;
}

const componentSize: Record<Size, string> = {
  medium: 'w-24 h-24 rounded-26',
  large: 'w-40 h-40 rounded-40',
  cover: 'w-full h-24 rounded-26',
};
const sizeToIconSize: Record<Size, IconSize> = {
  medium: IconSize.Small,
  large: IconSize.Medium,
  cover: IconSize.Small,
};

interface UseImageInputProps {
  limitMb: number;
  onChange: (base64: string, file: File) => void;
}

export const useImageInput = ({ limitMb, onChange }: UseImageInputProps) => {
  const { displayToast, dismissToast } = useToastNotification();
  const onFileChange = async (file: File) => {
    if (!file) {
      onChange(null, null);
      return;
    }

    if (file.size > limitMb * MEGABYTE) {
      displayToast(`Maximum image size is ${limitMb} MB`);
      return;
    }

    if (!acceptedTypesList.includes(file.type)) {
      displayToast(`File type is not allowed`);
      return;
    }

    const base64 = await blobToBase64(file);
    dismissToast();
    onChange(base64, file);
  };

  return { onFileChange };
};

function ImageInput({
  initialValue,
  name = 'file',
  id,
  className = {},
  onChange,
  size = 'medium',
  viewOnly,
  hoverIcon,
  children,
  enableHover = true,
  alwaysShowHover,
  fallbackImage = fallbackImages.avatar,
  closeable,
  fileSizeLimitMB = 2,
  uploadButton = false,
}: ImageInputProps): ReactElement {
  const inputRef = useRef<HTMLInputElement>();
  const [image, setImage] = useState(initialValue || fallbackImage);
  const onClick = () => {
    inputRef.current.click();
  };

  const { onFileChange: handleFile } = useImageInput({
    limitMb: fileSizeLimitMB,
    onChange(base64, file) {
      if (!base64) {
        return onChange?.(null);
      }

      setImage(base64);
      return onChange?.(base64, file);
    },
  });

  const onFileChange = (event: ChangeEvent) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    handleFile(file);
  };

  const onDragOver = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const onDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    handleFile(file);
  };

  const onClose = () => {
    setImage(null);
    onChange?.(null, null);
    inputRef.current.value = '';
  };

  const onError = () => setImage(fallbackImage);

  return (
    <div className={className?.root || 'relative z-1 flex w-min'}>
      <button
        type="button"
        onClick={onClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={classNames(
          'group relative flex items-center justify-center overflow-hidden border border-border-subtlest-primary',
          componentSize[size],
          className?.container,
        )}
        disabled={viewOnly}
      >
        {!viewOnly && (
          <input
            id={id}
            ref={inputRef}
            type="file"
            name={name}
            accept={ACCEPTED_TYPES}
            className="hidden"
            onChange={onFileChange}
          />
        )}
        {image ? (
          <img
            className={classNames(
              'h-full w-full object-cover',
              className?.img,
              alwaysShowHover && 'opacity-[0.8]',
              !viewOnly && 'mouse:group-hover:opacity-64',
            )}
            src={image}
            data-testid={`image_${id}`}
            alt="File upload preview"
            onError={onError}
          />
        ) : (
          children
        )}
        {enableHover && (
          <span
            className={classNames(
              !alwaysShowHover && 'hidden',
              !viewOnly && 'absolute mouse:group-hover:block',
            )}
          >
            {hoverIcon || <EditIcon size={sizeToIconSize[size]} secondary />}
          </span>
        )}
      </button>
      {uploadButton && !viewOnly && (
        <Button
          variant={ButtonVariant.Secondary}
          onClick={onClick}
          onDragOver={onDragOver}
          onDrop={onDrop}
          type="button"
        >
          Upload image
        </Button>
      )}
      {image && closeable && (
        <CloseButton
          title="Remove image"
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
          className="absolute -right-2 -top-2 !shadow-2"
          onClick={onClose}
        />
      )}
    </div>
  );
}

export default ImageInput;
