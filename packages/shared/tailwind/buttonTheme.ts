type StateProps = Record<string, string | undefined>;

export type StateBlock = {
  default?: StateProps;
  hover?: StateProps;
  active?: StateProps;
  pressed?: StateProps;
  disabled?: StateProps;
};

export type VariationStates = {
  darkStates: StateBlock;
  lightStates: StateBlock;
};

type StyleMap = Record<string, string>;
type NestedRule = Record<string, StyleMap | Record<string, StyleMap>>;

interface ButtonThemeOptions {
  // Public custom property prefix read by the button CSS, e.g. `--button`.
  varPrefix: string;
  // Private prefix holding each class's per-theme values, e.g. `--btn`.
  sourcePrefix: string;
  classes: Array<[className: string, style: VariationStates]>;
}

const stateEntries = (states: StateBlock): Array<[string, string]> =>
  (Object.keys(states) as Array<keyof StateBlock>).flatMap((state) => {
    const props = states[state];
    if (!props) {
      return [];
    }
    return Object.keys(props)
      .filter((prop) => props[prop] !== undefined)
      .map((prop): [string, string] => [`${state}-${prop}`, props[prop]!]);
  });

/**
 * Emits the theme-aware `--{varPrefix}-{state}-{prop}` tokens of every
 * button class.
 *
 * Each class declares its dark and light values once, under private
 * `--{sourcePrefix}-d-*` / `--{sourcePrefix}-l-*` names. Classes sharing the
 * same set of tokens then share one set of theme rules that point the public
 * names at the dark or light values. Those rules keep the selectors,
 * specificity and order the per-class rules had (`.light`, `.invert`, and
 * the `.auto` media queries), so every theme resolves as before.
 */
export const buttonThemeStyles = ({
  varPrefix,
  sourcePrefix,
  classes,
}: ButtonThemeOptions): [
  Record<string, StyleMap>,
  Record<string, NestedRule>,
] => {
  const values: Record<string, StyleMap> = {};
  const groups: Array<{
    signature: string;
    classes: string[];
    dark: string[];
    light: string[];
  }> = [];

  classes.forEach(([className, style]) => {
    const dark = stateEntries(style.darkStates);
    const light = stateEntries(style.lightStates);
    if (!dark.length && !light.length) {
      return;
    }
    values[`.${className}`] = Object.fromEntries([
      ...dark.map(([key, value]) => [`${sourcePrefix}-d-${key}`, value]),
      ...light.map(([key, value]) => [`${sourcePrefix}-l-${key}`, value]),
    ]);
    const darkKeys = dark.map(([key]) => key);
    const lightKeys = light.map(([key]) => key);
    const signature = `${darkKeys.join()}|${lightKeys.join()}`;
    // Only consecutive classes share rules, so an element carrying two
    // button classes still resolves in the original cascade order.
    const last = groups[groups.length - 1];
    if (last?.signature === signature) {
      last.classes.push(className);
      return;
    }
    groups.push({
      signature,
      classes: [className],
      dark: darkKeys,
      light: lightKeys,
    });
  });

  const themeMap = (keys: string[], theme: 'd' | 'l'): StyleMap =>
    Object.fromEntries(
      keys.map((key) => [
        `${varPrefix}-${key}`,
        `var(${sourcePrefix}-${theme}-${key})`,
      ]),
    );

  const themes: Record<string, NestedRule> = {};
  groups.forEach((group) => {
    const selector =
      group.classes.length === 1
        ? `.${group.classes[0]}`
        : `:is(${group.classes.map((name) => `.${name}`).join(', ')})`;
    const dark = themeMap(group.dark, 'd');
    const light = themeMap(group.light, 'l');
    themes[selector] = {
      '&, .light .invert &': dark,
      '.light &, .invert &': light,
      '@media (prefers-color-scheme: dark)': {
        '.auto .invert &': light,
      },
      '@media (prefers-color-scheme: light)': {
        '.auto &': light,
        '.auto .invert &': dark,
      },
    };
  });

  // Two objects, as a class's values and its theme rules share a selector.
  return [values, themes];
};
