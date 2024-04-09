import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface Props {
  onChange: (url: string) => void;
  enabled?: boolean;
}

export function useRouterOnChange({ onChange, enabled = true }: Props): void {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(enabled);

  useEffect(() => {
    if (!router.isReady) {
      return null;
    }

    if (enabled !== isEnabled && !enabled) {
      router.events.off('routeChangeStart', onChange);
      setIsEnabled(enabled);
      return null;
    }

    setIsEnabled(enabled);

    if (enabled) {
      router.events.on('routeChangeStart', onChange);

      return () => {
        router.events.off('routeChangeStart', onChange);
      };
    }

    return null;
  }, [router, onChange, enabled, isEnabled, setIsEnabled]);
}
