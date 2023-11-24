import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import {
  AuthFlow,
  ErrorData,
  getKratosFlow,
  InitializationData,
  KRATOS_ERROR,
} from '../lib/kratos';
import { useToastNotification } from './useToastNotification';
import { disabledRefetch } from '../lib/func';
import AuthContext from '../contexts/AuthContext';
import { AuthTriggers } from '../lib/auth';
import { stripLinkParameters } from '../lib/links';

export function useAuthVerificationRecovery(): void {
  const router = useRouter();
  const { showLogin } = useContext(AuthContext);
  const couldBeVerified = !!router?.query.flow && !router?.query.recovery;
  const { displayToast } = useToastNotification();

  const displayErrorMessage = (text: string) => {
    const link = stripLinkParameters(window.location.href);
    router.replace(link);
    setTimeout(() => displayToast(text), 100);
  };

  const checkErrorMessage = (data: InitializationData, flow?: AuthFlow) => {
    if ('error' in data) {
      const errorData = data as unknown as ErrorData;
      displayErrorMessage(errorData.error.message);
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
  };

  useQuery(
    [{ type: 'recovery', flow: router?.query.flow as string }],
    ({ queryKey: [{ flow }] }) => getKratosFlow(AuthFlow.Recovery, flow),
    {
      enabled: !!router?.query.recovery && !!router?.query.flow,
      onSuccess: checkErrorMessage,
    },
  );

  useQuery(
    [{ type: 'verification', flow: router?.query.flow as string }],
    ({ queryKey: [{ flow }] }) => getKratosFlow(AuthFlow.Verification, flow),
    {
      ...disabledRefetch,
      enabled: !!router?.query.flow && !router?.query.recovery,
      onSuccess: (data) => checkErrorMessage(data, AuthFlow.Verification),
    },
  );
}
