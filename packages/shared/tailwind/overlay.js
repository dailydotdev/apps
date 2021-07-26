const colors = require('./colors');

const overlayColor = (color) => {
  if (color === 'white') {
    return '#FFFFFF';
  }
  if (color === 'pepper') {
    return colors[color]['90'];
  }
  return colors[color]['50'];
};

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
