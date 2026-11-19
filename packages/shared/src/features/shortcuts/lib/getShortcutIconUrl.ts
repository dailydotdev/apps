import { apiUrl } from '../../../lib/config';

// `fallback=none` makes the API answer an unknown site with an empty 404
// instead of Google's grey globe, so the caller's `onError` fallback shows.
export const getShortcutIconUrl = (url: string, size: number): string =>
  `${apiUrl}/icon?url=${encodeURIComponent(url)}&size=${size}&fallback=none`;
