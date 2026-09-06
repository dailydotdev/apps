export type LayoutVariant = 'v1' | 'v2';

export const LAYOUT_VARIANT_ROUTE_PREFIX = '/layout-v2';

// Read by the webapp's proxy to pick the mirrored route.
export const LAYOUT_VARIANT_COOKIE = 'dl_v';

// Marks MainLayout's v2 floating card. Styling hook only: it lets content
// inside the card ask for frame-aware spacing through a plain descendant
// selector, instead of reading a flag that resolves after mount and would
// therefore settle separately from the card itself.
export const LAYOUT_FRAME_CLASS = 'layout-frame';

// `router.pathname` carries the mirror prefix on the mirrored route, so page
// path checks have to drop it before comparing.
export const withoutLayoutVariantPrefix = (route?: string): string => {
  if (!route?.startsWith(`${LAYOUT_VARIANT_ROUTE_PREFIX}/`)) {
    return route ?? '';
  }

  return route.slice(LAYOUT_VARIANT_ROUTE_PREFIX.length);
};
