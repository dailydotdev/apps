import { useContext } from 'react';
import { LayoutVariantContext } from '../../contexts/LayoutVariantContext';
import { useIsHydrated } from '../useIsHydrated';
import { useViewSize, ViewSize } from '../useViewSize';

// The dual-sidebar layout (rail, page-header strip, floating card) renders at
// laptop+ only; tablet keeps SidebarTablet and the legacy header. The server
// cannot measure the viewport, so on the server and on the hydration render
// the answer is the shell the mirrored route painted (`undefined` outside the
// mirror, i.e. the header shell). That keeps the markup identical across
// hydration, so the mirror's HTML stands without a flip; every later render,
// a client-side navigation and the extension's new tab included, reads the
// viewport directly and is right on its first render. Consumers can treat
// the result as the single source of truth: no separate
// `useViewSize(ViewSize.Laptop)` check is needed at the call site.
export const useLaptopLayout = (): boolean => {
  const serverVariant = useContext(LayoutVariantContext);
  const isHydrated = useIsHydrated();
  const isLaptop = useViewSize(ViewSize.Laptop);

  return isHydrated ? isLaptop : serverVariant === 'v2';
};
