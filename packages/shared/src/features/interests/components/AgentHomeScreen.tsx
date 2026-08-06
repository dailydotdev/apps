import type { ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import Link from '../../../components/utilities/Link';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { ArrowIcon, SendAirplaneIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { ElementPlaceholder } from '../../../components/ElementPlaceholder';
import { DateFormat } from '../../../components/utilities/DateFormat';
import { TimeFormatType } from '../../../lib/dateFormat';
import { webappUrl } from '../../../lib/constants';
import type { UserInterest } from '../../../graphql/interests';
import { UserInterestStatus } from '../../../graphql/interests';
import { useAgentShellHeight } from '../shell';
import { AgentMark } from './AgentMark';
import { composerBar, composerFrame } from './AgentComposer';

const maxFieldHeight = 120;

// Starters rather than examples: each one is a topic an agent can be pointed
// at today, so pressing one is a real first run and not a demo.
const starters = [
  'Rust in production',
  'Database internals',
  'What is happening with WebGPU',
  'CLI tools worth stealing from',
];

const cadenceCopy: Record<string, string> = {
  hourly: 'Hunting hourly',
  daily: 'Hunting daily',
  weekly: 'Hunting weekly',
};

const agentLine = (agent: UserInterest): string => {
  if (agent.status !== UserInterestStatus.Active) {
    return 'Paused';
  }

  return agent.lastRunSummary ?? cadenceCopy[agent.cadence] ?? 'Hunting';
};

/**
 * One agent as one line.
 *
 * A list rather than a wall of cards: what you do here is scan a dozen names
 * for the one you want, so every agent takes one row and the columns line up
 * down the screen.
 */
const AgentRow = ({ agent }: { agent: UserInterest }): ReactElement => (
  <li className="[&:first-child>a]:rounded-t-12 [&:last-child>a]:rounded-b-12">
    <Link href={`${webappUrl}agent/${agent.id}`}>
      <a className="group/item flex items-center gap-3 px-3 py-2 transition-colors hover:bg-surface-float">
        <AgentMark status={agent.status} />
        <Typography
          type={TypographyType.Footnote}
          bold
          className="min-w-0 flex-1 truncate"
        >
          {agent.query}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="hidden min-w-0 max-w-[16rem] shrink truncate tablet:block"
        >
          {agentLine(agent)}
        </Typography>
        {/* The column holds its width whether or not the agent has run, so
            the rows read as a table rather than as four ragged lines. */}
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
          className="w-16 shrink-0 text-right tabular-nums"
        >
          {agent.lastRunAt ? (
            <DateFormat date={agent.lastRunAt} type={TimeFormatType.Post} />
          ) : (
            'Not yet'
          )}
        </Typography>
        <ArrowIcon
          size={IconSize.XSmall}
          className="shrink-0 rotate-90 text-text-quaternary transition-colors group-hover/item:text-text-tertiary"
          aria-hidden
        />
      </a>
    </Link>
  </li>
);

/**
 * Where an agent starts.
 *
 * The same shell as the workspace: what you type into sits at the bottom in
 * exactly the place it will keep once the conversation exists, and everything
 * above it is the part that changes. Here that part is every agent you already
 * have, stacked against the field rather than floating in the middle of an
 * empty page, so the screen fills downward as the list grows.
 */
export const AgentHomeScreen = ({
  agents,
  isPending,
  onCreate,
  isCreating,
  isStandalone,
}: {
  agents: UserInterest[];
  isPending?: boolean;
  onCreate: (query: string) => void;
  isCreating?: boolean;
  /** Rendered without the app chrome, so the screen owns the viewport. */
  isStandalone?: boolean;
}): ReactElement => {
  const shellHeight = useAgentShellHeight(isStandalone);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState('');
  const running = agents.filter(
    ({ status }) => status === UserInterestStatus.Active,
  ).length;

  const resize = () => {
    const field = fieldRef.current;

    if (!field) {
      return;
    }

    field.style.height = 'auto';
    field.style.height = `${Math.min(field.scrollHeight, maxFieldHeight)}px`;
  };

  const write = (value: string) => {
    setQuery(value);
    fieldRef.current?.focus();
    // The field has not re-rendered with the new value yet, so it is measured
    // on the next frame rather than against the old text.
    requestAnimationFrame(resize);
  };

  const onSubmit = () => {
    const trimmed = query.trim();

    if (!trimmed || isCreating) {
      return;
    }

    onCreate(trimmed);
  };

  return (
    <FlexCol className={classNames('w-full overflow-hidden', shellHeight)}>
      <FlexRow className="h-12 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary px-3 tablet:px-4">
        <strong className="typo-footnote">Agents</strong>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {running ? `${running} hunting` : 'None hunting'}
        </Typography>
      </FlexRow>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 tablet:px-8 laptop:px-10">
        {/* Centred while the list is short, scrolling from the top once it is
            long enough to fill the screen. */}
        <FlexCol className="mx-auto min-h-full w-full max-w-[45rem] justify-center gap-6 py-6">
          <FlexCol className="gap-1">
            <Typography
              tag={TypographyTag.H1}
              type={TypographyType.Title2}
              bold
            >
              {agents.length
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
              {['a', 'b', 'c'].map((key) => (
                <ElementPlaceholder key={key} className="h-11 rounded-12" />
              ))}
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
              <ol className="divide-y divide-border-subtlest-quaternary rounded-12 border border-border-subtlest-tertiary">
                {agents.map((agent) => (
                  <AgentRow key={agent.id} agent={agent} />
                ))}
              </ol>
            </FlexCol>
          )}
        </FlexCol>
      </div>

      <div className={composerBar}>
        {/* Softens the hard cut where the list disappears behind the bar. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-full h-12 bg-gradient-to-t from-background-default to-transparent"
        />
        <FlexCol className="relative mx-auto w-full max-w-[45rem] gap-2">
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
              <Button
                icon={
                  // The airplane's mass sits left of its bounding box, so
                  // centring the box leaves it reading low and left.
                  <SendAirplaneIcon
                    size={IconSize.XSmall}
                    className="translate-x-px"
                  />
                }
                size={ButtonSize.Small}
                variant={ButtonVariant.Tertiary}
                className="self-center"
                aria-label="Spawn the agent"
                loading={isCreating}
                disabled={!query.trim()}
                onClick={onSubmit}
              />
            </FlexRow>
          </FlexCol>

          <FlexRow className="no-scrollbar items-center gap-1.5 overflow-x-auto px-0.5">
            {starters.map((starter) => (
              <Tooltip
                key={starter}
                content="Drops it in the field. Edit it before you send."
              >
                <Button
                  size={ButtonSize.XSmall}
                  variant={ButtonVariant.Subtle}
                  className="shrink-0"
                  onClick={() => write(starter)}
                >
                  {starter}
                </Button>
              </Tooltip>
            ))}
          </FlexRow>
        </FlexCol>
      </div>
    </FlexCol>
  );
};
