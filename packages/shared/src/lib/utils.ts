export const stringToBoolean = (value: string): boolean => {
  if (typeof value !== 'string') {
    return false;
  }

  return value.toLowerCase() === 'true';
};
