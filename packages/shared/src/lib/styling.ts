import classNames from 'classnames';

const fadedBackground =
  'relative before:absolute before:inset-0 before:w-full before:h-full before:opacity-24';

export const getFadedBackground = (className: string): string => {
  const isBefore = className.includes('before:bg-theme-');

  if (!isBefore) {
    throw new Error(
      'You must need apply the background with a `before:` class',
    );
  }

  return classNames(fadedBackground, className);
};
