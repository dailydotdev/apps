import type { ComponentType } from 'react';
import * as IconExports from '../icons';
import type { IconProps } from '../Icon';

export type SpotlightIcon = ComponentType<IconProps>;

// SpotlightAction.icon stores the fully-qualified export name from the
// icons barrel (e.g. "PlusIcon"). Any icon added to the barrel is
// immediately usable from a seed row — no frontend deploy.
const ICONS = IconExports as unknown as Record<string, SpotlightIcon>;

export const resolveSpotlightIcon = (name: string): SpotlightIcon =>
  ICONS[name] ?? ICONS.InfoIcon;
