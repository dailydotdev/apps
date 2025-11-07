import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useUpdateQuery } from '../../../hooks/useUpdateQuery';
import { useUploadCv } from '../../profile/hooks/useUploadCv';
import { getCandidatePreferencesOptions } from '../queries';

export const useCVUploadManager = (onUploadSuccess?: () => void) => {
  const { user } = useAuthContext();
  const { onUpload, isPending } = useUploadCv({
    shouldOpenModal: false,
    onUploadSuccess,
  });

  const opts = getCandidatePreferencesOptions(user?.id);
  const [, set] = useUpdateQuery(opts);
  const { data: preferences } = useQuery(opts);

  const [file, setFile] = useState<File | null>(null);

  const handleUpload = useCallback(async () => {
    await onUpload(file as File);

    set({
      ...preferences,
      cv: {
        fileName: file.name,
        lastModified: new Date(),
      },
    });
  }, [file, onUpload, preferences, set]);

  return {
    file,
    setFile,
    handleUpload,
    isPending,
  };
};
