import useWindowEvents from './useWindowEvents';
import { AuthEvent, getKratosError, ErrorEvent } from '../lib/kratos';
import { useToastNotification } from './useToastNotification';

export function useAuthErrors(): void {
  const { displayToast } = useToastNotification();
  useWindowEvents<ErrorEvent>('message', AuthEvent.Error, async (e) => {
    if (!e.data?.id) {
      return;
    }

    const res = await getKratosError(e.data.id);

    if (!res?.error) {
      return;
    }

    displayToast(res.error.message);
  });
}
