import { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import {
  AuthFlow,
  initializeKratosFlow,
  submitKratosFlow,
} from '../lib/kratos';
import { getErrorMessage, getNodeByKey, getNodeValue } from '../lib/auth';
import useTimer from './useTimer';

interface UseAccountEmail {
  sendEmail: (email: string) => Promise<unknown>;
  resendTimer: number;
  isLoading?: boolean;
  token?: string;
}

interface UseAccountEmailProps {
  isQueryEnabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onTimerFinished?: () => void;
}

type EmailFlow = AuthFlow.Recovery | AuthFlow.Verification;

function useAccountEmailFlow(
  flow: EmailFlow,
  {
    isQueryEnabled,
    onSuccess,
    onError,
    onTimerFinished,
  }: UseAccountEmailProps = {},
): UseAccountEmail {
  const [resentCount, setResentCount] = useState(0);
  const { timer, setTimer, runTimer } = useTimer(onTimerFinished, 0);

  const { data: emailFlow } = useQuery(
    [{ type: flow, sentCount: resentCount }],
    ({ queryKey: [{ type }] }) => initializeKratosFlow(type),
    { enabled: isQueryEnabled },
  );

  const { mutateAsync: sendEmail, isLoading } = useMutation(
    (email: string) =>
      submitKratosFlow({
        action: emailFlow.ui.action,
        params: {
          email,
          method: 'link',
          csrf_token: getNodeValue('csrf_token', emailFlow.ui.nodes),
        },
      }),
    {
      onSuccess: ({ error }) => {
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
        return onSuccess?.();
      },
    },
  );

  return useMemo(
    () => ({
      sendEmail,
      token: getNodeValue('csrf_token', emailFlow?.ui?.nodes),
      resendTimer: timer,
      isLoading,
    }),
    [emailFlow, isLoading, timer],
  );
}

export default useAccountEmailFlow;
