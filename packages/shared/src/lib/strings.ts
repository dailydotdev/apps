export const isAlphaNumeric = (key: string): boolean => {
  const match = key.match(/^[a-z0-9\s]+$/i);

  return match && match[0].length === 1;
};

const specialCharsFormat = /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;
export const isSpecialCharacter = (key: string): boolean =>
  specialCharsFormat.test(key);
