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

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (state) {
      router?.events?.on('routeChangeStart', action);

      return () => {
        router?.events?.off('routeChangeStart', action);
      };
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
}
