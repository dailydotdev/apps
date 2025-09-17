import React, {
  useRef,
  useCallback,
  useMemo,
  useImperativeHandle,
} from 'react';
import type { MutableRefObject } from 'react';

type OnFiles = (files: FileList | null) => void;

export type UseFileInputProps = {
  onFiles: OnFiles;
  accept?: string | string[];
  multiple?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
  capture?: boolean | 'user' | 'environment';
  className?: string;
  inputProps?: Record<string, unknown>;
  inputRef?: MutableRefObject<HTMLInputElement>;
};

export const useFileInput = ({
  onFiles,
  inputRef: inputRefProp,
  accept,
  multiple,
  disabled,
  name,
  id,
  capture,
  className,
  inputProps,
}: UseFileInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(inputRefProp, () => inputRef.current as HTMLInputElement);

  const openFileInput = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFiles(e.target.files);
      // Allow selecting the same file again
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }, 0);
    },
    [onFiles],
  );

  const acceptStr = useMemo(() => {
    if (!accept) {
      return undefined;
    }
    return Array.isArray(accept) ? accept.join(',') : accept;
  }, [accept]);

  const input = useMemo(
    () => (
      <input
        type="file"
        hidden
        ref={inputRef}
        onChange={onChange}
        accept={acceptStr}
        multiple={multiple}
        disabled={disabled}
        name={name}
        id={id}
        capture={capture}
        className={className}
        {...inputProps}
      />
    ),
    [
      acceptStr,
      capture,
      className,
      disabled,
      id,
      inputProps,
      multiple,
      name,
      onChange,
    ],
  );

  return { input, openFileInput, inputRef };
};
