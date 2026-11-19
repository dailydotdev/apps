import type { FormEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { VIcon } from '../../../../components/icons';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { HorizontalSeparator } from '../../../../components/utilities/common';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import { usePrompt } from '../../../../hooks/usePrompt';
import type { ApiErrorResult } from '../../../../graphql/common';
import { DEFAULT_ERROR } from '../../../../graphql/common';
import type {
  SquadIntel,
  SquadIntelLimits,
  SquadIntelSelection,
} from '../../../../graphql/squadIntel';
import {
  squadIntelQueryOptions,
  squadIntelSettingsQueryOptions,
  updateSquadIntelSettings,
} from '../../../../graphql/squadIntel';
import { LogEvent, Origin } from '../../../../lib/log';
import { LfgTagPicker } from '../../../lfg/components/LfgTagPicker';
import { useSquadPageContext } from '../../SquadPageContext';
import { getSquadId } from '../../lib/features';
import Link from '../../../../components/utilities/Link';
import { getSquadIntelUrl, SquadManageSection } from '../../lib/routes';
import {
  getIntelDayLabel,
  getIntelWeekLabel,
  intelRegionLabels,
  intelRegions,
  intelSeniorities,
  intelSeniorityLabels,
} from '../../lib/intel';
import { useLogStartups } from '../../hooks/useLogStartups';
import {
  SquadManageSaveButton,
  SquadManageSectionPanel,
  useSquadManageEmbed,
} from './SquadManageLayout';
import { SquadEnterpriseGate } from './SquadEnterpriseGate';

const formId = 'squad-manage-intel';
const FIRST_INTEL_POLL_MS = 10_000;

const SectionTitle = ({
  title,
  description,
}: {
  title: string;
  description: string;
}): ReactElement => (
  <div className="flex flex-col gap-1">
    <Typography tag={TypographyTag.H2} type={TypographyType.Callout} bold>
      {title}
    </Typography>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {description}
    </Typography>
  </div>
);

/** Toggles for one audience filter; none on means every reader. */
const FilterOptions = <T extends string>({
  options,
  labels,
  value,
  onChange,
}: {
  options: T[];
  labels: Record<T, string>;
  value: T[];
  onChange: (value: T[]) => void;
}): ReactElement => (
  <div className="flex flex-wrap gap-2">
    {options.map((option) => {
      const isOn = value.includes(option);

      return (
        <Button
          key={option}
          type="button"
          variant={isOn ? ButtonVariant.Primary : ButtonVariant.Float}
          size={ButtonSize.Small}
          pressed={isOn}
          icon={isOn ? <VIcon /> : undefined}
          onClick={() =>
            onChange(
              isOn
                ? value.filter((item) => item !== option)
                : [...value, option],
            )
          }
        >
          {labels[option]}
        </Button>
      );
    })}
  </div>
);

/** What the first intel will cover, for the user to check before it is built */
const SelectionSummary = ({
  selection,
}: {
  selection: SquadIntelSelection;
}): ReactElement => {
  const rows = [
    {
      label: 'Topics',
      value: selection.tags.map((tag) => `#${tag}`).join(', '),
    },
    {
      label: 'Seniority',
      value:
        selection.seniority
          ?.map((level) => intelSeniorityLabels[level])
          .join(', ') ?? 'Every level',
    },
    {
      label: 'Region',
      value:
        selection.regions
          ?.map((region) => intelRegionLabels[region])
          .join(', ') ?? 'Everywhere',
    },
  ];

  return (
    <div className="flex flex-col gap-2 rounded-12 bg-surface-float p-3 text-left">
      {rows.map(({ label, value }) => (
        <div key={label} className="flex flex-col">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            {label}
          </Typography>
          <Typography tag={TypographyTag.Span} type={TypographyType.Footnote}>
            {value}
          </Typography>
        </div>
      ))}
    </div>
  );
};

const IntelSettingsForm = ({
  selection,
  limits,
  hasIntel,
  nextIntelAt,
  onSave,
}: {
  selection: SquadIntelSelection | null;
  limits: SquadIntelLimits;
  hasIntel: boolean;
  nextIntelAt: string;
  onSave: (selection: SquadIntelSelection) => void;
}): ReactElement => {
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();
  const [tags, setTags] = useState(selection?.tags ?? []);
  const [seniority, setSeniority] = useState(selection?.seniority ?? []);
  const [regions, setRegions] = useState(selection?.regions ?? []);
  const nextDay = getIntelDayLabel(nextIntelAt);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!tags.length) {
      displayToast('Pick at least one topic');
      return;
    }

    const next = {
      tags,
      seniority: limits.seniority && seniority.length ? seniority : null,
      regions: limits.regions && regions.length ? regions : null,
    };

    // The first intel is built from these settings as soon as they are saved,
    // and the next one only comes with the weekly run
    if (!hasIntel) {
      const confirmed = await showPrompt({
        title: 'Build your first intel with these settings?',
        description: `We build intel once a week. Your first one is built now and covers last week. The next one comes on ${nextDay}, and any change you make after today shows from then.`,
        content: <SelectionSummary selection={next} />,
        okButton: { title: 'Build my intel' },
        cancelButton: { title: 'Keep editing' },
      });

      if (!confirmed) {
        return;
      }
    }

    onSave(next);
  };

  return (
    <form
      id={formId}
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-3">
        <SectionTitle
          title="Topics"
          description={`Up to ${limits.tags} daily.dev tags that match what you build. The intel compares them and shows what else their readers read.`}
        />
        <LfgTagPicker
          value={tags}
          onChange={setTags}
          max={limits.tags}
          origin={Origin.SquadManageIntel}
          selectedVariant={ButtonVariant.Primary}
        />
      </div>
      <HorizontalSeparator />
      <div className="flex flex-col gap-3">
        <SectionTitle
          title="Seniority"
          description="Count only readers at these levels. Leave all off for every level."
        />
        {limits.seniority ? (
          <FilterOptions
            options={intelSeniorities}
            labels={intelSeniorityLabels}
            value={seniority}
            onChange={setSeniority}
          />
        ) : (
          <SquadEnterpriseGate
            plan="Team"
            title="Target by seniority"
            description="Focus the intel on junior, mid-level or senior developers."
          />
        )}
      </div>
      <HorizontalSeparator />
      <div className="flex flex-col gap-3">
        <SectionTitle
          title="Region"
          description="Count only readers in these regions. Leave all off for everywhere."
        />
        {limits.regions ? (
          <FilterOptions
            options={intelRegions}
            labels={intelRegionLabels}
            value={regions}
            onChange={setRegions}
          />
        ) : (
          <SquadEnterpriseGate
            title="Target by region"
            description="Focus the intel on developers in North America, Europe, Asia Pacific and more."
          />
        )}
      </div>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {hasIntel
          ? `A new intel comes every Monday. Changes you save now show from the next one, on ${nextDay}.`
          : 'A new intel comes every Monday. Your first one is built as soon as you save, covering last week.'}
      </Typography>
    </form>
  );
};

const LatestIntel = ({
  intel,
  hasTopics,
}: {
  intel?: SquadIntel | null;
  hasTopics: boolean;
}): ReactElement => {
  const { squad } = useSquadPageContext();

  if (!intel) {
    return (
      <div className="flex flex-col gap-1 rounded-16 border border-dashed border-border-subtlest-tertiary p-5">
        <Typography type={TypographyType.Callout} bold>
          {hasTopics ? 'Your first intel is on its way' : 'No intel yet'}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {hasTopics
            ? 'It covers last week and is ready in a few minutes. We will notify you when it is ready.'
            : 'Pick your topics above and save. Your first intel is ready a few minutes later.'}
        </Typography>
      </div>
    );
  }

  const url = getSquadIntelUrl(squad.handle);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
      <span className="flex min-w-0 flex-col gap-1">
        <Typography type={TypographyType.Callout} bold>
          {`Latest intel: ${getIntelWeekLabel(intel)}`}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Your agent can read it too, through the daily.dev MCP server and API.
        </Typography>
      </span>
      <Link href={url} passHref>
        <Button
          tag="a"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
        >
          Read intel
        </Button>
      </Link>
    </div>
  );
};

export const SquadManageIntel = (): ReactElement => {
  const { squad } = useSquadPageContext();
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { displayToast } = useToastNotification();
  const logStartups = useLogStartups();
  const embed = useSquadManageEmbed();
  const sourceId = getSquadId(squad);
  const {
    data: settings,
    error,
    isPending,
  } = useQuery(squadIntelSettingsQueryOptions({ user, sourceId }));
  const hasTopics = !!settings?.selection;
  const { data: intel, isPending: isIntelPending } = useQuery({
    ...squadIntelQueryOptions({ user, sourceId, enabled: !!settings }),
    // The first intel is built in the background right after the topics are
    // saved, so it shows up here when it is ready
    refetchInterval: (query) =>
      hasTopics && !query.state.data ? FIRST_INTEL_POLL_MS : false,
  });
  const {
    mutate: onSave,
    isPending: isSaving,
    data: saved,
  } = useMutation({
    mutationFn: (selection: SquadIntelSelection) =>
      updateSquadIntelSettings({ sourceId, ...selection }),
    onSuccess: (next) => {
      client.setQueryData(
        squadIntelSettingsQueryOptions({ user, sourceId }).queryKey,
        next,
      );
      logStartups(LogEvent.UpdateSquadIntel, sourceId, {
        tags: next.selection?.tags.length ?? 0,
        seniority: next.selection?.seniority ?? null,
        regions: next.selection?.regions ?? null,
      });
      displayToast(
        intel
          ? `Saved. Your changes show in the next intel, on ${getIntelDayLabel(next.nextIntelAt)}.`
          : 'Saved. Your first intel is being built and is ready in a few minutes.',
      );
      embed?.onSaved();
    },
    onError: (saveError: ApiErrorResult) =>
      displayToast(saveError?.response?.errors?.[0]?.message ?? DEFAULT_ERROR),
  });
  const errorMessage = (error as unknown as ApiErrorResult | null)?.response
    ?.errors?.[0]?.message;

  return (
    <SquadManageSectionPanel
      section={SquadManageSection.Intel}
      action={
        settings && (
          <SquadManageSaveButton
            formId={formId}
            isLoading={isSaving}
            savedKey={saved}
          />
        )
      }
    >
      <div className="flex flex-col gap-6 px-4 py-6 tablet:px-6">
        {error && !settings && (
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            {errorMessage ?? DEFAULT_ERROR}
          </Typography>
        )}
        {!isPending && settings && (
          <>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Every Monday, a report on what developers read and discuss in your
              topics: which topics grow, what else their readers read, and which
              posts, titles and formats work.
            </Typography>
            <IntelSettingsForm
              selection={settings.selection}
              limits={settings.limits}
              hasIntel={!!intel}
              nextIntelAt={settings.nextIntelAt}
              onSave={onSave}
            />
            <HorizontalSeparator />
            {!isIntelPending && (
              <LatestIntel intel={intel} hasTopics={hasTopics} />
            )}
          </>
        )}
      </div>
    </SquadManageSectionPanel>
  );
};
