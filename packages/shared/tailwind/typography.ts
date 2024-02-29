import plugin from 'tailwindcss/plugin';

export default plugin(({ addUtilities }) => {
  const utils = {
    '.typo-giga1': {
      'font-size': '4.5rem',
      'line-height': '5.375rem',
    },

    '.typo-giga2': {
      'font-size': '4rem',
      'line-height': '5rem',
    },

    '.typo-giga3': {
      'font-size': '3.5rem',
      'line-height': '4.5rem',
    },

    '.typo-mega1': {
      'font-size': '3rem',
      'line-height': '3.5rem',
    },

    '.typo-mega2': {
      'font-size': '2.5rem',
      'line-height': '3rem',
    },

    '.typo-mega3': {
      'font-size': '2.25rem',
      'line-height': '2.75rem',
    },

    '.typo-large-title': {
      'font-size': '2rem',
      'line-height': '2.375rem',
    },

    '.typo-title1': {
      'font-size': '1.75rem',
      'line-height': '2.125rem',
    },

    '.typo-title2': {
      'font-size': '1.5rem',
      'line-height': '1.875rem',
    },

    '.typo-title3': {
      'font-size': '1.25rem',
      'line-height': '1.625rem',
    },

    '.typo-markdown': {
      'font-size': '1.0625rem',
      'line-height': '1.75rem',
    },

    '.typo-body': {
      'font-size': '1.0625rem',
      'line-height': '1.375rem',
    },

    '.typo-callout': {
      'font-size': '0.9375rem',
      'line-height': '1.25rem',
    },

    '.typo-subhead': {
      'font-size': '0.875rem',
      'line-height': '1.125rem',
    },

    '.typo-footnote': {
      'font-size': '0.8125rem',
      'line-height': '1.125rem',
    },

    '.typo-caption1': {
      'font-size': '0.75rem',
      'line-height': '1rem',
    },

    '.typo-caption2': {
      'font-size': '0.6875rem',
      'line-height': '1rem',
    },

    '.typo-tera': {
      'font-size': '5rem',
      'line-height': '5.375rem',
    },
  };

  addUtilities(utils);
});
