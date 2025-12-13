export const removeLinkTargetElement = (link: string): string => {
  const { origin, pathname, search } = new URL(link);

  return origin + pathname + search;
};

export const capitalize = (value: string): string =>
  (value && value[0].toUpperCase() + value.slice(1)) || '';

/**
 * Formats a keyword/tag value to be human-readable by removing hyphens
 * and capitalizing each word. For example: "machine-learning" -> "Machine Learning"
 * @param value - The keyword/tag value to format
 * @returns The formatted string
 */
export const formatKeyword = (value: string): string => {
  if (!value) {
    return '';
  }
  return value
    .split('-')
    .map((word) => capitalize(word))
    .join(' ');
};

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

export const pluralize = (word: string, count: number, append = 's') =>
  `${word}${count === 1 ? '' : append}`;

export const concatStrings = (
  strings: Array<string | null | undefined>,
  separator = ', ',
): string => {
  return strings.filter(Boolean).join(separator);
};
