import type { ComposerKind, ComposerVariant } from './types';
import { textVariant } from './variants/text';
import { pollVariant } from './variants/poll';
import { standupVariant } from './variants/standup';

/**
 * Single source of truth for composer variants. Adding a new post type
 * is a one-file change here:
 *
 *   1. Create `composer/variants/<kind>.tsx` exporting a `ComposerVariant<'<kind>'>`
 *   2. Add `'<kind>'` to `ComposerKind` in `types.ts`
 *   3. Add the variant below.
 */
export const composerVariants: Record<ComposerKind, ComposerVariant> = {
  text: textVariant,
  poll: pollVariant,
  standup: standupVariant,
};

export const getComposerVariant = (kind: ComposerKind): ComposerVariant =>
  composerVariants[kind];
