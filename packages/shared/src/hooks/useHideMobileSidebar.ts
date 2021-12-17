import { useEffect } from 'react';
import { useRouter } from 'next/router';

interface UseHideMobileSidebarProps {
  state: boolean;
  action: () => unknown;
}
export default function useHideMobileSidebar({
  state,
  action,
}: UseHideMobileSidebarProps): void {
  const router = useRouter();

  useEffect(() => {
    router?.events?.on('routeChangeStart', state && action);

    return () => {
      router?.events?.off('routeChangeStart', state && action);
    };
  }, [state]);
}
