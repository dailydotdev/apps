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
    if (state) {
      router?.events?.on('routeChangeStart', action);

      return () => {
        router?.events?.off('routeChangeStart', action);
      };
    }
  }, [state]);
}
