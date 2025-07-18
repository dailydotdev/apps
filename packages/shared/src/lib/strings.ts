export const removeLinkTargetElement = (link: string): string => {
  const { origin, pathname, search } = new URL(link);

  return origin + pathname + search;
};

export const capitalize = (value: string): string =>
  (value && value[0].toUpperCase() + value.slice(1)) || '';

export const anchorDefaultRel = 'noopener noreferrer';

export const checkLowercaseEquality = (
  value1: string,
  value2: string,
): boolean => value1?.toLowerCase() === value2?.toLowerCase();

/**
 * Escapes special regex characters in a string to make it safe for use in RegExp constructor.
 * This prevents regex injection attacks when user input is used in regex patterns.
 * @param str - The string to escape
 * @returns The escaped string safe for use in RegExp
 */
export const escapeRegexCharacters = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
