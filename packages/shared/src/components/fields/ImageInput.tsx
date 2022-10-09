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

type Size = 'medium' | 'large';

interface ClassName {
  container?: string;
  img?: string;
}

interface ImageInputProps {
  className?: ClassName;
  initialValue?: string;
  onChange?: (base64: string) => void;
  name?: string;
  size?: Size;
  id?: string;
  viewOnly?: boolean;
  fallbackImage?: string;
  hoverIcon?: ReactNode;
}

const TWO_MEGABYTES = 2 * 1024 * 1024;

const componentSize: Record<Size, string> = {
  medium: 'w-24 h-24 rounded-26',
  large: 'w-40 h-40 rounded-[2.5rem]',
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
  fallbackImage = fallbackImages.avatar,
}: ImageInputProps): ReactElement {
  const inputRef = useRef<HTMLInputElement>();
  const [error, setError] = useState('');
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
      setError('Maximum image size is 2 MB');
      return;
    }

    const base64 = await blobToBase64(file);
    setError(null);
    setImage(base64);
    onChange?.(base64);
  };

  const onError = () => setImage(fallbackImage);

  return (
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
      <img
        className={classNames(
          'w-full h-full',
          className?.img,
          !viewOnly && 'mouse:group-hover:opacity-64',
        )}
        src={image}
        alt="File upload preview"
        onError={onError}
      />
      <span
        className={classNames(
          'hidden',
          !viewOnly && 'mouse:group-hover:block absolute',
        )}
      >
        {hoverIcon || <EditIcon size={size} secondary />}
      </span>
      <span
        className={classNames('typo-footnote', error ? 'visible' : 'invisible')}
      >
        {error}
      </span>
    </button>
  );
}

export default ImageInput;
