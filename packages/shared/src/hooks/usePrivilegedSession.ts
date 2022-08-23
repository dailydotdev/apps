import { useMemo } from 'react';
import { useMutation, useQuery } from 'react-query';
import { LoginFormParams } from '../components/auth/LoginForm';
import { ValidateResetPassword } from '../lib/auth';
import {
  AuthFlow,
  InitializationData,
  initializeKratosFlow,
  submitKratosFlow,
} from '../lib/kratos';
import useLogin from './useLogin';
import usePersistentContext from './usePersistentContext';
import { useToastNotification } from './useToastNotification';

interface UsePrivilegedSession {
  showVerifySession?: boolean;
  onCloseVerifySession: () => void;
  settings: InitializationData;
  resetPassword: (params: ValidateResetPassword) => unknown;
  onPasswordLogin: (params: LoginFormParams) => void;
}

interface UsePrivilegedSessionProps {
  onResetSuccessful?: () => void;
}

export const VERIFY_SESSION_KEY = 'verify_session';

const usePrivilegedSession = ({
  onResetSuccessful,
}: UsePrivilegedSessionProps = {}): UsePrivilegedSession => {
  const { displayToast } = useToastNotification();
  const [verifySessionId, setVerifySessionId] =
    usePersistentContext(VERIFY_SESSION_KEY);
  const { data: settings } = useQuery(['settings'], () =>
    initializeKratosFlow(AuthFlow.Settings),
  );

  const { mutateAsync: resetPassword } = useMutation(
    (params: ValidateResetPassword) => submitKratosFlow(params),
    {
      onSuccess: async ({ redirect }) => {
        if (redirect) {
          const url = new URL(redirect);
          const returnTo = new URL(url.searchParams.get('return_to'));
          const flowId = returnTo.searchParams.get('flow');
          return setVerifySessionId(flowId);
        }

        return onResetSuccessful?.();
      },
    },
  );

  const { loginFlowData, loginHint, onPasswordLogin } = useLogin({
    queryEnabled: !!verifySessionId,
    queryParams: { refresh: 'true' },
    onSuccessfulPasswordLogin: () => {
      setVerifySessionId(null);
      displayToast(
        'Session successfully verified! You can now change password',
      );
    },
  });

  return useMemo(
    () => ({
      settings,
      showVerifySession: !!verifySessionId,
      onCloseVerifySession: () => setVerifySessionId(null),
      resetPassword,
      onPasswordLogin,
    }),
    [verifySessionId, settings, loginHint, loginFlowData],
  );
};

export default usePrivilegedSession;
