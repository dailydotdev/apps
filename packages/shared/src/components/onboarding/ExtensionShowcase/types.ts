import type { ReactElement } from 'react';

export type ExtensionShowcaseMedia =
  | {
      type: 'video';
      src: string;
      poster?: string;
      alt?: string;
    }
  | {
      type: 'image';
      src: string;
      retinaSrc?: string;
      alt?: string;
    };

export interface ExtensionShowcaseFeature {
  /** Stable identifier, also used for tracking. */
  id: string;
  /** Short label shown in the left dock / mobile tab strip. */
  label: string;
  /** Icon rendered in the dock. Should accept `secondary` and `className`. */
  icon: ReactElement;
  /** Detail panel heading. */
  title: string;
  /** Detail panel body copy. */
  description: string;
  /** Right-side media. Video is autoplayed muted/looped; image supports retina. */
  media?: ExtensionShowcaseMedia;
}
