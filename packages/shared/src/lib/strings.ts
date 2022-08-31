export const isAlphaNumeric = (key: string): boolean => {
  const match = key.match(/^[a-z0-9]+$/i);

  return match && match[0].length === 1;
};

const specialCharsFormat = /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;
export const isSpecialCharacter = (key: string): boolean =>
  specialCharsFormat.test(key);

export const cleanupEmptySpaces = (text: string): string =>
  text.replaceAll?.('\xa0', ' ') || text;

export const removeLinkTargetElement = (link: string): string => {
  const { origin, pathname, search } = new URL(link);

  return origin + pathname + search;
};
