import type { RecursiveKeyValuePair } from 'tailwindcss/types/config';

type OpacityArgs = { opacityValue?: string };
type ColorLeaf = string | ((args: OpacityArgs) => string);

export type ColorTree = { [key: string]: string | ColorTree };
type AlphaColorTree = { [key: string]: ColorLeaf | AlphaColorTree };

// Theme tokens are defined as `var(--theme-*)` strings, which Tailwind cannot
// inject an alpha channel into — opacity modifiers like `bg-surface-float/40`
// silently produce no CSS at all. Converting each var() leaf into a function
// color lets Tailwind delegate the alpha to us, and `color-mix()` (already the
// codebase-wide pattern in base.css) applies it at paint time, so the modifier
// stays theme-aware. Without a modifier Tailwind passes `var(--tw-*-opacity)`
// (defaulting to 1), which color-mix resolves to the unmodified color.
const toAlphaCapable = (value: string): ColorLeaf => {
  if (!value.startsWith('var(')) {
    return value;
  }

  return ({ opacityValue }: OpacityArgs) => {
    if (opacityValue === undefined) {
      return value;
    }
    return `color-mix(in srgb, ${value} calc(${opacityValue} * 100%), transparent)`;
  };
};

const mapTree = (tree: ColorTree): AlphaColorTree =>
  Object.fromEntries(
    Object.entries(tree).map(([key, value]) => [
      key,
      typeof value === 'string' ? toAlphaCapable(value) : mapTree(value),
    ]),
  );

// Tailwind v3 accepts function colors at runtime (the documented escape hatch
// for CSS-variable colors), but its published `Config` types only allow string
// leaves — hence the cast.
export const withAlpha = (tree: ColorTree): RecursiveKeyValuePair<string> =>
  mapTree(tree) as unknown as RecursiveKeyValuePair<string>;
