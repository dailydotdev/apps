import { createContext } from 'react';
import type { LayoutVariant } from '../lib/layoutVariant';

// Set by the webapp's `/layout-v2` rewrite only; undefined everywhere else.
// It names the shell the server painted, which `useLaptopLayout` holds
// until the client has measured the viewport.
export const LayoutVariantContext = createContext<LayoutVariant | undefined>(
  undefined,
);
