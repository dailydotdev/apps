import { checkExistingHandle } from '../../../graphql/squads';

// Mirrors the API's handle rule: 3 to 39 characters, a letter or digit first,
// then letters, digits or underscores.
const SQUAD_HANDLE_MIN_LENGTH = 3;
const SQUAD_HANDLE_MAX_LENGTH = 39;
const SUFFIX_ATTEMPTS = 5;

export const toSquadHandle = (name: string): string => {
  const base = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, SQUAD_HANDLE_MAX_LENGTH - SUFFIX_ATTEMPTS.toString().length - 1);

  return base.length >= SQUAD_HANDLE_MIN_LENGTH ? base : `${base || 'my'}_hq`;
};

/**
 * A free handle for a squad named `name`: the name itself, then the name with
 * a number. The API still validates it, so a race only costs a retry.
 */
export const findFreeSquadHandle = async (name: string): Promise<string> => {
  const base = toSquadHandle(name);
  const candidates = [
    base,
    ...Array.from({ length: SUFFIX_ATTEMPTS }, (_, i) => `${base}_${i + 2}`),
  ];

  for (const candidate of candidates) {
    // eslint-disable-next-line no-await-in-loop
    if (!(await checkExistingHandle(candidate))) {
      return candidate;
    }
  }

  return `${base}_${Date.now().toString(36).slice(-4)}`;
};
