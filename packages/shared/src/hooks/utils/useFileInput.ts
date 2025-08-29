import { MEGABYTE } from '../../graphql/posts';
import { blobToBase64 } from '../../lib/blob';
import { useToastNotification } from '../useToastNotification';

interface UseFileInputProps {
  limitMb: number;
  acceptedTypes?: string[];
  onChange: (base64: string, file: File) => void;
}

export const useFileInput = ({
  limitMb,
  acceptedTypes,
  onChange,
}: UseFileInputProps) => {
  const { displayToast, dismissToast } = useToastNotification();
  const onFileChange = async (file: File) => {
    if (!file) {
      onChange(null, null);
      return;
    }

    if (file.size > limitMb * MEGABYTE) {
      displayToast(`Maximum image size is ${limitMb} MB`);
      return;
    }

    if (acceptedTypes && !acceptedTypes.includes(file.type)) {
      displayToast(`File type is not allowed`);
      return;
    }

    const base64 = await blobToBase64(file);
    dismissToast();
    onChange(base64, file);
  };

  return { onFileChange };
};
