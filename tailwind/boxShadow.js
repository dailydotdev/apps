const colors = require('./colors');

const shadowColor = (color) =>
  color === 'black'
    ? '#000000'
    : 'salt'
    ? colors[color]['90']
    : colors[color]['50'];

const getShadowPalette = (shadow) =>
  [...Object.keys(colors), 'black'].reduce(
    (acc, color) => ({ ...acc, [color]: shadow(shadowColor(color)) }),
    {},
  );

const baseShadows = {
  2: (color) => `0 0.375rem 0.375rem -0.125rem ${color}66`,
  3: (color) => `0 0.875rem 0.875rem -0.375rem ${color}A3`,
};

const boxShadows = Object.keys(baseShadows).reduce(
  (acc, key) => ({ ...acc, [key]: getShadowPalette(baseShadows[key]) }),
  {},
);

module.exports = boxShadows;
