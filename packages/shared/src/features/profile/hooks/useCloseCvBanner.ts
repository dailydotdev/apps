import { useRouter } from 'next/router';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { webappUrl } from '../../../lib/constants';

export const useCloseCvBanner = (onClose: () => void): (() => void) => {
  const router = useRouter();
  const { displayToast } = useToastNotification();

  return () => {
    displayToast('You can upload your CV later from your profile', {
      action: {
        copy: 'Go to profile',
        onClick: () => router.push(`${webappUrl}settings/profile`),
      },
    });
    onClose();
  };
};
