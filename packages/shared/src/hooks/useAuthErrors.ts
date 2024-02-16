import { AuthEvent, getKratosError } from '../lib/kratos';
import { useToastNotification } from './useToastNotification';
import { useEventListener } from './useEventListener';

export function useAuthErrors(): void {
  const { displayToast } = useToastNotification();

  useEventListener(globalThis, 'message', async (e) => {
    if (e.data?.eventKey !== AuthEvent.Error) {
      return;
    }

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
