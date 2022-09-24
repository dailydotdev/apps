import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import {
  getKratosFlow,
  AuthFlow,
  ErrorData,
  KRATOS_ERROR,
  InitializationData,
} from '../lib/kratos';
import { useToastNotification } from './useToastNotification';

export function useAuthVerificationRecovery(): void {
  const router = useRouter();
  const { displayToast } = useToastNotification();

  const displayErrorMessage = (text: string) => {
    const { origin, pathname } = new URL(window.location.href);
    router.replace(origin + pathname);
    setTimeout(() => displayToast(text), 100);
  };

  const checkErrorMessage = (data: InitializationData) => {
    if ('error' in data) {
      const errorData = data as unknown as ErrorData;
      displayErrorMessage(errorData.error.message);
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
      enabled: !!router?.query.verification && !!router?.query.flow,
      onSuccess: checkErrorMessage,
    },
  );
}
