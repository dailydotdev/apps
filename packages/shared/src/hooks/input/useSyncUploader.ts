import { useRef, useState } from 'react';
import { uploadContentImage } from '../../graphql/posts';
import { nextTick } from '../../lib/func';

interface UseSyncUploaderProps {
  onStarted: (file: File) => void;
  onFinish: (status: UploadState, file: File, url?: string) => void;
}

interface UseSyncUploader {
  queueCount: number;
  uploadedCount: number;
  startUploading: () => void;
  pushUpload: (file: File) => void;
}

export enum UploadState {
  Failed = 'failed',
  Ok = 'ok',
}

export const useSyncUploader = ({
  onStarted,
  onFinish,
}: UseSyncUploaderProps): UseSyncUploader => {
  const filesRef = useRef<File[]>([]);
  const [queueCount, setQueueCount] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);

  const uploadImage = (file: File) => {
    uploadContentImage(file, onStarted)
      .then((url) => onFinish(UploadState.Ok, file, url))
      .catch(() => onFinish(UploadState.Failed, file))
      .finally(async () => {
        await nextTick();

        if (!filesRef.current.length) {
          setUploadedCount(0);
          setQueueCount(0);
          return;
        }

        setUploadedCount(uploadedCount + 1);
        const upload = filesRef.current.pop();
        uploadImage(upload);
      });
  };

  const startUploading = () => {
    if (!filesRef.current.length) return;

    setQueueCount(filesRef.current.length);

    if (!queueCount) {
      const file = filesRef.current.pop();
      uploadImage(file);
    }
  };

  const pushUpload = (file: File) => {
    filesRef.current.push(file);
  };

  return { queueCount, uploadedCount, pushUpload, startUploading };
};
