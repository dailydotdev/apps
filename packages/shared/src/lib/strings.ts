import { v4 as uuidv4 } from 'uuid';

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

/**
 * Generates a display name from an email address.
 * Extracts the local part (before @), replaces dots/underscores with spaces,
 * and capitalizes each word.
 *
 * @example
 * generateNameFromEmail('john.doe@gmail.com') // 'John Doe'
 * generateNameFromEmail('x@test.com') // 'User abc123' (fallback for unusable)
 */
export const generateNameFromEmail = (
  email: string,
  entity = 'User',
): string => {
  const fallbackName = `${entity} ${uuidv4().slice(0, 8)}`;

  if (!email || !email.includes('@')) {
    return fallbackName;
  }

  const localPart = email.split('@')[0];

  // Replace common separators with spaces
  const withSpaces = localPart.replace(/[._-]/g, ' ');

  // Remove any remaining non-alphanumeric characters except spaces
  const cleaned = withSpaces.replace(/[^a-zA-Z0-9 ]/g, '').trim();

  // If the cleaned result is too short or just numbers, use fallback
  if (cleaned.length < 2 || /^\d+$/.test(cleaned)) {
    return fallbackName;
  }

  // Capitalize each word
  const capitalized = cleaned
    .split(' ')
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return capitalized || fallbackName;
};
