import { useCallback, useRef } from 'react';
import { useToastNotification } from './useToastNotification';
import { useLazyModal } from './useLazyModal';
import { LazyModal } from '../components/modals/common/types';

type Func = () => void | Promise<void>;

interface UsePrivilegedSession {
  initializePrivilegedSession?: (
    redirect: string,
    onVerified?: () => void,
  ) => void;
}

interface UsePrivilegedSessionProps {
  providers: string[];
}

const usePrivilegedSession = ({
  providers,
}: UsePrivilegedSessionProps): UsePrivilegedSession => {
  const { openModal } = useLazyModal<LazyModal.VerifySession>();
  const { displayToast } = useToastNotification();
  const onVerification = useRef<Func>();

  const initializePrivilegedSession = useCallback(
    (redirect: string, onVerifiedProps?: () => void) => {
      const url = new URL(redirect);
      if (url.pathname.indexOf('login') === -1) {
        return null;
      }

      if (!url.searchParams.get('refresh')) {
        return null;
      }

      onVerification.current = onVerifiedProps;

      const onVerified = () => {
        if (onVerification?.current) {
          onVerification.current();
          onVerification.current = null;
        } else {
          displayToast('Session successfully verified!');
        }
      };

      return openModal({
        type: LazyModal.VerifySession,
        props: { userProviders: providers, onVerified },
      });
    },
    [displayToast, openModal, providers],
  );

  return { initializePrivilegedSession };
};

export default usePrivilegedSession;
