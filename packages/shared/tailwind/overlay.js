const colors = require('./colors');

const overlayColor = (color) =>
  color === 'white'
    ? '#FFFFFF'
    : 'pepper'
    ? colors[color]['90']
    : colors[color]['50'];

const getOverlayPalette = (overlay) =>
  [...Object.keys(colors), 'white'].reduce(
    (acc, color) => ({ ...acc, [color]: `${overlayColor(color)}${overlay}` }),
    {},
  );

const overlay = {
  primary: 'A3',
  secondary: '66',
  tertiary: '52',
  quaternary: '3D',
};

const overlayColors = Object.keys(overlay).reduce(
  (acc, key) => ({ ...acc, [key]: getOverlayPalette(overlay[key]) }),
  {},
);

module.exports = overlayColors;
