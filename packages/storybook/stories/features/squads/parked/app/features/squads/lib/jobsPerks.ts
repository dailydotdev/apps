import type { SquadJob, SquadPerk } from '../../../graphql/squadJobsPerks';
import {
  squadJobEmploymentTypeLabel,
  SquadJobWorkplace,
} from '../../../graphql/squadJobsPerks';

/** "Remote (EU) · Full-time", the line under a role's title. */
export const getSquadJobMeta = (
  job: Pick<SquadJob, 'location' | 'workplace' | 'employmentType'>,
): string => {
  const where =
    job.workplace === SquadJobWorkplace.Hybrid
      ? `${job.location} (hybrid)`
      : job.location;

  return [where, squadJobEmploymentTypeLabel[job.employmentType]]
    .filter(Boolean)
    .join(' · ');
};

// A perk ends at the end of a calendar day in UTC, so everyone, wherever
// they are, sees the same date the editor picked
const shortDate = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

/** "2026-12-31" for a date input, from a perk's stored end. */
export const toPerkEndDateInput = (iso?: string | null): string =>
  iso ? new Date(iso).toISOString().slice(0, 10) : '';

/** The end of the picked day, in UTC, so it round-trips to the same date. */
export const fromPerkEndDateInput = (value: string): string | null =>
  value ? `${value}T23:59:59.999Z` : null;

/** "Ends Dec 31", or "No end date" for a perk that runs until removed. */
export const getSquadPerkEndsLabel = (
  perk: Pick<SquadPerk, 'endsAt'>,
): string =>
  perk.endsAt
    ? `Ends ${shortDate.format(new Date(perk.endsAt))}`
    : 'No end date';

/**
 * Codes pasted or uploaded for a unique-code perk: one per line or comma
 * separated, trimmed, empty ones and repeats dropped.
 */
export const parseSquadPerkCodes = (text: string): string[] => [
  ...new Set(
    text
      .split(/[\n,;]+/)
      .map((code) => code.trim())
      .filter(Boolean),
  ),
];

/** "coderabbit.ai" from a link, for buttons like "Apply on coderabbit.ai". */
export const getLinkHost = (url: string): string | null => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
};

/** The API takes this many codes in one call. */
export const SQUAD_PERK_CODES_BATCH = 5000;

export const chunkSquadPerkCodes = (codes: string[]): string[][] =>
  Array.from(
    { length: Math.ceil(codes.length / SQUAD_PERK_CODES_BATCH) },
    (_, index) =>
      codes.slice(
        index * SQUAD_PERK_CODES_BATCH,
        (index + 1) * SQUAD_PERK_CODES_BATCH,
      ),
  );
