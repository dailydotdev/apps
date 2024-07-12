import classNames from 'classnames';
import React, {
  ChangeEvent,
  ReactElement,
  ReactNode,
  useRef,
  useState,
} from 'react';
import { blobToBase64 } from '../../lib/blob';
import { fallbackImages } from '../../lib/config';
import { EditIcon } from '../icons';
import { IconSize } from '../Icon';
import { useToastNotification } from '../../hooks/useToastNotification';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import CloseButton from '../CloseButton';

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
  fallbackImage?: string;
  hoverIcon?: ReactNode;
  enableHover?: boolean;
  closeable?: boolean;
  alwaysShowHover?: boolean;
  children?: ReactNode;
  fileSizeLimitMB?: number;
}

export const MEGABYTE = 1024 * 1024;

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
export const ACCEPTED_TYPES = 'image/png,image/jpeg';
export const acceptedTypesList = ACCEPTED_TYPES.split(',');

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
}: ImageInputProps): ReactElement {
  const inputRef = useRef<HTMLInputElement>();
  const toast = useToastNotification();
  const [image, setImage] = useState(initialValue || fallbackImage);
  const onClick = () => {
    inputRef.current.click();
  };

  const onFileChange = async (event: ChangeEvent) => {
    const input = event.target as HTMLInputElement;
    const file = input.files[0];

    if (!file) {
      onChange?.(null);
      return;
    }

    if (file.size > fileSizeLimitMB * MEGABYTE) {
      toast.displayToast(`Maximum image size is ${fileSizeLimitMB} MB`);
      return;
    }

    if (!acceptedTypesList.includes(file.type)) {
      toast.displayToast(`File type is not allowed`);
      return;
    }

    const base64 = await blobToBase64(file);
    toast.dismissToast();
    setImage(base64);
    onChange?.(base64, file);
  };

  const onClose = () => {
    setImage(null);
    onChange?.(null, null);
    inputRef.current.value = '';
  };

  const onError = () => setImage(fallbackImage);

  return (
    <div className={classNames(className?.root || 'relative z-1 flex w-min')}>
      <button
        type="button"
        onClick={onClick}
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
      {image && closeable && (
        <CloseButton
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
