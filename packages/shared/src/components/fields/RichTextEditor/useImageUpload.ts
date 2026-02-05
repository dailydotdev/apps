import type { FormEventHandler } from 'react';
import { useCallback, useRef } from 'react';
import type { Editor } from '@tiptap/react';
import {
  allowedContentImage,
  allowedFileSize,
  uploadNotAcceptedMessage,
} from '../../../graphql/posts';
import { useToastNotification } from '../../../hooks/useToastNotification';
import {
  UploadState,
  useSyncUploader,
} from '../../../hooks/input/useSyncUploader';

interface UseImageUploadProps {
  enabled: boolean;
  editorRef: React.MutableRefObject<Editor | null>;
}

export function useImageUpload({ enabled, editorRef }: UseImageUploadProps) {
  const { displayToast } = useToastNotification();
  const uploadRef = useRef<HTMLInputElement>(null);

  const insertImage = useCallback(
    (url: string, altText: string) => {
      const editor = editorRef.current;
      if (!editor) {
        return;
      }

      editor.chain().focus().setImage({ src: url, alt: altText }).run();
    },
    [editorRef],
  );

  const { uploadedCount, queueCount, pushUpload, startUploading } =
    useSyncUploader({
      onStarted: () => {},
      onFinish: (status, file, url) => {
        if (status === UploadState.Failed || !url) {
          displayToast(uploadNotAcceptedMessage);
          return;
        }

        insertImage(url, file.name);
      },
    });

  const verifyFile = useCallback(
    (file: File) => {
      const isValidType = allowedContentImage.includes(file.type);

      if (file.size > allowedFileSize || !isValidType) {
        displayToast(uploadNotAcceptedMessage);
        return;
      }

      pushUpload(file);
    },
    [displayToast, pushUpload],
  );

  const onUpload: FormEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      if (!enabled) {
        return;
      }

      const { files } = event.currentTarget as HTMLInputElement;
      if (!files?.length) {
        return;
      }

      Array.from(files).forEach(verifyFile);
      startUploading();
    },
    [enabled, verifyFile, startUploading],
  );

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      if (!enabled) {
        return;
      }

      event.preventDefault();
      const { files } = event.dataTransfer;
      if (!files?.length) {
        return;
      }

      Array.from(files).forEach(verifyFile);
      startUploading();
    },
    [enabled, verifyFile, startUploading],
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      if (!enabled) {
        return;
      }

      const { files } = event.clipboardData;
      if (!files?.length) {
        return;
      }

      event.preventDefault();
      Array.from(files).forEach(verifyFile);
      startUploading();
    },
    [enabled, verifyFile, startUploading],
  );

  return {
    uploadRef,
    uploadedCount,
    queueCount,
    onUpload,
    handleDrop,
    handlePaste,
    insertImage,
  };
}
