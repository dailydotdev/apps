import { useContext } from 'react';
import { LayoutVariantContext } from '../../contexts/LayoutVariantContext';
import { laptop } from '../../styles/media';
import { useMediaClient } from '../useMedia';

const laptopQueries = [laptop.replace('@media ', '')];
const laptopValues = [true];

// The dual-sidebar layout (rail, page-header strip, floating card) renders at
// laptop+ only; tablet keeps SidebarTablet and the legacy header. The server
// cannot measure the viewport, so until the client has, the answer is the
// shell the mirrored route painted (`undefined` outside the mirror, i.e. the
// header shell). That keeps the server and the first client render in
// agreement, so the mirror's HTML stands without a flip and everywhere else
// the laptop chrome arrives on the first commit after mount. Consumers can
// treat the result as the single source of truth: no separate
// `useViewSize(ViewSize.Laptop)` check is needed at the call site.
export const useLaptopLayout = (): boolean => {
  const serverVariant = useContext(LayoutVariantContext);
  const isLaptop = useMediaClient(laptopQueries, laptopValues, false);

  if (isLaptop === undefined) {
    return serverVariant === 'v2';
  }

  return isLaptop;
};
