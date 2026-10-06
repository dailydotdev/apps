export type ExtensionShowcaseMedia =
  | { type: 'video'; src: string; alt: string }
  | { type: 'image'; src: string; alt: string };

export interface ExtensionShowcaseGlow {
  color: string;
  /** Transform applied to the blob, relative to the stage center. */
  transform: string;
}

export interface ExtensionShowcaseFeature {
  id: string;
  label: string;
  /** Single-sentence value message shown above the tabs. */
  description: string;
  media: ExtensionShowcaseMedia;
  /** Tints the selected tab. */
  accent: string;
  /** The two ambient stage glows for this feature. */
  glow: [ExtensionShowcaseGlow, ExtensionShowcaseGlow];
}
