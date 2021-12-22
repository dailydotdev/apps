import { useMemo } from 'react';
import useMedia from './useMedia';
import { laptop } from '../styles/media';

export const footerNavBarBreakpoint = laptop;

export default function useSidebarRendered(): {
  sidebarRendered: boolean;
} {
  const sidebarRendered = useMedia(
    [footerNavBarBreakpoint.replace('@media ', '')],
    [true],
    false,
    null,
  );

  return useMemo(() => {
    return {
      sidebarRendered,
    };
  }, [sidebarRendered]);
}
