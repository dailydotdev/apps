import type { SquadJob } from '../../../graphql/squadJobs';
import {
  squadJobEmploymentTypeLabel,
  SquadJobWorkplace,
} from '../../../graphql/squadJobs';

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
