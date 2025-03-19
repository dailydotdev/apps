import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AuthFlow,
  getKratosFlow,
  getVerificationSession,
  initializeKratosFlow,
  submitKratosFlow,
} from '../lib/kratos';
import type { VerifyEmail } from '../lib/auth';
import { getErrorMessage, getNodeByKey, getNodeValue } from '../lib/auth';
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
  isVerifyingCode: boolean;
}

interface UseAccountEmailProps {
  flow: EmailFlow;
  flowId?: string;
  onSuccess?: (email, id) => void;
  onVerifyCodeSuccess?: () => void;
  onError?: (error: string) => void;
  onTimerFinished?: () => void;
  timerOnLoad?: number;
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
  timerOnLoad = 0,
}: UseAccountEmailProps): UseAccountEmail {
  const [activeFlow, setActiveFlow] = useState(flowId);
  const [autoResend, setAutoResend] = useState(false);
  const { timer, setTimer, runTimer } = useTimer(onTimerFinished, timerOnLoad);
  const client = useQueryClient();

  const existingEnabled = flow === AuthFlow.Verification && !flowId;

  const { data: existingFlow, isPending: existingFlowLoading } = useQuery({
    queryKey: ['existing_flow'],
    queryFn: getVerificationSession,
    ...disabledRefetch,
    enabled: existingEnabled,
    retry: false,
  });

  useEffect(() => {
    if (existingFlow?.result?.flow_id && !activeFlow) {
      setActiveFlow(existingFlow.result.flow_id);
    }
  }, [activeFlow, existingFlow?.result?.flow_id]);

  const enabled = useMemo(() => {
    return [AuthFlow.Recovery, AuthFlow.Verification].includes(flow)
      ? true
      : !existingFlowLoading && !activeFlow && !autoResend;
  }, [flow, existingFlowLoading, activeFlow, autoResend]);

  const { data: emailFlow } = useQuery({
    queryKey: [{ type: flow }],
    queryFn: ({ queryKey: [{ type }] }) =>
      flowId ? getKratosFlow(flow, activeFlow) : initializeKratosFlow(type),
    ...disabledRefetch,
    enabled,
  });

  useEffect(() => {
    if (emailFlow?.id && !activeFlow) {
      setActiveFlow(emailFlow.id);
      setAutoResend(true);
    }
  }, [activeFlow, emailFlow?.id]);

  const { mutateAsync: sendEmail, isPending: isLoading } = useMutation({
    mutationFn: (email: string) => {
      return initializeKratosFlow(flow).then((verifyFlow) => {
        // Manually set query flow as active flow
        client.setQueryData([{ type: flow }], verifyFlow);
        return submitKratosFlow({
          action: verifyFlow.ui.action,
          params: {
            email,
            method: 'code',
            csrf_token: getNodeValue('csrf_token', verifyFlow.ui.nodes),
          },
        });
      });
    },
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
  });

  const { mutateAsync: verifyCode, isPending: isVerifyingCode } = useMutation({
    mutationFn: ({ code, altFlowId }: { code: string; altFlowId?: string }) =>
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

    onSuccess: ({ error }) => {
      if (error) {
        const requestError = getErrorMessage(error.ui.messages);
        if (requestError) {
          return onError?.(requestError);
        }
      }

      return onVerifyCodeSuccess?.();
    },
  });

  return useMemo(
    () => ({
      sendEmail,
      verifyCode,
      token: getNodeValue('csrf_token', emailFlow?.ui?.nodes),
      resendTimer: timer,
      isLoading,
      flow: emailFlow?.id,
      autoResend,
      isVerifyingCode,
    }),
    [
      sendEmail,
      verifyCode,
      emailFlow,
      timer,
      isLoading,
      autoResend,
      isVerifyingCode,
    ],
  );
}

export default useAccountEmailFlow;
