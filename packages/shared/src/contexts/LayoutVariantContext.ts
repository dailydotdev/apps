import { createContext } from 'react';
import type { LayoutVariant } from '../lib/layoutVariant';

// Set only when the request was resolved to a shell before render (the
// webapp's `/layout-v2` rewrite). Everywhere else it stays undefined and
// `useLayoutVariant` evaluates the flag on the client as before.
export const LayoutVariantContext = createContext<LayoutVariant | undefined>(
  undefined,
);
