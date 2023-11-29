import { useMemo } from 'react';
import { useViewSize, ViewSize } from './useViewSize';

export default function useSidebarRendered(): {
  sidebarRendered: boolean;
} {
  const sidebarRendered = useViewSize(ViewSize.Laptop);

  return useMemo(() => {
    return {
      sidebarRendered,
    };
  }, [sidebarRendered]);
}
