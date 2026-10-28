// Tailwind applies a `/NN` opacity modifier only when the colour string
// carries `<alpha-value>`; on a bare CSS variable, `bg-x/40` compiles to
// nothing. Wrapping the variable in a `color-mix` with that placeholder
// makes the modifier work and leaves the plain utility the same colour.
type ColorTree = { [key: string]: string | ColorTree };

const alpha = (value: string): string => {
  const variable = value.match(/^var\((--[\w-]+)\)$/)?.[1];
  if (!variable) {
    return value;
  }
  return `color-mix(in srgb, var(${variable}) calc(<alpha-value> * 100%), transparent)`;
};

export const withAlpha = <T extends ColorTree>(colors: T): T =>
  Object.fromEntries(
    Object.entries(colors).map(([key, value]) => [
      key,
      typeof value === 'string' ? alpha(value) : withAlpha(value),
    ]),
  ) as T;
