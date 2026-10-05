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

const shortDate = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

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
