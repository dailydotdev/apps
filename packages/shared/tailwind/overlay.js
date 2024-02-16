const colors = require('./colors');

const overlayColor = (color) => {
  if (color === 'white') {
    return '#FFFFFF';
  }
  if (color === 'black') {
    return '#000000';
  }
  if (color === 'pepper') {
    return colors[color]['90'];
  }
  if (color === 'salt') {
    return colors[color]['90'];
  }

  return colors[color]['50'];
};

const getOverlayPalette = (overlay) =>
  [...Object.keys(colors), 'white', 'black'].reduce(
    (acc, color) => ({ ...acc, [color]: `${overlayColor(color)}${overlay}` }),
    {},
  );

const overlay = {
  primary: 'A3',
  secondary: '66',
  tertiary: '52',
  quaternary: '3D',
  active: '29',
  float: '14',
};

const overlayColors = Object.keys(overlay).reduce(
  (acc, key) => ({ ...acc, [key]: getOverlayPalette(overlay[key]) }),
  {},
);

module.exports = overlayColors;
