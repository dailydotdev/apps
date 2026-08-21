import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import Link from '../../../components/utilities/Link';
import { ArrowIcon, SettingsIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { ElementPlaceholder } from '../../../components/ElementPlaceholder';
import { DateFormat } from '../../../components/utilities/DateFormat';
import { TimeFormatType } from '../../../lib/dateFormat';
import { webappUrl } from '../../../lib/constants';
import { useAgentShellHeight } from '../shell';
import type { AgentMonitorItem, AgentMonitorSource } from '../monitorItems';
import {
  dotClass,
  inkClass,
  stateLabel,
  stateMeaning,
  toMonitorItems,
} from '../monitorItems';
import type { CreateInterestSettings } from '../../../graphql/interests';
import {
  UserInterestCadence,
  defaultCreateInterestSettings,
} from '../../../graphql/interests';
import { composerBar, composerColumn, composerFrame } from './AgentComposer';
import { AgentSendButton } from './AgentSendButton';
import {
  CadenceSection,
  FomoSection,
  OutputModesSection,
  cadenceOptions,
  outputOptions,
} from './AgentSettingsFields';

const maxFieldHeight = 120;

// One DOM for both readings: the wrappers become `display: contents` from tablet
// up and the fields reorder, so nothing is rendered twice for a screen reader.
const AgentRow = ({ item }: { item: AgentMonitorItem }): ReactElement => {
  const isWaiting = item.state === 'waiting';

  return (
    <li className="tablet:[&:first-child>a]:rounded-t-12 tablet:[&:last-child>a]:rounded-b-12">
      <Link href={`${webappUrl}agent/${item.id}`}>
        <a className="agent-press-row group/item flex items-start gap-2.5 rounded-12 bg-surface-float px-3 py-2.5 transition-colors hover:bg-surface-hover tablet:items-center tablet:gap-3 tablet:rounded-none tablet:bg-transparent tablet:py-2 tablet:hover:bg-surface-float">
          <span
            aria-hidden
            className={classNames(
              'mt-1.5 size-2 shrink-0 rounded-6 tablet:hidden',
              isWaiting && 'bg-brand-default',
            )}
          />

          <FlexCol className="min-w-0 flex-1 gap-0.5 tablet:contents">
            <FlexRow className="items-baseline gap-2 tablet:contents">
              <Typography
                type={TypographyType.Callout}
                bold
                className="min-w-0 flex-1 truncate tablet:order-2 tablet:typo-footnote"
              >
                {item.name}
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Quaternary}
                className="shrink-0 tabular-nums tablet:order-4 tablet:w-14 tablet:text-right"
              >
                {item.at ? (
                  <DateFormat date={item.at} type={TimeFormatType.Elapsed} />
                ) : (
                  'Not yet'
                )}
              </Typography>
            </FlexRow>
            <FlexRow className="min-w-0 items-center gap-1.5 tablet:contents">
              <span
                aria-label={stateMeaning[item.state]}
                className={classNames(
                  'flex shrink-0 items-center gap-1.5 typo-caption1 tablet:order-1 tablet:w-[4.75rem]',
                  inkClass[item.state],
                )}
              >
                <span
                  aria-hidden
                  className={classNames(
                    'hidden size-1.5 shrink-0 rounded-6 tablet:block',
                    dotClass[item.state],
                  )}
                />
                {stateLabel[item.state]}
              </span>
              {!!item.line && (
                <>
                  <span
                    aria-hidden
                    className="text-text-quaternary tablet:hidden"
                  >
                    ·
                  </span>
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                    className="min-w-0 flex-1 truncate tablet:order-3"
                  >
                    {item.line}
                  </Typography>
                </>
              )}
            </FlexRow>
          </FlexCol>

          <ArrowIcon
            size={IconSize.Size16}
            className="hidden shrink-0 rotate-90 text-text-disabled transition-colors group-hover/item:text-text-quaternary tablet:order-5 tablet:block"
            aria-hidden
          />
        </a>
      </Link>
    </li>
  );
};

export const AgentHomeScreen = ({
  agents,
  isPending,
  onCreate,
  isCreating,
  isStandalone,
  initialQuery = '',
}: {
  agents: AgentMonitorSource[];
  isPending?: boolean;
  onCreate: (input: {
    query: string;
    settings?: CreateInterestSettings;
  }) => void | Promise<unknown>;
  isCreating?: boolean;
  isStandalone?: boolean;
  /** Never runs on its own: a shared link must not spend someone's allowance. */
  initialQuery?: string;
}): ReactElement => {
  const shellHeight = useAgentShellHeight(isStandalone);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<CreateInterestSettings>(
    defaultCreateInterestSettings,
  );
  // On this statically optimised route the query is empty until after hydration,
  // so it arrives a render after `useState` read its argument. Only adopted into
  // an empty field, so it cannot overwrite what was typed.
  useEffect(() => {
    if (!initialQuery) {
      return;
    }

    setQuery((current) => current || initialQuery);
  }, [initialQuery]);

  const items = toMonitorItems(agents);
  const waiting = items.filter(({ state }) => state === 'waiting').length;
  const working = items.filter(({ state }) =>
    ['running', 'watching', 'starting'].includes(state),
  ).length;

  const resize = () => {
    const field = fieldRef.current;

    if (!field) {
      return;
    }

    field.style.height = 'auto';
    field.style.height = `${Math.min(field.scrollHeight, maxFieldHeight)}px`;
  };

  const onSubmit = () => {
    const trimmed = query.trim();

    if (!trimmed || isCreating) {
      return;
    }

    // The mutation reports its own failure with a toast, so swallowing here only
    // stops the same failure escaping as an unhandled rejection.
    Promise.resolve(onCreate({ query: trimmed, settings })).catch(
      () => undefined,
    );
  };

  const cadenceSummary =
    cadenceOptions.find(({ value }) => value === settings.cadence)?.label ??
    'Every hour';
  const deliverySummary = outputOptions
    .filter(({ key }) => settings.outputModes?.[key])
    .map(({ short }) => short)
    .join(', ');
  const threshold = settings.fomoThreshold ?? 0.5;
  let fomoSummary = 'Balanced';
  if (threshold > 0.7) {
    fomoSummary = 'Only the best';
  }
  if (threshold < 0.3) {
    fomoSummary = 'Show me everything';
  }
  const peekRows = [
    ['When it runs', cadenceSummary],
    ['FOMO vs quality', fomoSummary],
    ['What it delivers', deliverySummary || 'Nothing yet'],
  ];

  return (
    <FlexCol className={classNames('w-full overflow-hidden', shellHeight)}>
      <FlexRow className="h-12 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary px-3 tablet:px-4">
        <strong className="typo-footnote">Agents</strong>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {/* "None watching" is a claim, and it cannot be made about agents that
              have not loaded yet. */}
          {isPending && ''}
          {!isPending &&
            (waiting
              ? `${waiting} waiting for review`
              : `${working || 'None'} watching`)}
        </Typography>
      </FlexRow>

      <div className="agent-scroll min-h-0 flex-1 overflow-y-auto px-5 tablet:px-8 laptop:px-10">
        <FlexCol className="mx-auto min-h-full w-full max-w-[45rem] justify-center gap-6 py-6">
          <FlexCol className="gap-1">
            <Typography
              tag={TypographyTag.H1}
              type={TypographyType.Title2}
              bold
              className="text-balance"
            >
              {/* While the list loads, neither is known, and telling someone with
                  eight agents to spawn their first is the worse guess. */}
              {isPending || agents.length
                ? 'What should the next one hunt?'
                : 'Spawn your first agent'}
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Name a topic. It reads daily.dev on a schedule and only comes back
              when something clears your bar.
            </Typography>
          </FlexCol>

          {isPending && (
            <FlexCol className="gap-2">
              <ElementPlaceholder className="agent-skeleton h-3 w-24 rounded-8" />
              <FlexCol
                className="gap-2 tablet:gap-0 tablet:divide-y tablet:divide-border-subtlest-quaternary tablet:rounded-12 tablet:border tablet:border-border-subtlest-tertiary"
                aria-busy
                aria-label="Loading your agents"
              >
                {['w-40', 'w-28', 'w-48'].map((nameWidth) => (
                  <FlexRow
                    key={nameWidth}
                    className="items-start gap-2.5 rounded-12 bg-surface-float px-3 py-2.5 tablet:items-center tablet:gap-3 tablet:rounded-none tablet:bg-transparent tablet:py-2.5"
                  >
                    <span className="mt-1.5 size-2 shrink-0 tablet:hidden" />
                    <ElementPlaceholder className="agent-skeleton hidden h-3 w-16 shrink-0 rounded-8 tablet:block" />
                    <FlexCol className="min-w-0 flex-1 gap-1.5 tablet:contents">
                      <FlexRow className="items-center gap-2 tablet:contents">
                        <ElementPlaceholder
                          className={classNames(
                            'agent-skeleton h-3.5 rounded-8 tablet:order-2 tablet:h-3',
                            nameWidth,
                          )}
                        />
                        <span className="flex-1 tablet:hidden" />
                        <ElementPlaceholder className="agent-skeleton h-3 w-8 shrink-0 rounded-8 tablet:order-4 tablet:ml-auto" />
                      </FlexRow>
                      <ElementPlaceholder className="agent-skeleton h-3 w-32 rounded-8 tablet:order-3" />
                    </FlexCol>
                  </FlexRow>
                ))}
              </FlexCol>
            </FlexCol>
          )}

          {!isPending && !!agents.length && (
            <FlexCol className="gap-2">
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Quaternary}
              >
                {agents.length === 1
                  ? 'Your agent'
                  : `Your ${agents.length} agents`}
              </Typography>
              <ol className="flex flex-col gap-2 tablet:gap-0 tablet:divide-y tablet:divide-border-subtlest-quaternary tablet:rounded-12 tablet:border tablet:border-border-subtlest-tertiary">
                {items.map((item) => (
                  <AgentRow key={item.id} item={item} />
                ))}
              </ol>
            </FlexCol>
          )}
        </FlexCol>
      </div>

      <div className={composerBar}>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-full -mb-px h-12 bg-gradient-to-t from-background-default to-transparent"
        />
        <FlexCol className={classNames(composerColumn, 'gap-2')}>
          <FlexCol className={composerFrame}>
            <FlexRow className="items-center gap-1.5">
              <textarea
                ref={fieldRef}
                id="agent-start"
                name="agent-start"
                rows={1}
                aria-label="What should the agent hunt for?"
                placeholder="Name a topic and it starts hunting…"
                value={query}
                className="min-w-0 flex-1 resize-none self-center bg-transparent text-text-primary outline-none typo-callout placeholder:text-text-quaternary"
                onChange={(event) => {
                  setQuery(event.target.value);
                  resize();
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    onSubmit();
                  }
                }}
              />
              <AgentSendButton
                label="Spawn the agent"
                className="self-center"
                loading={isCreating}
                disabled={!query.trim()}
                onClick={onSubmit}
              />
            </FlexRow>
          </FlexCol>

          <FlexCol className="overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float">
            <button
              type="button"
              aria-label="Agent settings"
              aria-expanded={isSettingsOpen}
              className="flex w-full flex-col gap-2 px-4 py-3 text-left transition-colors hover:bg-surface-hover"
              onClick={() => setSettingsOpen((open) => !open)}
            >
              <FlexRow className="w-full items-center gap-2">
                <SettingsIcon
                  size={IconSize.Size16}
                  className="text-text-tertiary"
                />
                <strong className="flex-1 text-text-secondary typo-footnote">
                  Agent settings
                </strong>
                <span className="text-text-quaternary typo-caption1">
                  {isSettingsOpen ? 'Done' : 'Adjust'}
                </span>
                <ArrowIcon
                  size={IconSize.Size16}
                  className={classNames(
                    'text-text-quaternary transition-transform',
                    !isSettingsOpen && 'rotate-180',
                  )}
                  aria-hidden
                />
              </FlexRow>
              {!isSettingsOpen && (
                <FlexCol className="w-full gap-1">
                  {peekRows.map(([label, value]) => (
                    <FlexRow key={label} className="items-baseline gap-3">
                      <span className="w-28 shrink-0 text-text-quaternary typo-caption1">
                        {label}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-text-tertiary typo-caption1">
                        {value}
                      </span>
                    </FlexRow>
                  ))}
                </FlexCol>
              )}
            </button>

            {isSettingsOpen && (
              <FlexCol className="agent-scroll max-h-[50vh] overflow-y-auto border-t border-border-subtlest-tertiary px-4">
                <CadenceSection
                  value={settings.cadence ?? UserInterestCadence.Hourly}
                  disabled={isCreating}
                  onChange={(cadence) =>
                    setSettings((current) => ({ ...current, cadence }))
                  }
                />
                <FomoSection
                  value={settings.fomoThreshold ?? 0.5}
                  onChange={(fomoThreshold) =>
                    setSettings((current) => ({ ...current, fomoThreshold }))
                  }
                />
                <OutputModesSection
                  value={settings.outputModes}
                  disabled={isCreating}
                  onChange={(outputModes) =>
                    setSettings((current) => ({
                      ...current,
                      outputModes: { ...current.outputModes, ...outputModes },
                    }))
                  }
                />
              </FlexCol>
            )}
          </FlexCol>
        </FlexCol>
      </div>
    </FlexCol>
  );
};
