import type { FormEvent, ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import type { SquadJob, SquadJobInput } from '../../../../graphql/squadJobs';
import {
  SquadJobEmploymentType,
  squadJobEmploymentTypeLabel,
  SquadJobWorkplace,
  squadJobWorkplaceLabel,
} from '../../../../graphql/squadJobs';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  ArrowIcon,
  EditIcon,
  MiniCloseIcon,
  PlusIcon,
} from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { Image, ImageType } from '../../../../components/image/Image';
import Link from '../../../../components/utilities/Link';
import { ShellSquare } from '../../../../components/shell/ShellSquare';
import { TextField } from '../../../../components/fields/TextField';
import Textarea from '../../../../components/fields/Textarea';
import { Radio } from '../../../../components/fields/Radio';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { HorizontalSeparator } from '../../../../components/utilities/common';
import { usePrompt } from '../../../../hooks/usePrompt';
import { useSquadPageContext } from '../../SquadPageContext';
import { useSquadJobMutations, useSquadJobs } from '../../hooks/useSquadJobs';
import { getSquadJobMeta } from '../../lib/jobs';
import { isValidSquadLink } from '../../lib/links';
import { moveItem } from '../../lib/order';
import {
  SQUAD_JOB_ABOUT_MAX_LENGTH,
  SQUAD_JOB_BULLET_MAX_LENGTH,
  SQUAD_JOB_BULLETS_MAX,
  SQUAD_JOB_LOCATION_MAX_LENGTH,
  SQUAD_JOB_SALARY_MAX_LENGTH,
  SQUAD_JOB_TEAM_MAX_LENGTH,
  SQUAD_JOB_TITLE_MAX_LENGTH,
  SQUAD_JOBS_MAX,
  SQUAD_LINK_MAX_LENGTH,
} from '../../lib/limits';
import {
  getSquadJobFormUrl,
  getSquadManageUrl,
  SquadManageSection,
} from '../../lib/routes';
import {
  SquadManagePanel,
  SquadManageSaveButton,
  SquadManageSectionPanel,
  useSquadManageEmbed,
} from './SquadManageLayout';

const requiredCopy = 'This field is required.';

export const SquadManageJobs = (): ReactElement => {
  const { squad } = useSquadPageContext();
  const { jobs, isPending } = useSquadJobs(squad);
  const { onReorder } = useSquadJobMutations(squad);
  const ids = jobs.map(({ id }) => id);
  const canAdd = jobs.length < SQUAD_JOBS_MAX;
  const addUrl = getSquadJobFormUrl(squad.handle);

  return (
    <SquadManageSectionPanel
      section={SquadManageSection.Jobs}
      action={
        canAdd && (
          <Link href={addUrl} passHref>
            <Button
              tag="a"
              variant={ButtonVariant.Subtle}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
            >
              Add
            </Button>
          </Link>
        )
      }
      phoneAction={
        canAdd && (
          <Link href={addUrl} passHref>
            <ShellSquare tag="a" aria-label="Add role">
              <PlusIcon size={IconSize.Small} />
            </ShellSquare>
          </Link>
        )
      }
    >
      <div className="flex flex-col gap-4 px-4 py-6 tablet:px-6">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {`Up to ${SQUAD_JOBS_MAX} open roles, shown on the Jobs tab in this order.`}
        </Typography>
        {!isPending && !jobs.length && (
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            No roles yet. Add the first one to show the Jobs tab.
          </Typography>
        )}
        <ul className="flex flex-col gap-4">
          {jobs.map((job, index) => {
            const meta = [job.team, job.salary].filter(Boolean);

            return (
              <li key={job.id} className="flex items-center gap-3">
                <Image
                  src={squad.image}
                  alt=""
                  type={ImageType.Squad}
                  className="size-10 shrink-0 rounded-10 object-cover"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <Typography type={TypographyType.Subhead} bold truncate>
                    {job.title}
                  </Typography>
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Secondary}
                    truncate
                  >
                    {getSquadJobMeta(job)}
                  </Typography>
                  {!!meta.length && (
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                      truncate
                    >
                      {meta.join(' · ')}
                    </Typography>
                  )}
                </div>
                <Button
                  type="button"
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.XSmall}
                  icon={<ArrowIcon />}
                  aria-label={`Move ${job.title} up`}
                  disabled={index === 0}
                  onClick={() => onReorder(moveItem(ids, index, index - 1))}
                />
                <Button
                  type="button"
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.XSmall}
                  icon={<ArrowIcon className="rotate-180" />}
                  aria-label={`Move ${job.title} down`}
                  disabled={index === jobs.length - 1}
                  onClick={() => onReorder(moveItem(ids, index, index + 1))}
                />
                <Link href={getSquadJobFormUrl(squad.handle, job.id)} passHref>
                  <Button
                    tag="a"
                    variant={ButtonVariant.Tertiary}
                    size={ButtonSize.XSmall}
                    icon={<EditIcon />}
                    aria-label={`Edit ${job.title}`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </SquadManageSectionPanel>
  );
};

const Label = ({ children }: { children: string }): ReactElement => (
  <Typography type={TypographyType.Callout} bold>
    {children}
  </Typography>
);

const Helper = ({ children }: { children: string }): ReactElement => (
  <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
    {children}
  </Typography>
);

const Field = ({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-2">
    <Label>{label}</Label>
    {helper && <Helper>{helper}</Helper>}
    {children}
  </div>
);

const workplaceOptions = Object.values(SquadJobWorkplace).map((value) => ({
  label: squadJobWorkplaceLabel[value],
  value,
}));

const employmentOptions = Object.values(SquadJobEmploymentType).map(
  (value) => ({ label: squadJobEmploymentTypeLabel[value], value }),
);

const jobFormId = 'squad-job-form';

const SquadJobForm = ({
  job,
  onDone,
  onSavingChange,
}: {
  job?: SquadJob;
  onDone: () => void;
  onSavingChange: (isSaving: boolean) => void;
}): ReactElement => {
  const { squad } = useSquadPageContext();
  const { onAdd, onUpdate, onRemove, isRemoving } = useSquadJobMutations(squad);
  const { showPrompt } = usePrompt();
  const [title, setTitle] = useState(job?.title ?? '');
  const [team, setTeam] = useState(job?.team ?? '');
  const [location, setLocation] = useState(job?.location ?? '');
  const [workplace, setWorkplace] = useState(
    job?.workplace ?? SquadJobWorkplace.OnSite,
  );
  const [employmentType, setEmploymentType] = useState(
    job?.employmentType ?? SquadJobEmploymentType.FullTime,
  );
  const [salary, setSalary] = useState(job?.salary ?? '');
  const [about, setAbout] = useState(job?.about ?? '');
  const [bullets, setBullets] = useState(
    job?.bullets.length ? job.bullets : [''],
  );
  const [applyUrl, setApplyUrl] = useState(job?.applyUrl ?? '');
  const [showErrors, setShowErrors] = useState(false);
  const isTitleValid = !!title.trim();
  const isLocationValid = !!location.trim();
  const isApplyValid = isValidSquadLink(applyUrl.trim());

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setShowErrors(true);

    if (!isTitleValid || !isLocationValid || !isApplyValid) {
      return;
    }

    const input: SquadJobInput = {
      title: title.trim(),
      team: team.trim() || null,
      location: location.trim(),
      workplace,
      employmentType,
      salary: salary.trim() || null,
      about: about.trim() || null,
      bullets: bullets.map((bullet) => bullet.trim()).filter(Boolean),
      applyUrl: applyUrl.trim(),
    };

    onSavingChange(true);

    try {
      if (job) {
        await onUpdate({ id: job.id, input });
      } else {
        await onAdd(input);
      }
    } catch {
      return;
    } finally {
      onSavingChange(false);
    }

    onDone();
  };

  const onRemoveJob = async () => {
    if (!job) {
      return;
    }

    const confirmed = await showPrompt({
      title: `Remove ${job.title}?`,
      description:
        'It leaves the Jobs tab, and its link says the role is no longer open.',
      okButton: { title: 'Remove', color: ButtonColor.Ketchup },
    });

    if (!confirmed) {
      return;
    }

    try {
      await onRemove(job.id);
    } catch {
      return;
    }

    onDone();
  };

  return (
    <form
      id={jobFormId}
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-6 px-4 py-6 tablet:px-6"
    >
      <div className="flex flex-col gap-2">
        <TextField
          inputId="job-title"
          name="title"
          label="Role title*"
          fieldType="secondary"
          maxLength={SQUAD_JOB_TITLE_MAX_LENGTH}
          value={title}
          valueChanged={setTitle}
          valid={!showErrors || isTitleValid}
          hint={showErrors && !isTitleValid ? requiredCopy : undefined}
        />
        <TextField
          inputId="job-team"
          name="team"
          label="Team"
          fieldType="secondary"
          maxLength={SQUAD_JOB_TEAM_MAX_LENGTH}
          value={team}
          valueChanged={setTeam}
          hint="Shown on the role, like Engineering or Design."
        />
      </div>
      <HorizontalSeparator />
      <Field label="Where">
        <TextField
          inputId="job-location"
          name="location"
          label="Location*"
          fieldType="secondary"
          maxLength={SQUAD_JOB_LOCATION_MAX_LENGTH}
          value={location}
          valueChanged={setLocation}
          valid={!showErrors || isLocationValid}
          hint={
            showErrors && !isLocationValid
              ? requiredCopy
              : 'A city, or the region for remote roles, like Remote (EU).'
          }
        />
        <Radio<SquadJobWorkplace>
          name="job-workplace"
          value={workplace}
          onChange={setWorkplace}
          className={{ container: 'flex-wrap !gap-4 tablet:!flex-row' }}
          options={workplaceOptions}
        />
      </Field>
      <Field label="Employment type">
        <Radio<SquadJobEmploymentType>
          name="job-type"
          value={employmentType}
          onChange={setEmploymentType}
          className={{ container: 'flex-wrap !gap-4 tablet:!flex-row' }}
          options={employmentOptions}
        />
      </Field>
      <Field
        label="Salary"
        helper="Shown on the role and the list. Leave it empty to hide it."
      >
        <TextField
          inputId="job-salary"
          name="salary"
          label="Range, like $150K–$180K"
          fieldType="secondary"
          maxLength={SQUAD_JOB_SALARY_MAX_LENGTH}
          value={salary}
          valueChanged={setSalary}
        />
      </Field>
      <HorizontalSeparator />
      <Field label="About the role">
        <Textarea
          inputId="job-about"
          name="about"
          label="What the role is, in two or three lines"
          rows={4}
          maxLength={SQUAD_JOB_ABOUT_MAX_LENGTH}
          value={about}
          valueChanged={setAbout}
        />
      </Field>
      <Field
        label="What you’ll do"
        helper={`Up to ${SQUAD_JOB_BULLETS_MAX} short points.`}
      >
        {bullets.map((bullet, index) => (
          <TextField
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            inputId={`job-bullet-${index}`}
            name={`job-bullet-${index}`}
            label="Point"
            fieldType="secondary"
            maxLength={SQUAD_JOB_BULLET_MAX_LENGTH}
            showMaxLength={false}
            value={bullet}
            valueChanged={(value) =>
              setBullets(
                bullets.map((item, at) => (at === index ? value : item)),
              )
            }
            actionButton={
              bullets.length > 1 ? (
                <Button
                  type="button"
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.XSmall}
                  icon={<MiniCloseIcon />}
                  aria-label="Remove point"
                  onClick={() =>
                    setBullets(bullets.filter((_, at) => at !== index))
                  }
                />
              ) : undefined
            }
          />
        ))}
        {bullets.length < SQUAD_JOB_BULLETS_MAX && (
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
            className="self-start"
            onClick={() => setBullets([...bullets, ''])}
          >
            Add point
          </Button>
        )}
      </Field>
      <HorizontalSeparator />
      <Field
        label="Apply link*"
        helper="Apply sends people here, on your site. daily.dev never takes applications."
      >
        <TextField
          inputId="job-link"
          name="applyUrl"
          label="Link"
          type="url"
          fieldType="secondary"
          maxLength={SQUAD_LINK_MAX_LENGTH}
          showMaxLength={false}
          value={applyUrl}
          valueChanged={setApplyUrl}
          valid={!showErrors || isApplyValid}
          hint={
            showErrors && !isApplyValid
              ? 'Use a full address starting with https://'
              : undefined
          }
        />
      </Field>
      {job && (
        <>
          <HorizontalSeparator />
          <Button
            type="button"
            variant={ButtonVariant.Subtle}
            color={ButtonColor.Ketchup}
            className="self-start"
            loading={isRemoving}
            onClick={onRemoveJob}
          >
            Remove role
          </Button>
        </>
      )}
    </form>
  );
};

export const SquadManageJobForm = ({
  jobId,
}: {
  /** Undefined adds a role. */
  jobId?: string;
}): ReactElement | null => {
  const router = useRouter();
  const embed = useSquadManageEmbed();
  const { squad } = useSquadPageContext();
  const { jobs, isPending } = useSquadJobs(squad);
  const [isSaving, setIsSaving] = useState(false);
  const job = jobId ? jobs.find(({ id }) => id === jobId) : undefined;
  const listUrl = getSquadManageUrl(squad.handle, SquadManageSection.Jobs);

  if (jobId && !job) {
    return isPending ? null : (
      <SquadManagePanel
        title="Role not found"
        backUrl={listUrl}
        backLabel="Back to Jobs"
        hasLaptopBack
      >
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="px-4 py-6 tablet:px-6"
        >
          This role is no longer listed on the Squad.
        </Typography>
      </SquadManagePanel>
    );
  }

  return (
    <SquadManagePanel
      title={job ? 'Edit role' : 'Add role'}
      backUrl={listUrl}
      backLabel="Back to Jobs"
      hasLaptopBack
      action={<SquadManageSaveButton formId={jobFormId} isLoading={isSaving} />}
    >
      <SquadJobForm
        key={job?.id ?? 'new'}
        job={job}
        onDone={() => (embed ? embed.onSaved() : router.push(listUrl))}
        onSavingChange={setIsSaving}
      />
    </SquadManagePanel>
  );
};
