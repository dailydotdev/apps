import { useRef } from 'react';
import useDebounceFn from './useDebounceFn';

interface UsePollingOptions {
  intervalMs: number;
  retries: number;
}

export const usePolling = (
  request: () => Promise<{ shouldResend: boolean }>,
  { intervalMs = 5000, retries = 3 }: Partial<UsePollingOptions> = {},
) => {
  const retriesRef = useRef(0);
  const [sendRequest, cancelPolling] = useDebounceFn(async () => {
    if (retriesRef.current >= retries) {
      return;
    }

    const result = await request();

    if (result?.shouldResend) {
      retriesRef.current += 1;

      sendRequest();
    }
  }, intervalMs);

  return [sendRequest, cancelPolling];
};
