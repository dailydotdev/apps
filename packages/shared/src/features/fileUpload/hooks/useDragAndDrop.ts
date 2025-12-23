// useDragAndDrop.ts
import { useState, useCallback, useRef } from 'react';

interface DragState {
  isDragOver: boolean;
  isDragValid: boolean;
}

interface Options {
  disabled?: boolean;
  onFiles: (files: FileList | null) => void;
}

export const useDragAndDrop = ({ disabled, onFiles }: Options) => {
  const [state, setState] = useState<DragState>({
    isDragOver: false,
    isDragValid: true,
  });

  const isDraggingRef = useRef(false);

  const handleDragEnter = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (disabled || isDraggingRef.current) {
        return;
      }

      isDraggingRef.current = true;
      const hasFiles = Array.from(event.dataTransfer.types).includes('Files');
      setState({ isDragOver: true, isDragValid: hasFiles });
    },
    [disabled],
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (disabled || !isDraggingRef.current) {
        return;
      }

      const relatedTarget = event.relatedTarget as Node | null;
      const currentTarget = event.currentTarget as HTMLElement;

      if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
        isDraggingRef.current = false;
        setState({ isDragOver: false, isDragValid: true });
      }
    },
    [disabled],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (disabled) {
        return;
      }

      isDraggingRef.current = false;
      setState({ isDragOver: false, isDragValid: true });
      onFiles(event.dataTransfer.files);
    },
    [disabled, onFiles],
  );

  return {
    isDragOver: state.isDragOver,
    isDragValid: state.isDragValid,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};
