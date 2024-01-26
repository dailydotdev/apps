import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  AuthFlow,
  getKratosFlow,
  getVerificationSession,
  initializeKratosFlow,
  submitKratosFlow,
} from '../lib/kratos';
import {
  getErrorMessage,
  getNodeByKey,
  getNodeValue,
  ValidateChangeEmail,
  VerifyEmail,
} from '../lib/auth';
import useTimer from './useTimer';
import { disabledRefetch } from '../lib/func';
import { authUrl } from '../lib/constants';

interface UseAccountEmail {
  sendEmail: (email: string) => Promise<unknown>;
  verifyCode: ({
    code,
    altFlowId,
  }: {
    code: string;
    altFlowId?: string;
  }) => Promise<unknown>;
  resendTimer: number;
  isLoading?: boolean;
  token?: string;
  flow?: string;
  autoResend?: boolean;
}

interface UseAccountEmailProps {
  flow: EmailFlow;
  flowId?: string;
  onSuccess?: (email, id) => void;
  onVerifyCodeSuccess?: () => void;
  onError?: (error: string) => void;
  onTimerFinished?: () => void;
}

type EmailFlow = AuthFlow.Recovery | AuthFlow.Verification;

function useAccountEmailFlow({
  flow,
  flowId,
  onSuccess,
  onVerifyCodeSuccess,
  onError,
  onTimerFinished,
}: UseAccountEmailProps): UseAccountEmail {
  const [activeFlow, setActiveFlow] = useState(flowId);

  const [autoResend, setAutoResend] = useState(false);
  const { timer, setTimer, runTimer } = useTimer(onTimerFinished, 0);

  const { data: existingFlow, isLoading: existingFlowLoading } = useQuery(
    ['existing_flow'],
    getVerificationSession,
    {
      ...disabledRefetch,
      enabled: !flowId,
      retry: false,
    },
  );

  if (existingFlow?.result?.flow_id && !activeFlow) {
    setActiveFlow(existingFlow.result.flow_id);
  }

  const { data: emailFlow } = useQuery(
    [{ type: flow }],
    ({ queryKey: [{ type }] }) =>
      flowId ? getKratosFlow(flow, flowId) : initializeKratosFlow(type),
    {
      ...disabledRefetch,
      enabled: !existingFlowLoading && !activeFlow && !autoResend,
    },
  );

  if (emailFlow?.id && !activeFlow) {
    setActiveFlow(emailFlow.id);
    setAutoResend(true);
  }

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

        setAutoResend(false);
        setTimer(60);
        runTimer();
        return onSuccess?.(variables, emailFlow.id);
      },
    },
  );

  const { mutateAsync: verifyCode } = useMutation(
    ({ code, altFlowId }: { code: string; altFlowId?: string }) =>
      submitKratosFlow({
        action: `${authUrl}/self-service/verification?flow=${
          altFlowId ?? activeFlow
        }`,
        params: {
          code,
          method: 'code',
        },
      } as VerifyEmail),
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
      token: '',
      resendTimer: timer,
      isLoading,
      flow: '',
      autoResend,
    }),
    [isLoading, timer, autoResend, verifyCode, sendEmail],
  );
}

export default useAccountEmailFlow;
