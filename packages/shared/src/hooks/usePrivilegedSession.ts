import { useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { LoginFormParams } from '../components/auth/LoginForm';
import { AuthSession } from '../lib/kratos';
import useLogin from './useLogin';
import { useToastNotification } from './useToastNotification';

type Func = () => void | Promise<void>;

interface UsePrivilegedSession {
  isReady: boolean;
  session: AuthSession;
  showVerifySession?: boolean;
  onCloseVerifySession: () => void;
  refetchSession?: () => Promise<unknown>;
  onPasswordLogin?: (params: LoginFormParams) => void;
  onSocialLogin?: (provider: string) => void;
  initializePrivilegedSession?: (
    redirect: string,
    onVerified?: () => void,
  ) => void;
}

export const VERIFY_SESSION_KEY = 'verify_session';

const usePrivilegedSession = (): UsePrivilegedSession => {
  const onVerification = useRef<Func>();
  const { displayToast } = useToastNotification();
  const { data: verifySessionId } = useQuery(VERIFY_SESSION_KEY);
  const client = useQueryClient();
  const setVerifySessionId = (value: string) =>
    client.setQueryData(VERIFY_SESSION_KEY, value);

  const {
    session,
    loginFlowData,
    loginHint,
    isReady,
    onSocialLogin,
    onPasswordLogin,
    refetchSession,
  } = useLogin({
    enableSessionVerification: true,
    queryEnabled: !!verifySessionId,
    queryParams: { refresh: 'true' },
    onSuccessfulLogin: () => {
      setVerifySessionId(null);
      if (onVerification?.current) {
        onVerification.current();
        onVerification.current = null;
      } else {
        displayToast('Session successfully verified!');
      }
    },
  });

  const initializePrivilegedSession = (
    redirect: string,
    onVerified?: () => void,
  ) => {
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
  };

  return useMemo<UsePrivilegedSession>(
    () => ({
      session,
      isReady,
      showVerifySession: !!verifySessionId,
      initializePrivilegedSession,
      onCloseVerifySession: () => setVerifySessionId(null),
      onPasswordLogin,
      onSocialLogin,
      refetchSession,
    }),
    [session, verifySessionId, loginHint, loginFlowData],
  );
};

export default usePrivilegedSession;
