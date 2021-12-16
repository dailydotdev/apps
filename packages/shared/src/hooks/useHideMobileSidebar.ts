import { useEffect } from 'react';
import { useRouter } from 'next/router';

interface UseHideMobileSidebarProps {
  action: () => unknown;
}
export default function useHideMobileSidebar({
  action,
}: UseHideMobileSidebarProps): void {
  const router = useRouter();

  useEffect(() => {
    router?.events?.on('routeChangeStart', action);

    return () => {
      router?.events?.off('routeChangeStart', action);
    };
  }, []);
}
