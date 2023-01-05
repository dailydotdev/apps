import { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import {
  AuthFlow,
  getKratosFlow,
  initializeKratosFlow,
  submitKratosFlow,
} from '../lib/kratos';
import { getErrorMessage, getNodeByKey, getNodeValue } from '../lib/auth';
import useTimer from './useTimer';
import { disabledRefetch } from '../lib/func';

interface UseAccountEmail {
  sendEmail: (email: string) => Promise<unknown>;
  verifyCode: (code: string) => Promise<unknown>;
  resendTimer: number;
  isLoading?: boolean;
  token?: string;
  flow?: string;
}

interface UseAccountEmailProps {
  flow: EmailFlow;
  flowId?: string;
  isQueryEnabled?: boolean;
  onSuccess?: (email, id) => void;
  onVerifyCodeSuccess?: () => void;
  onError?: (error: string) => void;
  onTimerFinished?: () => void;
}

type EmailFlow = AuthFlow.Recovery | AuthFlow.Verification;

function useAccountEmailFlow({
  flow,
  flowId,
  isQueryEnabled,
  onSuccess,
  onVerifyCodeSuccess,
  onError,
  onTimerFinished,
}: UseAccountEmailProps): UseAccountEmail {
  const [resentCount, setResentCount] = useState(0);
  const { timer, setTimer, runTimer } = useTimer(onTimerFinished, 0);

  const { data: emailFlow } = useQuery(
    [{ type: flow, sentCount: resentCount }],
    ({ queryKey: [{ type }] }) =>
      flowId
        ? getKratosFlow(AuthFlow.Recovery, flowId)
        : initializeKratosFlow(type),
    {
      ...(flowId
        ? { ...disabledRefetch, retry: false, enabled: !!flowId }
        : { enabled: isQueryEnabled }),
    },
  );

  const { mutateAsync: sendEmail, isLoading } = useMutation(
    (email: string) =>
      submitKratosFlow({
        action: emailFlow.ui.action,
        params: {
          email,
          method: 'code',
          csrf_token: getNodeValue('csrf_token', emailFlow.ui.nodes),
        },
      }),
    {
      onSuccess: ({ error }, variables) => {
        if (error) {
          const requestError = getErrorMessage(error.ui.messages);
          const emailError = getNodeByKey('email', error.ui.nodes);
          const formError = getErrorMessage(emailError?.messages);
          const message = requestError || formError;
          return onError?.(message);
        }

        setTimer(60);
        runTimer();
        setResentCount((value) => value + 1);
        return onSuccess?.(variables, emailFlow.id);
      },
    },
  );

  const { mutateAsync: verifyCode } = useMutation(
    (code: string) =>
      submitKratosFlow({
        action: emailFlow.ui.action,
        params: {
          code,
          method: 'code',
          csrf_token: getNodeValue('csrf_token', emailFlow.ui.nodes),
        },
      }),
    {
      onSuccess: ({ error }) => {
        if (error) {
          const requestError = getErrorMessage(error.ui.messages);
          if (requestError) {
            return onError?.(requestError);
          }
        }

        return onVerifyCodeSuccess?.();
      },
    },
  );

  return useMemo(
    () => ({
      sendEmail,
      verifyCode,
      token: getNodeValue('csrf_token', emailFlow?.ui?.nodes),
      resendTimer: timer,
      isLoading,
      flow: emailFlow?.id,
    }),
    [emailFlow, isLoading, timer],
  );
}

export default useAccountEmailFlow;
