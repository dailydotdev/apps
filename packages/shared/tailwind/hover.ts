import plugin from 'tailwindcss/plugin';

// The position option exists at runtime but not in the public types.
type AddVariantInPlace = (
  name: string,
  definition: string[],
  options: { before: string[] },
) => void;

/**
 * `hover:` is hover where the primary input can hover and the pressed state
 * where it cannot. Tailwind's `future.hoverOnlyWhenSupported` is not used:
 * it also requires a fine pointer and gives touch no pressed state.
 * `group-hover` and `peer-hover` keep the core definition; a tap is the
 * only way to reveal what they reveal on touch.
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
