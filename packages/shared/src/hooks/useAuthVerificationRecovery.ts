import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useCallback, useContext, useEffect } from 'react';
import type { InitializationData } from '../lib/kratos';
import { AuthFlow, getKratosFlow, KRATOS_ERROR } from '../lib/kratos';
import { useToastNotification } from './useToastNotification';
import { disabledRefetch } from '../lib/func';
import AuthContext from '../contexts/AuthContext';
import { AuthTriggers } from '../lib/auth';
import { stripLinkParameters } from '../lib/links';

const getFirstQueryParam = (
  queryParam: string | string[] | undefined,
): string | undefined =>
  Array.isArray(queryParam) ? queryParam[0] : queryParam;

export function useAuthVerificationRecovery(): void {
  const router = useRouter();
  const { showLogin } = useContext(AuthContext);
  const flowId = getFirstQueryParam(router?.query.flow);
  const recoveryId = getFirstQueryParam(router?.query.recovery);
  const couldBeVerified = !!flowId && !recoveryId;
  const { displayToast } = useToastNotification();

  const displayErrorMessage = useCallback(
    (text: string) => {
      const link = stripLinkParameters(window.location.href);
      router.replace(link);
      setTimeout(() => displayToast(text), 100);
    },
    [displayToast, router],
  );

  const checkErrorMessage = useCallback(
    (data: InitializationData, flow?: AuthFlow) => {
      if (data.error) {
        displayErrorMessage(data.error.message);
        return;
      }

      const hasVerified =
        data?.state === 'passed_challenge' && flow === AuthFlow.Verification;
      if (couldBeVerified && hasVerified) {
        showLogin({ trigger: AuthTriggers.Verification });
        return;
      }

      if (!data?.ui?.messages?.length) {
        return;
      }

      const error =
        data.ui.messages.find(
          (message) => message.id === KRATOS_ERROR.INVALID_TOKEN,
        ) || data.ui.messages[0];
      displayErrorMessage(error.text);
    },
    [couldBeVerified, displayErrorMessage, showLogin],
  );

  const { data: recovery } = useQuery({
    queryKey: [{ type: 'recovery', flow: flowId ?? '' }],
    queryFn: ({ queryKey: [{ flow }] }) =>
      getKratosFlow(AuthFlow.Recovery, flow),
    enabled: !!recoveryId && !!flowId,
  });

  const { data: verification } = useQuery({
    queryKey: [{ type: 'verification', flow: flowId ?? '' }],
    queryFn: ({ queryKey: [{ flow }] }) =>
      getKratosFlow(AuthFlow.Verification, flow),
    ...disabledRefetch,
    enabled: !!flowId && !recoveryId,
  });

  useEffect(() => {
    if (!recovery && !verification) {
      return;
    }

    if (recovery) {
      checkErrorMessage(recovery);
    }

    if (verification) {
      checkErrorMessage(verification, AuthFlow.Verification);
    }
  }, [checkErrorMessage, recovery, verification]);
}
