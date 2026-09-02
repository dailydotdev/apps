export type LayoutVariant = 'v1' | 'v2';

export const LAYOUT_VARIANT_ROUTE_PREFIX = '/layout-v2';

// The webapp mirrors the post page under `/layout-v2` so the server can pick
// the shell before boot. The rewrite keeps the visible URL, but `router.route`
// and `router.pathname` carry the prefix there, so page-path checks have to
// drop it before comparing.
export const withoutLayoutVariantPrefix = (route?: string): string => {
  if (!route?.startsWith(`${LAYOUT_VARIANT_ROUTE_PREFIX}/`)) {
    return route ?? '';
  }

  return route.slice(LAYOUT_VARIANT_ROUTE_PREFIX.length);
};
