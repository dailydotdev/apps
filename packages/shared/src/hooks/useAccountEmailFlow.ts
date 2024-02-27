import { useEffect, useMemo, useState } from 'react';
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

const FlowActionURLs: Record<EmailFlow, string> = {
  [AuthFlow.Recovery]: `${authUrl}/self-service/recovery?flow=`,
  [AuthFlow.Verification]: `${authUrl}/self-service/verification?flow=`,
};

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

  const existingEnabled = flow === AuthFlow.Verification && !flowId;

  const { data: existingFlow, isLoading: existingFlowLoading } = useQuery(
    ['existing_flow'],
    getVerificationSession,
    {
      ...disabledRefetch,
      enabled: existingEnabled,
      retry: false,
    },
  );

  useEffect(() => {
    if (existingFlow?.result?.flow_id && !activeFlow) {
      setActiveFlow(existingFlow.result.flow_id);
    }
  }, [activeFlow, existingFlow?.result?.flow_id]);

  const enabled = useMemo(() => {
    return flow === AuthFlow.Recovery
      ? true
      : !existingFlowLoading && !activeFlow && !autoResend;
  }, [flow, existingFlowLoading, activeFlow, autoResend]);

  const { data: emailFlow } = useQuery(
    [{ type: flow }],
    ({ queryKey: [{ type }] }) =>
      flowId ? getKratosFlow(flow, flowId) : initializeKratosFlow(type),
    {
      ...disabledRefetch,
      enabled,
    },
  );

  useEffect(() => {
    if (emailFlow?.id && !activeFlow) {
      setActiveFlow(emailFlow.id);
      setAutoResend(true);
    }
  }, [activeFlow, emailFlow?.id]);

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

        setActiveFlow(emailFlow.id);
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
        action: FlowActionURLs[flow] + (altFlowId ?? activeFlow),
        params: {
          code,
          method: 'code',
          ...(flow === AuthFlow.Recovery && {
            csrf_token: getNodeValue('csrf_token', emailFlow.ui.nodes),
          }),
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
      token: getNodeValue('csrf_token', emailFlow?.ui?.nodes),
      resendTimer: timer,
      isLoading,
      flow: emailFlow?.id,
      autoResend,
    }),
    [sendEmail, verifyCode, emailFlow, timer, isLoading, autoResend],
  );
}

export default useAccountEmailFlow;
