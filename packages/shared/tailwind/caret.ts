// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import plugin from 'tailwindcss/plugin';

const generateColors = (colors, prefix) =>
  Object.keys(colors).reduce((acc, key) => {
    if (typeof colors[key] === 'string') {
      return {
        ...acc,
        [`${prefix}-${key}`]: {
          'caret-color': colors[key],
        },
      };
    }

    const innerColors = generateColors(colors[key], `${prefix}-${key}`);

    return {
      ...acc,
      ...innerColors,
    };
  }, {});

export default plugin(({ addUtilities, theme }) => {
  const colors = theme('colors');
  const caretColors = generateColors(colors, `.caret`);
  addUtilities(caretColors);
});
