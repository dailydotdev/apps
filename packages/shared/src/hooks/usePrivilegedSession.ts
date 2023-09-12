import { useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { AuthSession } from '../lib/kratos';
import useLogin from './useLogin';
import { useToastNotification } from './useToastNotification';
import { useLazyModal } from './useLazyModal';
import { LazyModal } from '../components/modals/common/types';

type Func = () => void | Promise<void>;

interface UsePrivilegedSession {
  session: AuthSession;
  refetchSession?: () => Promise<unknown>;
  initializePrivilegedSession?: (
    redirect: string,
    onVerified?: () => void,
  ) => void;
}

export const VERIFY_SESSION_KEY = 'verify_session';

interface UsePrivilegedSessionProps {
  providers: string[];
}

const usePrivilegedSession = ({
  providers,
}: UsePrivilegedSessionProps): UsePrivilegedSession => {
  const { openModal, updateProps, closeModal } =
    useLazyModal<LazyModal.VerifySession>();
  const onVerification = useRef<Func>();
  const { displayToast } = useToastNotification();
  const client = useQueryClient();
  const { data: verifySessionId } = useQuery(VERIFY_SESSION_KEY, () =>
    client.getQueryData(VERIFY_SESSION_KEY),
  );
  const onClearSession = () => {
    client.setQueryData(VERIFY_SESSION_KEY, null);
    closeModal();
  };

  const { session, isReady, onSocialLogin, onPasswordLogin, refetchSession } =
    useLogin({
      enableSessionVerification: true,
      queryEnabled: !!verifySessionId,
      queryParams: { refresh: 'true' },
      onSuccessfulLogin: () => {
        onClearSession();
        if (onVerification?.current) {
          onVerification.current();
          onVerification.current = null;
        } else {
          displayToast('Session successfully verified!');
        }
      },
    });

  useEffect(() => {
    updateProps({ isReady });
  }, [updateProps, isReady]);

  const setVerifySessionId = useCallback(
    (value: string) => {
      openModal({
        type: LazyModal.VerifySession,
        props: {
          isReady,
          onPasswordLogin,
          onSocialLogin,
          userProviders: providers,
        },
      });

      client.setQueryData(VERIFY_SESSION_KEY, value);
    },
    [client, isReady, onPasswordLogin, onSocialLogin, openModal, providers],
  );

  const initializePrivilegedSession = useCallback(
    (redirect: string, onVerified?: () => void) => {
      const url = new URL(redirect);
      if (url.pathname.indexOf('login') === -1) {
        return null;
      }

      if (!url.searchParams.get('refresh')) {
        return null;
      }

      const returnTo = new URL(url.searchParams.get('return_to'));
      const flowId = returnTo.searchParams.get('flow');
      onVerification.current = onVerified;
      return setVerifySessionId(flowId);
    },
    [setVerifySessionId],
  );

  return {
    session,
    refetchSession,
    initializePrivilegedSession,
  };
};

export default usePrivilegedSession;
