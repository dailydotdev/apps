import type { ReactElement } from 'react';
import React from 'react';
import type { IconProps } from '../../Icon';
import Icon from '../../Icon';
import FilledIcon from './filled.svg';

/**
 * A world seen from outside: an orb with a ring tilted across it.
 *
 * Two primitives on purpose. Drawing the place literally — the floating island
 * the renderer actually builds — does not survive this icon's size: a plateau
 * over a tapering keel is the Tesla mark, a spire added to break that symmetry
 * resolves into a four-pointed star, and enough parts to say "island" at all
 * closes into a blob by 16px, which is where this is read in the profile
 * toggle. The ring keeps the same silhouette at every size.
 *
 * One glyph rather than an outlined/filled pair, on the same reasoning the
 * world's own crest charges are drawn solid (`engine/crest.js`: "deliberately
 * blunt… interior detail is a smudge"). The orb is a separate element from the
 * ring so it fills the ring's hole where they overlap — that is what reads as
 * the ring passing behind — and so no even-odd rule spans both.
 */
export const WorldIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={FilledIcon} IconSecondary={FilledIcon} />
);
