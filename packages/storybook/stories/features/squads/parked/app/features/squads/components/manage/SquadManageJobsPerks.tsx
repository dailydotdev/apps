import type { FormEvent, ReactElement, ReactNode } from 'react';
import React, { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import type {
  SquadJob,
  SquadJobInput,
  SquadPerk,
  SquadPerkInput,
} from '../../../../graphql/squadJobsPerks';
import {
  SquadJobEmploymentType,
  squadJobEmploymentTypeLabel,
  SquadJobWorkplace,
  squadJobWorkplaceLabel,
  SquadPerkCodeKind,
  squadPerkQueryOptions,
} from '../../../../graphql/squadJobsPerks';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  EditIcon,
  MiniCloseIcon,
  PlusIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  Image,
  ImageType,
} from '@dailydotdev/shared/src/components/image/Image';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import Textarea from '@dailydotdev/shared/src/components/fields/Textarea';
import { Radio } from '@dailydotdev/shared/src/components/fields/Radio';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { HorizontalSeparator } from '@dailydotdev/shared/src/components/utilities/common';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useSquadPageContext } from '@dailydotdev/shared/src/features/squads/SquadPageContext';
import { useSquadJobMutations, useSquadJobs } from '../../hooks/useSquadJobs';
import {
  useSquadPerkMutations,
  useSquadPerks,
} from '../../hooks/useSquadPerks';
import { useSquadProducts } from '@dailydotdev/shared/src/features/squads/hooks/useSquadProducts';
import { moveItem } from '@dailydotdev/shared/src/features/squads/lib/order';
import { isValidSquadLink } from '@dailydotdev/shared/src/features/squads/lib/links';
import {
  getSquadJobMeta,
  chunkSquadPerkCodes,
  fromPerkEndDateInput,
  getSquadPerkEndsLabel,
  parseSquadPerkCodes,
  toPerkEndDateInput,
} from '../../lib/jobsPerks';
import {
  getSquadJobFormUrl,
  getSquadManageUrl,
  getSquadPerkFormUrl,
  SquadManageSection,
} from '../../lib/routes';
import {
  SquadManagePanel,
  SquadManageSaveButton,
  SquadManageSectionPanel,
} from './SquadManageLayout';

// Manage › Jobs and Manage › Member perks, built like Manage › Products: a
// list with Add, reorderable rows with an edit button, and a form page
// with Back, Save in the header and Remove at the bottom.

export const SQUAD_JOBS_MAX = 20;
export const SQUAD_PERKS_MAX = 10;
const JOB_BULLETS_MAX = 5;
const PERK_STEPS_MAX = 4;
const PERK_TERMS_MAX = 5;

/* ------------------------------------------------- shared form pieces */

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

/** Short lines with Add and Remove, like the product form's links. */
const LinesField = ({
  id,
  label,
  helper,
  itemLabel,
  addLabel,
  lines,
  max,
  onChange,
}: {
  id: string;
  label: string;
  helper: string;
  itemLabel: string;
  addLabel: string;
  lines: string[];
  max: number;
  onChange: (lines: string[]) => void;
}): ReactElement => (
  <Field label={label} helper={helper}>
    {lines.map((line, index) => (
      <TextField
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        inputId={`${id}-${index}`}
        name={`${id}-${index}`}
        label={itemLabel}
        fieldType="secondary"
        maxLength={200}
        showMaxLength={false}
        value={line}
        valueChanged={(value) =>
          onChange(lines.map((item, at) => (at === index ? value : item)))
        }
        actionButton={
          lines.length > 1 ? (
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={<MiniCloseIcon />}
              aria-label={`Remove ${itemLabel.toLowerCase()}`}
              onClick={() => onChange(lines.filter((_, at) => at !== index))}
            />
          ) : undefined
        }
      />
    ))}
    {lines.length < max && (
      <Button
        type="button"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<PlusIcon />}
        className="self-start"
        onClick={() => onChange([...lines, ''])}
      >
        {addLabel}
      </Button>
    )}
  </Field>
);

const filled = (lines: string[]): string[] =>
  lines.map((line) => line.trim()).filter(Boolean);

const orEmptyLine = (lines?: string[]): string[] =>
  lines?.length ? lines : [''];

/** One row of a manage list, the product row's layout. */
const ListRow = ({
  logo,
  title,
  subtitle,
  meta,
  editUrl,
  isFirst,
  isLast,
  onMove,
}: {
  logo: string;
  title: string;
  subtitle: string;
  meta: string;
  editUrl: string;
  isFirst: boolean;
  isLast: boolean;
  onMove: (by: -1 | 1) => void;
}): ReactElement => (
  <li className="flex items-center gap-3">
    <Image
      src={logo}
      alt=""
      type={ImageType.Squad}
      className="size-10 shrink-0 rounded-10 object-cover"
    />
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <Typography type={TypographyType.Subhead} bold truncate>
        {title}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Secondary}
        truncate
      >
        {subtitle}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        truncate
      >
        {meta}
      </Typography>
    </div>
    <Button
      type="button"
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.XSmall}
      icon={<ArrowIcon />}
      aria-label={`Move ${title} up`}
      disabled={isFirst}
      onClick={() => onMove(-1)}
    />
    <Button
      type="button"
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.XSmall}
      icon={<ArrowIcon className="rotate-180" />}
      aria-label={`Move ${title} down`}
      disabled={isLast}
      onClick={() => onMove(1)}
    />
    <Link href={editUrl} passHref>
      <Button
        tag="a"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.XSmall}
        icon={<EditIcon />}
        aria-label={`Edit ${title}`}
      />
    </Link>
  </li>
);

const AddLink = ({ href }: { href: string }): ReactElement => (
  <Link href={href} passHref>
    <Button
      tag="a"
      variant={ButtonVariant.Subtle}
      size={ButtonSize.Small}
      icon={<PlusIcon />}
    >
      Add
    </Button>
  </Link>
);

const ListBody = ({
  helper,
  empty,
  isEmpty,
  children,
}: {
  helper: string;
  empty: string;
  isEmpty: boolean;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-4 px-4 py-6 tablet:px-6">
    <Helper>{helper}</Helper>
    {isEmpty && (
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        {empty}
      </Typography>
    )}
    <ul className="flex flex-col gap-4">{children}</ul>
  </div>
);

const RemoveButton = ({
  children,
  isLoading,
  onClick,
}: {
  children: string;
  isLoading: boolean;
  onClick: () => void;
}): ReactElement => (
  <>
    <HorizontalSeparator />
    <Button
      type="button"
      variant={ButtonVariant.Subtle}
      color={ButtonColor.Ketchup}
      className="self-start"
      loading={isLoading}
      onClick={onClick}
    >
      {children}
    </Button>
  </>
);

const NotFoundPanel = ({
  title,
  backUrl,
  backLabel,
  text,
}: {
  title: string;
  backUrl: string;
  backLabel: string;
  text: string;
}): ReactElement => (
  <SquadManagePanel
    title={title}
    backUrl={backUrl}
    backLabel={backLabel}
    hasLaptopBack
  >
    <Typography
      type={TypographyType.Callout}
      color={TypographyColor.Secondary}
      className="px-4 py-6 tablet:px-6"
    >
      {text}
    </Typography>
  </SquadManagePanel>
);

/* --------------------------------------------------------------- jobs */

export const SquadManageJobs = (): ReactElement => {
  const { squad } = useSquadPageContext();
  const { jobs, isPending } = useSquadJobs(squad);
  const { onReorder } = useSquadJobMutations(squad);
  const ids = jobs.map(({ id }) => id);

  return (
    <SquadManageSectionPanel
      section={SquadManageSection.Jobs}
      action={
        jobs.length < SQUAD_JOBS_MAX && (
          <AddLink href={getSquadJobFormUrl(squad.handle)} />
        )
      }
    >
      <ListBody
        helper={`Open roles, shown on the Jobs tab in this order. Up to ${SQUAD_JOBS_MAX}.`}
        empty="No roles yet. Add the first one to show the Jobs tab."
        isEmpty={!isPending && !jobs.length}
      >
        {jobs.map((job, index) => (
          <ListRow
            key={job.id}
            logo={squad.image}
            title={job.title}
            subtitle={getSquadJobMeta(job)}
            meta={[job.team, job.salary].filter(Boolean).join(' · ')}
            editUrl={getSquadJobFormUrl(squad.handle, job.id)}
            isFirst={index === 0}
            isLast={index === jobs.length - 1}
            onMove={(by) => onReorder(moveItem(ids, index, index + by))}
          />
        ))}
      </ListBody>
    </SquadManageSectionPanel>
  );
};

const jobFormId = 'squad-job-form';

const workplaceOptions = Object.values(SquadJobWorkplace).map((value) => ({
  label: squadJobWorkplaceLabel[value],
  value,
}));

const employmentOptions = Object.values(SquadJobEmploymentType).map(
  (value) => ({ label: squadJobEmploymentTypeLabel[value], value }),
);

const JobForm = ({
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
  const [bullets, setBullets] = useState(orEmptyLine(job?.bullets));
  const [applyUrl, setApplyUrl] = useState(job?.applyUrl ?? '');
  const [showErrors, setShowErrors] = useState(false);
  const isApplyValid = isValidSquadLink(applyUrl);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setShowErrors(true);
    if (!title.trim() || !location.trim() || !isApplyValid) {
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
      bullets: filled(bullets),
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
        'It leaves the Jobs tab. People who saved the link see it is closed.',
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
          maxLength={100}
          value={title}
          valueChanged={setTitle}
          valid={!showErrors || !!title.trim()}
        />
        <TextField
          inputId="job-team"
          name="team"
          label="Team"
          fieldType="secondary"
          maxLength={40}
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
          maxLength={80}
          value={location}
          valueChanged={setLocation}
          valid={!showErrors || !!location.trim()}
          hint="A city, or the region for remote roles, like Remote (EU)."
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
          maxLength={40}
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
          maxLength={600}
          value={about}
          valueChanged={setAbout}
        />
      </Field>
      <LinesField
        id="job-bullet"
        label="What you’ll do"
        helper={`Up to ${JOB_BULLETS_MAX} short points.`}
        itemLabel="Point"
        addLabel="Add point"
        lines={bullets}
        max={JOB_BULLETS_MAX}
        onChange={setBullets}
      />
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
          maxLength={500}
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
        <RemoveButton isLoading={isRemoving} onClick={onRemoveJob}>
          Remove role
        </RemoveButton>
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
  const { squad } = useSquadPageContext();
  const { jobs, isPending } = useSquadJobs(squad);
  const [isSaving, setIsSaving] = useState(false);
  const job = jobId ? jobs.find(({ id }) => id === jobId) : undefined;
  const listUrl = getSquadManageUrl(squad.handle, SquadManageSection.Jobs);

  if (jobId && !job) {
    return isPending ? null : (
      <NotFoundPanel
        title="Role not found"
        backUrl={listUrl}
        backLabel="Back to Jobs"
        text="This role is no longer listed on the Squad."
      />
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
      <JobForm
        key={job?.id ?? 'new'}
        job={job}
        onDone={() => router.push(listUrl)}
        onSavingChange={setIsSaving}
      />
    </SquadManagePanel>
  );
};

/* -------------------------------------------------------------- perks */

export const SquadManagePerks = (): ReactElement => {
  const { squad } = useSquadPageContext();
  const { perks, isPending } = useSquadPerks(squad);
  const { onReorder } = useSquadPerkMutations(squad);
  const ids = perks.map(({ id }) => id);

  return (
    <SquadManageSectionPanel
      section={SquadManageSection.Perks}
      action={
        perks.length < SQUAD_PERKS_MAX && (
          <AddLink href={getSquadPerkFormUrl(squad.handle)} />
        )
      }
    >
      <ListBody
        helper="Shown on the Perks tab in this order. Codes unlock when someone joins."
        empty="No perks yet. Add the first one to show the Perks tab."
        isEmpty={!isPending && !perks.length}
      >
        {perks.map((perk, index) => (
          <ListRow
            key={perk.id}
            logo={perk.image ?? squad.image}
            title={perk.title}
            subtitle={[perk.value, perk.toolTitle].filter(Boolean).join(' · ')}
            meta={[
              getSquadPerkEndsLabel(perk),
              `${perk.claimed} claimed`,
              perk.codesLeft !== null && `${perk.codesLeft} codes left`,
            ]
              .filter(Boolean)
              .join(' · ')}
            editUrl={getSquadPerkFormUrl(squad.handle, perk.id)}
            isFirst={index === 0}
            isLast={index === perks.length - 1}
            onMove={(by) => onReorder(moveItem(ids, index, index + by))}
          />
        ))}
      </ListBody>
    </SquadManageSectionPanel>
  );
};

const perkFormId = 'squad-perk-form';

const codeKindOptions = [
  { label: 'One code for everyone', value: SquadPerkCodeKind.Shared },
  { label: 'A unique code per member', value: SquadPerkCodeKind.Unique },
];

const NO_PRODUCT = 'none';

const PerkForm = ({
  perk,
  onDone,
  onSavingChange,
}: {
  perk?: SquadPerk;
  onDone: () => void;
  onSavingChange: (isSaving: boolean) => void;
}): ReactElement => {
  const router = useRouter();
  const { squad } = useSquadPageContext();
  const { displayToast } = useToastNotification();
  const { products } = useSquadProducts(squad);
  const { onAdd, onUpdate, onAddCodes, onRemove, isRemoving } =
    useSquadPerkMutations(squad);
  const { showPrompt } = usePrompt();
  const [title, setTitle] = useState(perk?.title ?? '');
  const [value, setValue] = useState(perk?.value ?? '');
  const [toolId, setToolId] = useState(perk?.toolId ?? NO_PRODUCT);
  const [summary, setSummary] = useState(perk?.summary ?? '');
  const [codeKind, setCodeKind] = useState(
    perk?.codeKind ?? SquadPerkCodeKind.Shared,
  );
  const [code, setCode] = useState(perk?.code ?? '');
  const [codesText, setCodesText] = useState('');
  const [redeemUrl, setRedeemUrl] = useState(perk?.redeemUrl ?? '');
  const [endsOn, setEndsOn] = useState(toPerkEndDateInput(perk?.endsAt));
  const [claimLimit, setClaimLimit] = useState(
    perk?.claimLimit ? String(perk.claimLimit) : '',
  );
  const [steps, setSteps] = useState(orEmptyLine(perk?.steps));
  const [terms, setTerms] = useState(orEmptyLine(perk?.terms));
  const [showErrors, setShowErrors] = useState(false);
  const isShared = codeKind === SquadPerkCodeKind.Shared;
  const codes = parseSquadPerkCodes(codesText);
  const isRedeemValid = !redeemUrl.trim() || isValidSquadLink(redeemUrl);
  const limit = Number.parseInt(claimLimit, 10);
  const productOptions = [
    { label: 'None', value: NO_PRODUCT },
    ...products.map((product) => ({ label: product.title, value: product.id })),
  ];

  const codesInputRef = useRef<HTMLInputElement>(null);
  const onUploadCodes = async (file?: File) => {
    if (!file) {
      return;
    }

    const text = (await file.text()).trim();
    setCodesText((current) =>
      [current.trim(), text].filter(Boolean).join('\n'),
    );
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setShowErrors(true);
    if (
      !title.trim() ||
      !value.trim() ||
      (isShared && !code.trim()) ||
      !isRedeemValid
    ) {
      return;
    }

    const input: SquadPerkInput = {
      title: title.trim(),
      value: value.trim(),
      toolId: toolId === NO_PRODUCT ? null : toolId,
      summary: summary.trim() || null,
      codeKind,
      code: isShared ? code.trim() : null,
      redeemUrl: redeemUrl.trim() || null,
      endsAt: fromPerkEndDateInput(endsOn),
      claimLimit: Number.isFinite(limit) && limit > 0 ? limit : null,
      steps: filled(steps),
      terms: filled(terms),
    };

    onSavingChange(true);
    let saved: SquadPerk;
    try {
      saved = perk
        ? await onUpdate({ id: perk.id, input })
        : await onAdd(input);
    } catch {
      onSavingChange(false);
      return;
    }

    if (!isShared && codes.length) {
      try {
        // In batches the API takes; codes already there are skipped, so a
        // retry after a failure is safe
        // eslint-disable-next-line no-restricted-syntax
        for (const batch of chunkSquadPerkCodes(codes)) {
          // eslint-disable-next-line no-await-in-loop
          await onAddCodes({ id: saved.id, codes: batch });
        }
      } catch {
        onSavingChange(false);
        displayToast(
          'The perk is saved, but the codes did not all upload. Add them again here.',
        );
        // A new perk exists now: retry on its edit form, never add it twice
        if (!perk) {
          router.replace(getSquadPerkFormUrl(squad.handle, saved.id));
        }
        return;
      }
    }

    onSavingChange(false);
    onDone();
  };

  const onRemovePerk = async () => {
    if (!perk) {
      return;
    }

    const confirmed = await showPrompt({
      title: `Remove ${perk.title}?`,
      description:
        'It leaves the Perks tab. Members who already took a code keep it.',
      okButton: { title: 'Remove', color: ButtonColor.Ketchup },
    });
    if (!confirmed) {
      return;
    }

    try {
      await onRemove(perk.id);
    } catch {
      return;
    }
    onDone();
  };

  return (
    <form
      id={perkFormId}
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-6 px-4 py-6 tablet:px-6"
    >
      <div className="flex flex-col gap-2">
        <TextField
          inputId="perk-title"
          name="title"
          label="Perk title*"
          fieldType="secondary"
          maxLength={80}
          value={title}
          valueChanged={setTitle}
          valid={!showErrors || !!title.trim()}
        />
        <TextField
          inputId="perk-value"
          name="value"
          label="What members get*"
          fieldType="secondary"
          maxLength={30}
          value={value}
          valueChanged={setValue}
          valid={!showErrors || !!value.trim()}
          hint="A few words on the card, like 3 months free or Early access."
        />
      </div>
      {!!products.length && (
        <Field
          label="Product"
          helper="Which of your products it is for. Its logo shows on the perk."
        >
          <Radio<string>
            name="perk-product"
            value={toolId}
            onChange={setToolId}
            className={{ container: 'flex-wrap !gap-4 tablet:!flex-row' }}
            options={productOptions}
          />
        </Field>
      )}
      <Field label="Description">
        <Textarea
          inputId="perk-summary"
          name="summary"
          label="What it is and who it is for"
          rows={3}
          maxLength={300}
          value={summary}
          valueChanged={setSummary}
        />
      </Field>
      <HorizontalSeparator />
      <Field
        label="Code"
        helper="Members see it on the perk. Visitors see the perk, locked."
      >
        <Radio<SquadPerkCodeKind>
          name="perk-code-kind"
          value={codeKind}
          onChange={setCodeKind}
          className={{ container: 'flex-wrap !gap-4 tablet:!flex-row' }}
          options={codeKindOptions}
        />
        {isShared ? (
          <TextField
            inputId="perk-code"
            name="code"
            label="Code*"
            fieldType="secondary"
            maxLength={100}
            showMaxLength={false}
            value={code}
            valueChanged={setCode}
            valid={!showErrors || !!code.trim()}
          />
        ) : (
          <>
            <Textarea
              inputId="perk-codes"
              name="codes"
              label="Paste codes, one per line"
              rows={4}
              value={codesText}
              valueChanged={setCodesText}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                icon={<PlusIcon />}
                onClick={() => codesInputRef.current?.click()}
              >
                Upload a CSV
              </Button>
              <input
                ref={codesInputRef}
                type="file"
                accept=".csv,.txt,text/csv,text/plain"
                className="hidden"
                onChange={(event) => onUploadCodes(event.target.files?.[0])}
              />
              <Helper>
                {[
                  codes.length ? `${codes.length} new codes` : '',
                  perk?.codesLeft !== null && perk?.codesLeft !== undefined
                    ? `${perk.codesLeft} left to claim`
                    : '',
                ]
                  .filter(Boolean)
                  .join(' · ') ||
                  'Each member gets one code. Long lists upload in batches.'}
              </Helper>
            </div>
          </>
        )}
        <TextField
          inputId="perk-redeem"
          name="redeemUrl"
          label="Redeem link"
          type="url"
          fieldType="secondary"
          maxLength={500}
          showMaxLength={false}
          value={redeemUrl}
          valueChanged={setRedeemUrl}
          valid={!showErrors || isRedeemValid}
          hint={
            showErrors && !isRedeemValid
              ? 'Use a full address starting with https://'
              : 'Where Redeem sends members, on your site.'
          }
        />
      </Field>
      <Field label="Availability">
        <TextField
          inputId="perk-ends"
          name="endsAt"
          label="Ends on (optional)"
          type="date"
          fieldType="secondary"
          value={endsOn}
          valueChanged={setEndsOn}
          hint="It drops off the Perks tab after this day."
        />
        <TextField
          inputId="perk-limit"
          name="claimLimit"
          label="How many members can claim it (optional)"
          type="number"
          fieldType="secondary"
          value={claimLimit}
          valueChanged={setClaimLimit}
          hint="When they run out, the perk shows as claimed."
        />
      </Field>
      <HorizontalSeparator />
      <LinesField
        id="perk-step"
        label="How to redeem"
        helper={`Up to ${PERK_STEPS_MAX} steps, shown numbered on the perk.`}
        itemLabel="Step"
        addLabel="Add step"
        lines={steps}
        max={PERK_STEPS_MAX}
        onChange={setSteps}
      />
      <LinesField
        id="perk-term"
        label="Fine print"
        helper="Short conditions, like one code per member."
        itemLabel="Condition"
        addLabel="Add condition"
        lines={terms}
        max={PERK_TERMS_MAX}
        onChange={setTerms}
      />
      {perk && (
        <RemoveButton isLoading={isRemoving} onClick={onRemovePerk}>
          Remove perk
        </RemoveButton>
      )}
    </form>
  );
};

export const SquadManagePerkForm = ({
  perkId,
}: {
  /** Undefined adds a perk. */
  perkId?: string;
}): ReactElement | null => {
  const router = useRouter();
  const { squad } = useSquadPageContext();
  const { user } = useAuthContext();
  // The single perk carries what an editor sees (the shared code, codes left)
  const { data: perk, isPending } = useQuery({
    ...squadPerkQueryOptions({ id: perkId, user }),
    enabled: !!perkId,
  });
  const { perks } = useSquadPerks(squad);
  const [isSaving, setIsSaving] = useState(false);
  const current = perk ?? perks.find(({ id }) => id === perkId);
  const listUrl = getSquadManageUrl(squad.handle, SquadManageSection.Perks);

  if (perkId && !current) {
    return isPending ? null : (
      <NotFoundPanel
        title="Perk not found"
        backUrl={listUrl}
        backLabel="Back to Member perks"
        text="This perk is no longer offered on the Squad."
      />
    );
  }

  return (
    <SquadManagePanel
      title={current ? 'Edit perk' : 'Add perk'}
      backUrl={listUrl}
      backLabel="Back to Member perks"
      hasLaptopBack
      action={
        <SquadManageSaveButton formId={perkFormId} isLoading={isSaving} />
      }
    >
      <PerkForm
        key={current?.id ?? 'new'}
        perk={current}
        onDone={() => router.push(listUrl)}
        onSavingChange={setIsSaving}
      />
    </SquadManagePanel>
  );
};
