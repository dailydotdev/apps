import classNames from 'classnames';
import React, { ChangeEvent, ReactElement, useRef, useState } from 'react';
import { blobToBase64 } from '../../lib/blob';
import EditIcon from '../icons/Edit';

interface ImageInputProps {
  className?: string;
  initialValue?: string;
  onChange?: (base64: string) => void;
  name?: string;
}

const TWO_MEGABYTES = 2 * 1024 * 1024;

function ImageInput({
  initialValue,
  name = 'file',
  className,
  onChange,
}: ImageInputProps): ReactElement {
  const inputRef = useRef<HTMLInputElement>();
  const [error, setError] = useState('');
  const [image, setImage] = useState(initialValue);
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

  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'relative flex justify-center items-center group w-fit',
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={onFileChange}
      />
      <img
        className="w-40 h-40 mouse:group-hover:opacity-64 rounded-[2.625rem]"
        src={image}
        alt="File upload preview"
      />
      <EditIcon
        className="hidden mouse:group-hover:block absolute"
        size="large"
        secondary
      />
      <span
        className={classNames('typo-footnote', error ? 'visible' : 'invisible')}
      >
        {error}
      </span>
    </button>
  );
}

export default ImageInput;
