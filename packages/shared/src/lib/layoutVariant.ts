// Prerendered pages are cached per path, so the shell has to be part of the
// path: `/layout-v2/posts/[id]` mirrors the post page with the laptop shell
// (rail + floating card) in its initial HTML, for sessions the cookie below
// records as logged in on a laptop. The viewport is unknown on the server,
// so without the mirror those sessions would hydrate the header shell and
// swap it out one commit later.
export type LayoutVariant = 'v2';

export const LAYOUT_VARIANT_ROUTE_PREFIX = '/layout-v2';

// Read by the webapp's proxy to pick the mirrored route.
export const LAYOUT_VARIANT_COOKIE = 'dl_v';

// Marks MainLayout's floating card. Styling hook only: it lets content
// inside the card ask for frame-aware spacing through a plain descendant
// selector, so the spacing settles together with the card itself.
export const LAYOUT_FRAME_CLASS = 'layout-frame';

// `router.pathname` carries the mirror prefix on the mirrored route, so page
// path checks have to drop it before comparing.
export const withoutLayoutVariantPrefix = (route?: string): string => {
  if (!route?.startsWith(`${LAYOUT_VARIANT_ROUTE_PREFIX}/`)) {
    return route ?? '';
  }

  return route.slice(LAYOUT_VARIANT_ROUTE_PREFIX.length);
};
