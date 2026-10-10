import colors from './colors';

const shadowColor = (color) => {
  if (color === 'black') {
    return '#000000';
  }
  if (color === 'salt') {
    return colors[color]['90'];
  }
  return colors[color]['50'];
};

const getShadowPalette = (key, shadow) =>
  [...Object.keys(colors), 'black'].reduce(
    (acc, color) => ({
      ...acc,
      [`${key}-${color}`]: shadow(shadowColor(color)),
    }),
    {},
  );

const baseShadows = {
  2: (color) => `0 0.375rem 0.375rem -0.125rem ${color}66`,
  3: (color) => `0 0.875rem 0.875rem -0.375rem ${color}A3`,
  bubble: (color) => `0 0 1.25rem 0 ${color}B3`,
};

const boxShadows = Object.keys(baseShadows).reduce(
  (acc, key) => ({ ...acc, ...getShadowPalette(key, baseShadows[key]) }),
  {},
);

export default {
  ...boxShadows,
  none: 'none',
  2: 'var(--theme-shadow2)',
  3: 'var(--theme-shadow3)',
};
