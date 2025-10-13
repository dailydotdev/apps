import type { DragEvent, ChangeEvent } from 'react';
import { useRef, useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useFileInput } from './utils/useFileInput';
import { acceptedTypesList } from '../graphql/posts';

interface UseControlledImageUploadProps {
  name: string;
  fileSizeLimitMB?: number;
  currentImageName: string;
  fallbackImage?: string;
  onRemove?: () => void;
}

export const useControlledImageUpload = ({
  name,
  fileSizeLimitMB = 5,
  currentImageName,
  fallbackImage,
}: UseControlledImageUploadProps) => {
  const { setValue, watch } = useFormContext();
  const currentImage = watch(currentImageName || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const fileValue = watch(name);
  const [preview, setPreview] = useState<string | null>(null);

  const { onFileChange: handleFile } = useFileInput({
    acceptedTypes: acceptedTypesList,
    limitMb: fileSizeLimitMB,
    onChange(base64, file) {
      if (!base64 || !file) {
        setValue(name, null);
        setPreview(null);
        return;
      }
      setValue(name, file);
      setValue(currentImageName, null);
      setPreview(base64);
    },
  });

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleFile(file);
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    handleFile(file);
  };

  const onUploadClick = () => {
    inputRef.current?.click();
  };

  const onRemove = () => {
    setValue(name, null);
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const getDisplayImage = (): string | null => {
    if (preview) {
      return preview;
    }

    if (fileValue === null) {
      return fallbackImage || null;
    }
    return currentImage || fallbackImage || null;
  };

  const displayImage = getDisplayImage();

  return {
    displayImage,
    inputRef,
    onFileChange,
    onDragOver,
    onDrop,
    onUploadClick,
    onRemove,
    acceptedTypes: acceptedTypesList.join(','),
  };
};
