import { createContext } from 'react';
import type { LayoutVariant } from '../lib/layoutVariant';

// Set by the webapp's `/layout-v2` rewrite only; undefined everywhere else.
export const LayoutVariantContext = createContext<LayoutVariant | undefined>(
  undefined,
);
