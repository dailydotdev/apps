import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { SquadJob } from '../../../../graphql/squadJobsPerks';
import {
  isSquadItemGone,
  squadJobQueryOptions,
} from '../../../../graphql/squadJobsPerks';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  OpenLinkIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Image,
  ImageType,
} from '@dailydotdev/shared/src/components/image/Image';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { ParkedLogEvent } from '../../../../lib/log';
import { RelativeTime } from '@dailydotdev/shared/src/components/utilities/RelativeTime';
import { useSquadPageContext } from '@dailydotdev/shared/src/features/squads/SquadPageContext';
import { useSquadJobs } from '../../hooks/useSquadJobs';
import { getLinkHost, getSquadJobMeta } from '../../lib/jobsPerks';
import { getSquadJobUrl, getSquadTabUrl, SquadPageTab } from '../../lib/routes';
import { SquadPageLayout } from '../SquadPageLayout';
import { SquadSubPageHeader } from '@dailydotdev/shared/src/features/squads/components/SquadSubPageHeader';
import { VerifiedSquadBadge } from '@dailydotdev/shared/src/features/squads/components/VerifiedSquad';
import {
  SquadDetailBullets,
  SquadDetailFacts,
  SquadDetailSection,
  SquadDetailUnavailable,
} from './SquadDetail';

// The squad's public jobs board: a list anyone can browse, and a page per
// role that sends people to apply on the company's site.

const CompanyLogo = ({ className }: { className: string }): ReactElement => {
  const { squad } = useSquadPageContext();

  return (
    <Image
      src={squad.image}
      alt=""
      type={ImageType.Squad}
      className={`shrink-0 rounded-12 object-cover ${className}`}
    />
  );
};

export const SquadJobRow = ({ job }: { job: SquadJob }): ReactElement => {
  const { squad } = useSquadPageContext();
  const { logEvent } = useLogContext();
  const href = getSquadJobUrl(squad.handle, job.id);

  return (
    <li>
      <Link href={href} passHref>
        <a
          href={href}
          onClick={() =>
            logEvent({
              event_name: ParkedLogEvent.ClickSquadJob,
              target_id: job.id,
              extra: JSON.stringify({ origin: Origin.SquadPage }),
            })
          }
          className="group flex items-start gap-3 border-b border-border-subtlest-tertiary py-4"
        >
          <CompanyLogo className="size-12" />
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Typography
              type={TypographyType.Callout}
              bold
              className="group-hover:underline"
            >
              {job.title}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
            >
              {`${squad.name} · ${getSquadJobMeta(job)}`}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="flex flex-wrap items-center gap-x-2"
            >
              {!!job.salary && (
                <>
                  <span className="tabular-nums">{job.salary}</span>
                  <span aria-hidden>·</span>
                </>
              )}
              <RelativeTime dateTime={job.createdAt} />
            </Typography>
          </span>
          <ArrowIcon
            size={IconSize.Small}
            className="mt-3 shrink-0 rotate-90 text-text-quaternary group-hover:text-text-primary"
          />
        </a>
      </Link>
    </li>
  );
};

/** The Jobs tab on the squad page. */
export const SquadJobsTab = (): ReactElement => {
  const { squad } = useSquadPageContext();
  const { jobs, isPending } = useSquadJobs(squad);

  return (
    <div className="flex flex-col px-4 pb-8 pt-4 tablet:px-6 tablet:pt-6">
      <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
        {`Open roles at ${squad.name}`}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="mt-1"
      >
        {`Posted by the ${squad.name} team. You apply on their site.`}
      </Typography>
      {!isPending && !jobs.length && (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="mt-6"
        >
          No open roles right now.
        </Typography>
      )}
      <ul className="mt-4 flex flex-col">
        {jobs.map((job) => (
          <SquadJobRow key={job.id} job={job} />
        ))}
      </ul>
    </div>
  );
};

const SummaryHeader = ({
  kicker,
  description,
  facts,
  actions,
}: {
  kicker: ReactNode;
  description?: string | null;
  facts: string[];
  actions: ReactNode;
}): ReactElement => {
  const { squad } = useSquadPageContext();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <CompanyLogo className="size-14" />
        <span className="flex min-w-0 flex-col">
          <span className="flex items-center gap-1">
            <Typography type={TypographyType.Callout} bold truncate>
              {squad.name}
            </Typography>
            <VerifiedSquadBadge />
          </span>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {kicker}
          </Typography>
        </span>
      </div>
      {!!description && (
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
          className="text-pretty"
        >
          {description}
        </Typography>
      )}
      <SquadDetailFacts facts={facts} />
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    </div>
  );
};

/** A role's own page, a squad sub-page like Products or Members. */
export const SquadJobPage = ({ jobId }: { jobId: string }): ReactElement => {
  const { squad } = useSquadPageContext();
  const { logEvent } = useLogContext();
  const { data, error, isError, refetch } = useQuery(
    squadJobQueryOptions(jobId),
  );
  // A role of another squad in this squad's address is not this page's
  const isOtherSquad = !!data && data.sourceId !== squad.id;
  const job = isOtherSquad ? undefined : data;
  const isGone = isOtherSquad || (isError && isSquadItemGone(error));
  const { jobs } = useSquadJobs(squad);
  const more = jobs.filter(({ id }) => id !== jobId).slice(0, 3);
  const backUrl = getSquadTabUrl(squad.handle, SquadPageTab.Jobs);
  let title = '';
  if (job) {
    title = job.title;
  } else if (isGone) {
    title = 'Role not found';
  }

  return (
    <SquadPageLayout
      header={
        <SquadSubPageHeader
          title={title}
          backUrl={backUrl}
          backLabel="Back to Jobs"
        />
      }
    >
      <div className="flex flex-col gap-10 px-4 pb-10 pt-6 tablet:px-6">
        {!job && (isGone || isError) && (
          <SquadDetailUnavailable
            isGone={isGone}
            goneText="This role is no longer open."
            onRetry={() => refetch()}
          />
        )}
        {job && (
          <>
            <SummaryHeader
              kicker={
                <>
                  {job.team ? `${job.team} · Posted ` : 'Posted '}
                  <RelativeTime dateTime={job.createdAt} />
                </>
              }
              description={job.about}
              facts={[getSquadJobMeta(job), job.salary].filter(
                (fact): fact is string => !!fact,
              )}
              actions={
                <Button
                  tag="a"
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener nofollow"
                  variant={ButtonVariant.Primary}
                  size={ButtonSize.Small}
                  icon={<OpenLinkIcon />}
                  iconPosition={ButtonIconPosition.Right}
                  onClick={() =>
                    logEvent({
                      event_name: ParkedLogEvent.ClickSquadJobApply,
                      target_id: job.id,
                      extra: JSON.stringify({ sourceId: squad.id }),
                    })
                  }
                >
                  {getLinkHost(job.applyUrl)
                    ? `Apply on ${getLinkHost(job.applyUrl)}`
                    : 'Apply'}
                </Button>
              }
            />
            {!!job.bullets.length && (
              <SquadDetailSection title="What you’ll do">
                <SquadDetailBullets items={job.bullets} />
              </SquadDetailSection>
            )}
            {!!more.length && (
              <SquadDetailSection title={`More roles at ${squad.name}`}>
                <ul className="-mt-4 flex flex-col">
                  {more.map((item) => (
                    <SquadJobRow key={item.id} job={item} />
                  ))}
                </ul>
              </SquadDetailSection>
            )}
          </>
        )}
      </div>
    </SquadPageLayout>
  );
};
