import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { SquadJob } from '../../../../graphql/squadJobs';
import {
  isSquadJobGone,
  squadJobQueryOptions,
} from '../../../../graphql/squadJobs';
import { SourcePermissions } from '../../../../graphql/sources';
import { verifyPermission } from '../../../../graphql/squads';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  ArrowIcon,
  OpenLinkIcon,
  PlusIcon,
} from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { Image, ImageType } from '../../../../components/image/Image';
import Link from '../../../../components/utilities/Link';
import { RelativeTime } from '../../../../components/utilities/RelativeTime';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { useLogContext } from '../../../../contexts/LogContext';
import { LogEvent, Origin } from '../../../../lib/log';
import { getDomainFromUrl } from '../../../../lib/links';
import { useSquadPageContext } from '../../SquadPageContext';
import { useSquadJobs } from '../../hooks/useSquadJobs';
import { hasSquadFeature } from '../../lib/features';
import { getSquadJobMeta } from '../../lib/jobs';
import {
  getSquadJobFormUrl,
  getSquadJobsUrl,
  getSquadJobUrl,
} from '../../lib/routes';
import { SquadPageLayout } from '../SquadPageLayout';
import { SquadSubPageHeader } from '../SquadSubPageHeader';
import { VerifiedSquadBadge } from '../VerifiedSquad';

// A verified squad's public jobs board: a tab anyone can browse, and a page
// per role that sends people to apply on the company's site.

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

const SquadJobRow = ({ job }: { job: SquadJob }): ReactElement => {
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
              event_name: LogEvent.ClickSquadJob,
              target_id: job.id,
              extra: JSON.stringify({
                squad: squad.id,
                origin: Origin.SquadPage,
              }),
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
  const canEdit = verifyPermission(squad, SourcePermissions.Edit);

  return (
    <div className="flex flex-col px-4 pb-8 pt-4 tablet:px-6 tablet:pt-6">
      <div className="flex items-start gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
            {`Open roles at ${squad.name}`}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {`Posted by the ${squad.name} team. You apply on their site.`}
          </Typography>
        </div>
        {canEdit && (
          <Link href={getSquadJobFormUrl(squad.handle)} passHref>
            <Button
              tag="a"
              variant={ButtonVariant.Subtle}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
            >
              Add role
            </Button>
          </Link>
        )}
      </div>
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

const DetailSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactElement;
}): ReactElement => (
  <section className="flex flex-col gap-4">
    <div className="flex items-center gap-4">
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Title3}
        bold
        className="shrink-0"
      >
        {title}
      </Typography>
      <span aria-hidden className="h-px flex-1 bg-border-subtlest-tertiary" />
    </div>
    {children}
  </section>
);

const JobSummary = ({ job }: { job: SquadJob }): ReactElement => {
  const { squad } = useSquadPageContext();
  const { logEvent } = useLogContext();
  const host = getDomainFromUrl(job.applyUrl);
  const facts = [getSquadJobMeta(job), job.salary].filter(
    (fact): fact is string => !!fact,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <CompanyLogo className="size-14" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex min-w-0 items-center gap-1">
            <Typography
              type={TypographyType.Callout}
              bold
              truncate
              className="min-w-0 shrink"
            >
              {squad.name}
            </Typography>
            {hasSquadFeature(squad, 'verified') && <VerifiedSquadBadge />}
          </span>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {job.team ? `${job.team} · Posted ` : 'Posted '}
            <RelativeTime dateTime={job.createdAt} />
          </Typography>
        </span>
      </div>
      {!!job.about && (
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
          className="whitespace-pre-line text-pretty break-words"
        >
          {job.about}
        </Typography>
      )}
      <ul className="flex flex-wrap gap-2">
        {facts.map((fact) => (
          <li
            key={fact}
            className="rounded-10 bg-surface-float px-2.5 py-1 text-text-secondary typo-footnote"
          >
            {fact}
          </li>
        ))}
      </ul>
      <Button
        tag="a"
        href={job.applyUrl}
        target="_blank"
        rel="noopener nofollow"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        icon={<OpenLinkIcon />}
        iconPosition={ButtonIconPosition.Right}
        className="self-start"
        onClick={() =>
          logEvent({
            event_name: LogEvent.ClickSquadJobApply,
            target_id: job.id,
            extra: JSON.stringify({ squad: squad.id }),
          })
        }
      >
        {`Apply on ${host}`}
      </Button>
    </div>
  );
};

/** A role's own page, a squad sub-page like Products or Members. */
export const SquadJobPage = ({ jobId }: { jobId: string }): ReactElement => {
  const { squad } = useSquadPageContext();
  const { data, error, isError, refetch } = useQuery(
    squadJobQueryOptions(jobId),
  );
  const { jobs } = useSquadJobs(squad);
  // A role of another squad in this squad's address is not this page's
  const isOtherSquad = !!data && data.sourceId !== squad.id;
  const job = isOtherSquad ? undefined : data;
  const isGone = isOtherSquad || (isError && isSquadJobGone(error));
  const more = jobs.filter(({ id }) => id !== jobId).slice(0, 3);
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
          backUrl={getSquadJobsUrl(squad.handle)}
          backLabel="Back to Jobs"
        />
      }
    >
      <div className="flex flex-col gap-10 px-4 pb-10 pt-6 tablet:px-6">
        {!job && (isGone || isError) && (
          <div className="flex flex-col items-start gap-3">
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              {isGone
                ? 'This role is no longer open.'
                : 'We couldn’t load this role. Please try again.'}
            </Typography>
            {!isGone && (
              <Button
                type="button"
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                onClick={() => refetch()}
              >
                Try again
              </Button>
            )}
          </div>
        )}
        {job && (
          <>
            <JobSummary job={job} />
            {!!job.bullets.length && (
              <DetailSection title="What you’ll do">
                <ul className="flex flex-col gap-2">
                  {job.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span
                        aria-hidden
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-text-quaternary"
                      />
                      <Typography
                        type={TypographyType.Callout}
                        color={TypographyColor.Secondary}
                        className="min-w-0 flex-1 break-words"
                      >
                        {bullet}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}
            {!!more.length && (
              <DetailSection title={`More roles at ${squad.name}`}>
                <ul className="-mt-4 flex flex-col">
                  {more.map((item) => (
                    <SquadJobRow key={item.id} job={item} />
                  ))}
                </ul>
              </DetailSection>
            )}
          </>
        )}
      </div>
    </SquadPageLayout>
  );
};
