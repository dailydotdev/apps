export const isKeyAlphaNumeric = (key: string): boolean => {
  const match = key.match(/^[a-z0-9]+$/i);

  return match && match[0].length === 1;
};
