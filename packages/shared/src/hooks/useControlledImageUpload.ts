import type { DragEvent, ChangeEvent } from 'react';
import { useRef, useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useFileInput } from './utils/useFileInput';
import { acceptedTypesList } from '../graphql/posts';

interface UseControlledImageUploadProps {
  name: string;
  fileSizeLimitMB?: number;
  currentImage?: string;
  fallbackImage?: string;
}

export const useControlledImageUpload = ({
  name,
  fileSizeLimitMB = 5,
  currentImage,
  fallbackImage,
}: UseControlledImageUploadProps) => {
  const { setValue, watch } = useFormContext();
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
      // Store just the file in form state
      setValue(name, file);
      // Keep preview in local state
      setPreview(base64);
    },
  });

  // Clean up preview URL when component unmounts or file changes
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

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  const handleRemove = () => {
    // Set to null to mark for deletion
    setValue(name, null);
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // Determine what image to display
  const getDisplayImage = (): string | null => {
    // If there's a preview from file upload, show it
    if (preview) {
      return preview;
    }

    // If file is null, user wants to delete - show fallback
    if (fileValue === null) {
      return fallbackImage || null;
    }

    // Otherwise show current image or fallback
    return currentImage || fallbackImage || null;
  };

  const displayImage = getDisplayImage();

  return {
    displayImage,
    inputRef,
    onFileChange,
    onDragOver,
    onDrop,
    handleUploadClick,
    handleRemove,
    acceptedTypes: acceptedTypesList.join(','),
  };
};
