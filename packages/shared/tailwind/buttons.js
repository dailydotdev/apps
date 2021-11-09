const plugin = require('tailwindcss/plugin');
const colors = require('./colors');
const boxShadow = require('./boxShadow');
const overlay = require('./overlay');

const variations = {
  primary: (color) => ({
    darkStates: {
      default: {
        color: 'var(--theme-label-invert)',
        background: color ? colors[color]['40'] : '#FFFFFF',
        'border-color': 'transparent',
      },
      hover: {
        background: color ? colors[color]['30'] : colors.salt['50'],
        'box-shadow': color ? boxShadow[`3-${color}`] : 'var(--theme-shadow3)',
      },
      active: {
        background: color ? colors[color]['10'] : colors.salt['90'],
        'box-shadow': color ? boxShadow[`2-${color}`] : 'var(--theme-shadow2)',
      },
      pressed: {
        color: 'var(--theme-label-primary)',
        background: 'none',
        'border-color': 'var(--theme-label-primary)',
      },
      disabled: {
        background: color
          ? `${colors[color]['10']}33`
          : `${colors.salt['90']}33`,
      },
    },
    lightStates: {
      default: {
        background: color ? colors[color]['60'] : colors.pepper['90'],
      },
      hover: {
        background: color ? colors[color]['70'] : colors.pepper['50'],
      },
      active: {
        background: color ? colors[color]['90'] : colors.pepper['10'],
      },
      disabled: {
        background: color
          ? `${colors[color]['90']}33`
          : `${colors.pepper['10']}33`,
      },
    },
  }),
  secondary: (color) => ({
    darkStates: {
      default: {
        color: 'var(--theme-label-primary)',
        background: 'none',
        'border-color': 'var(--theme-label-primary)',
      },
      hover: {
        color: color ? colors[color]['40'] : undefined,
        background: color
          ? overlay.quaternary[color]
          : `${colors.salt['90']}1F`,
        'border-color': color ? colors[color]['40'] : undefined,
        'box-shadow': color ? boxShadow[`3-${color}`] : 'var(--theme-shadow3)',
      },
      active: {
        color: color ? colors[color]['40'] : undefined,
        background: color ? overlay.tertiary[color] : `${colors.salt['90']}33`,
        'border-color': color ? colors[color]['40'] : undefined,
        'box-shadow': color ? boxShadow[`2-${color}`] : 'var(--theme-shadow2)',
      },
      pressed: {
        color: 'var(--theme-label-invert)',
        background: color ? colors[color]['40'] : '#FFFFFF',
        'border-color': 'transparent',
      },
      disabled: {
        'border-color': `${colors.salt['90']}33`,
        color: 'var(--theme-label-disabled)',
      },
    },
    lightStates: {
      hover: {
        color: color ? colors[color]['60'] : undefined,
        background: color
          ? overlay.quaternary[color]
          : `${colors.pepper['10']}1F`,
        'border-color': color ? colors[color]['60'] : undefined,
      },
      active: {
        color: color ? colors[color]['60'] : undefined,
        background: color
          ? overlay.tertiary[color]
          : `${colors.pepper['10']}33`,
        'border-color': color ? colors[color]['60'] : undefined,
      },
      pressed: {
        background: color ? colors[color]['60'] : colors.pepper['90'],
      },
      disabled: {
        'border-color': `${colors.pepper['10']}33`,
      },
    },
  }),
  tertiary: (color) => ({
    darkStates: {
      default: {
        color: 'var(--theme-label-tertiary)',
        background: 'none',
        'border-color': 'transparent',
      },
      hover: {
        color: color ? colors[color]['40'] : 'var(--theme-label-primary)',
        background: color
          ? overlay.quaternary[color]
          : `${colors.salt['90']}1F`,
      },
      active: {
        color: color ? overlay.tertiary[color] : 'var(--theme-label-primary)',
        background: color
          ? `${colors[color]['10']}33`
          : `${colors.salt['90']}33`,
      },
      pressed: {
        color: color ? colors[color]['40'] : 'var(--theme-label-primary)',
      },
      disabled: {
        color: 'var(--theme-label-disabled)',
      },
    },
    lightStates: {
      hover: {
        color: color ? colors[color]['60'] : undefined,
        background: color
          ? overlay.quaternary[color]
          : `${colors.pepper['10']}1F`,
      },
      active: {
        color: color ? colors[color]['60'] : undefined,
        background: color
          ? overlay.tertiary[color]
          : `${colors.pepper['10']}33`,
      },
      pressed: {
        color: color ? colors[color]['60'] : undefined,
      },
    },
  }),
  tertiaryFloat: (color) => {
    const states = variations.tertiary(color);
    states.darkStates.default.background = 'var(--theme-float)';
    return states;
  },
  tag: (color) => {
    const states = variations.tertiaryFloat(color);
    states.darkStates.default.color = 'var(--theme-label-primary)';
    states.darkStates.default.icon = 'var(--theme-label-secondary)';
    states.darkStates.hover.icon = 'var(--theme-label-primary)';
    return states;
  },
  tagBlocked: (color) => {
    const states = variations.tag(color);
    states.darkStates.default.color = 'var(--theme-label-secondary)';
    states.darkStates.hover.color = 'var(--theme-label-primary)';
    states.darkStates.default.icon = 'var(--theme-label-secondary)';
    states.darkStates.hover.icon = 'var(--theme-status-error)';
    states.darkStates.active.icon = 'var(--theme-status-error)';
    return states;
  },
};

const statesToCssInJs = (states) =>
  Object.keys(states).reduce(
    (acc, state) => ({
      ...acc,
      ...Object.keys(states[state]).reduce(
        (acc2, prop) => ({
          ...acc2,
          [`--button-${state}-${prop}`]: states[state][prop],
        }),
        {},
      ),
    }),
    {},
  );

const styleToCssInJs = (style) => ({
  '&, .light .invert &': statesToCssInJs(style.darkStates),
  '.light &, .invert &': statesToCssInJs(style.lightStates),
  '@media (prefers-color-scheme: dark)': {
    '.auto .invert &': statesToCssInJs(style.lightStates),
  },
  '@media (prefers-color-scheme: light)': {
    '.auto &': statesToCssInJs(style.lightStates),
    '.auto .invert &': statesToCssInJs(style.darkStates),
  },
});

const variationToStyles = (variation) => ({
  [`.btn-${variation}`]: styleToCssInJs(variations[variation]()),
  ...Object.keys(colors).reduce(
    (acc, color) => ({
      ...acc,
      [`.btn-${variation}-${color}`]: styleToCssInJs(
        variations[variation](color),
      ),
    }),
    {},
  ),
});

module.exports = plugin(({ addComponents }) => {
  const buttons = Object.keys(variations).reduce(
    (acc, variation) => ({
      ...acc,
      ...variationToStyles(variation),
    }),
    {},
  );
  addComponents(buttons);
});
