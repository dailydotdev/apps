import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import {
  getKratosFlow,
  AuthFlow,
  ErrorData,
  KRATOS_ERROR,
} from '../lib/kratos';
import { useToastNotification } from './useToastNotification';

export function useAuthRecovery(): void {
  const router = useRouter();
  const { displayToast } = useToastNotification();

  const displayErrorMessage = (text: string) => {
    displayToast(text);
    window.history.replaceState(null, '', '/');
  };

  useQuery(
    [{ type: 'recovery', flow: router?.query.flow as string }],
    ({ queryKey: [{ flow }] }) => getKratosFlow(AuthFlow.Recovery, flow),
    {
      enabled: !!router?.query.recovery && !!router?.query.flow,
      onSuccess: (data) => {
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
      },
    },
  );
}
