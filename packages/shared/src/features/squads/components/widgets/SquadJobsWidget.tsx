import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import Link from '../../../../components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { useLogContext } from '../../../../contexts/LogContext';
import { LogEvent, Origin } from '../../../../lib/log';
import { useSquadPageContext } from '../../SquadPageContext';
import { useSquadJobs } from '../../hooks/useSquadJobs';
import { getSquadJobMeta } from '../../lib/jobs';
import { getSquadJobsUrl, getSquadJobUrl } from '../../lib/routes';
import { useSquadPageTabs } from '../../SquadPageTabsContext';
import { SquadWidget } from './SquadWidget';

export const MAX_FEATURED_JOBS = 3;

// A verified squad's newest roles in the right column, so the Jobs tab gets
// seen by people who never open it. Nothing shows without a role to list.
export const SquadJobsWidget = (): ReactElement | null => {
  const { squad } = useSquadPageContext();
  const { jobs, isEnabled } = useSquadJobs(squad);
  const { openJobs, isJobsOpen } = useSquadPageTabs();
  const { logEvent } = useLogContext();

  // The Jobs tab already lists every role
  if (!isEnabled || !jobs.length || isJobsOpen) {
    return null;
  }

  const featured = jobs.slice(0, MAX_FEATURED_JOBS);
  const showAllLabel =
    jobs.length > MAX_FEATURED_JOBS
      ? `Show all ${jobs.length} jobs`
      : 'Show all jobs';

  return (
    <SquadWidget title={`Open roles at ${squad.name}`}>
      <ul className="mt-2 flex flex-col divide-y divide-border-subtlest-tertiary">
        {featured.map((job) => {
          const href = getSquadJobUrl(squad.handle, job.id);

          return (
            <li key={job.id}>
              <Link href={href} passHref>
                <a
                  href={href}
                  className="group flex flex-col gap-0.5 py-2"
                  onClick={() =>
                    logEvent({
                      event_name: LogEvent.ClickSquadJob,
                      target_id: job.id,
                      extra: JSON.stringify({
                        squad: squad.id,
                        origin: Origin.SquadJobsWidget,
                      }),
                    })
                  }
                >
                  <Typography
                    type={TypographyType.Footnote}
                    bold
                    truncate
                    className="group-hover:underline"
                  >
                    {job.title}
                  </Typography>
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                    truncate
                  >
                    {[getSquadJobMeta(job), job.salary]
                      .filter(Boolean)
                      .join(' · ')}
                  </Typography>
                </a>
              </Link>
            </li>
          );
        })}
      </ul>
      {openJobs ? (
        <Button
          type="button"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Small}
          className="mt-2"
          onClick={openJobs}
        >
          {showAllLabel}
        </Button>
      ) : (
        <Link href={getSquadJobsUrl(squad.handle)} passHref>
          <Button
            tag="a"
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
            className="mt-2"
          >
            {showAllLabel}
          </Button>
        </Link>
      )}
    </SquadWidget>
  );
};
