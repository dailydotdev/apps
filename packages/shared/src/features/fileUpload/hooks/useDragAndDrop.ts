// useDragAndDrop.ts
import { useState, useCallback } from 'react';

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

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (disabled) {
        return;
      }

      const hasFiles = Array.from(event.dataTransfer.types).includes('Files');
      setState({ isDragOver: true, isDragValid: hasFiles });
    },
    [disabled],
  );

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    const related = event.relatedTarget as Node | null;
    if (!target.contains(related)) {
      setState({ isDragOver: false, isDragValid: true });
    }
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (disabled) {
        return;
      }

      setState({ isDragOver: false, isDragValid: true });
      onFiles(event.dataTransfer.files);
    },
    [disabled, onFiles],
  );

  return {
    isDragOver: state.isDragOver,
    isDragValid: state.isDragValid,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};
