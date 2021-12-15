import useMedia from './useMedia';
import { laptop } from '../styles/media';

export const footerNavBarBreakpoint = laptop;

export default function useShowSidebar(): {
  showSidebar: boolean;
} {
  const showSidebar = useMedia(
    [footerNavBarBreakpoint.replace('@media ', '')],
    [true],
    false,
  );

  return {
    showSidebar,
  };
}
