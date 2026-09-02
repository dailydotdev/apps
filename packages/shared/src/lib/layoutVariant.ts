export type LayoutVariant = 'v1' | 'v2';

export const LAYOUT_VARIANT_ROUTE_PREFIX = '/layout-v2';

// Read by the webapp's proxy to pick the mirrored route.
export const LAYOUT_VARIANT_COOKIE = 'dl_v';

// `router.pathname` carries the mirror prefix on the mirrored route, so page
// path checks have to drop it before comparing.
export const withoutLayoutVariantPrefix = (route?: string): string => {
  if (!route?.startsWith(`${LAYOUT_VARIANT_ROUTE_PREFIX}/`)) {
    return route ?? '';
  }

  return route.slice(LAYOUT_VARIANT_ROUTE_PREFIX.length);
};
