export const getNavigator = (): Navigator => {
  if (typeof navigator === 'undefined') {
    return null;
  }

  return navigator;
};
