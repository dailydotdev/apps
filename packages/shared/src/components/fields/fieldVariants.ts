/**
 * Field background treatment. Both variants share the faint resting border that
 * lives on `BaseField`, so every field is delineated; the variant only swaps
 * the fill — mirroring the button system's filled vs. ghost split.
 */
export enum FieldVariant {
  /** Floated surface — a subtle opacity fill over the page (the default). */
  Filled = 'filled',
  /**
   * Transparent — the field takes the page background and is defined by its
   * border alone, with a faint fill on hover. Mirrors the Subtle/Secondary
   * button look.
   */
  Outline = 'outline',
}

export const fieldVariantToClassName: Record<FieldVariant, string> = {
  [FieldVariant.Filled]: 'bg-surface-float',
  [FieldVariant.Outline]: '!bg-transparent hover:!bg-surface-hover',
};
