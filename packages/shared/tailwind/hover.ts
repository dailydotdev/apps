import plugin from 'tailwindcss/plugin';

// The position option exists at runtime but not in the public types.
type AddVariantInPlace = (
  name: string,
  definition: string[],
  options: { before: string[] },
) => void;

/**
 * A touch screen keeps :hover on whatever lands under the last tap, so a row
 * lit up on the screen that opened under the finger. Where a pointer can
 * hover, `hover:` is hover. On touch it is the pressed state, the feedback a
 * tap needs, and nothing stays lit.
 *
 * `before` puts the variant back where the core one sits in the cascade,
 * ahead of focus and active; a redefined variant goes last otherwise and
 * would beat them. hover.spec.ts holds it there.
 */
export default plugin(({ addVariant }) => {
  (addVariant as unknown as AddVariantInPlace)(
    'hover',
    [
      '@media (hover: hover) and (pointer: fine) { &:hover }',
      '@media (hover: none), (pointer: coarse) { &:active }',
    ],
    { before: ['hover'] },
  );
});
