import plugin from 'tailwindcss/plugin';

// The position option exists at runtime but not in the public types.
type AddVariantInPlace = (
  name: string,
  definition: string[],
  options: { before: string[] },
) => void;

/**
 * A touch screen keeps :hover on whatever lands under the last tap. Where
 * the primary input can hover, `hover:` is hover. Where it cannot, it is
 * the pressed state, the feedback a tap needs, and nothing stays lit. The
 * split is on `hover` alone, so a device that reports hover keeps it
 * whatever its pointer.
 *
 * `before` puts the variant back where the core one sits in the cascade,
 * ahead of focus and active; a redefined variant goes last otherwise and
 * would beat them. hover.spec.ts holds it there.
 */
export default plugin(({ addVariant }) => {
  (addVariant as unknown as AddVariantInPlace)(
    'hover',
    ['@media (hover: hover) { &:hover }', '@media (hover: none) { &:active }'],
    { before: ['hover'] },
  );
});
