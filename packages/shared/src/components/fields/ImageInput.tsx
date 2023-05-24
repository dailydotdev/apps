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
import EditIcon from '../icons/Edit';
import { IconSize } from '../Icon';
import { useToastNotification } from '../../hooks/useToastNotification';
import { Button, ButtonSize } from '../buttons/Button';
import MiniCloseIcon from '../icons/MiniClose';

type Size = 'medium' | 'large';

interface ClassName {
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
}

const TWO_MEGABYTES = 2 * 1024 * 1024;

const componentSize: Record<Size, string> = {
  medium: 'w-24 h-24 rounded-26',
  large: 'w-40 h-40 rounded-[2.5rem]',
};
const sizeToIconSize: Record<Size, IconSize> = {
  medium: IconSize.Small,
  large: IconSize.Medium,
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

    if (file.size > TWO_MEGABYTES) {
      toast.displayToast('Maximum image size is 2 MB');

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
    <div className="flex relative w-min">
      <button
        type="button"
        onClick={onClick}
        className={classNames(
          'relative flex justify-center items-center group overflow-hidden border border-theme-divider-primary',
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
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={onFileChange}
          />
        )}
        {image ? (
          <img
            className={classNames(
              'w-full h-full',
              className?.img,
              alwaysShowHover && 'opacity-[0.8]',
              !viewOnly && 'mouse:group-hover:opacity-64',
            )}
            src={image}
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
              !viewOnly && 'mouse:group-hover:block absolute',
            )}
          >
            {hoverIcon || <EditIcon size={sizeToIconSize[size]} secondary />}
          </span>
        )}
      </button>
      {image && closeable && (
        <Button
          type="button"
          buttonSize={ButtonSize.Small}
          position="absolute"
          className="absolute -top-2 -right-2 !shadow-2 btn-primary"
          onClick={onClose}
          icon={<MiniCloseIcon />}
        />
      )}
    </div>
  );
}

export default ImageInput;
