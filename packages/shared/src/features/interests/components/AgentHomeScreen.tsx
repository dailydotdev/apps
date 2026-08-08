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
import { SendAirplaneIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { ElementPlaceholder } from '../../../components/ElementPlaceholder';
import { DateFormat } from '../../../components/utilities/DateFormat';
import { TimeFormatType } from '../../../lib/dateFormat';
import { webappUrl } from '../../../lib/constants';
import { useAgentShellHeight } from '../shell';
import type { AgentMonitorItem, AgentMonitorSource } from './AgentMonitor';
import {
  inkClass,
  stateLabel,
  stateMeaning,
  toMonitorItems,
} from './AgentMonitor';
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

/**
 * One agent as a card, two lines.
 *
 * The name leads, in full width and full weight, because it is the only thing
 * on the row that is different from the other rows — the reading a session list
 * gets on a phone. What the agent is doing drops to a second line, where it can
 * be a coloured word next to what it last said without taking the name's room.
 *
 * The dot in the gutter is the news: an agent that came back and is waiting on
 * you, findable down the left edge without reading anything.
 */
const AgentRow = ({ item }: { item: AgentMonitorItem }): ReactElement => {
  const isWaiting = item.state === 'waiting';

  return (
    <li>
      <Link href={`${webappUrl}agent/${item.id}`}>
        <a className="agent-press-row flex items-start gap-2.5 rounded-12 bg-surface-float px-3 py-2.5 transition-colors hover:bg-surface-hover">
          {/* The gutter holds its width whether or not there is news in it, so
              the names start on one line down the whole stack and the dots are
              the only thing the eye has to run down. */}
          <span
            aria-hidden
            className={classNames(
              'mt-1.5 size-2 shrink-0 rounded-6',
              isWaiting && 'bg-brand-default',
            )}
          />

          <FlexCol className="min-w-0 flex-1 gap-0.5">
            <FlexRow className="items-baseline gap-2">
              <Typography
                type={TypographyType.Callout}
                bold
                className="min-w-0 flex-1 truncate"
              >
                {item.name}
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Quaternary}
                className="shrink-0 tabular-nums"
              >
                {item.at ? (
                  <DateFormat date={item.at} type={TimeFormatType.Elapsed} />
                ) : (
                  'Not yet'
                )}
              </Typography>
            </FlexRow>
            <FlexRow className="min-w-0 items-center gap-1.5">
              <span
                aria-label={stateMeaning[item.state]}
                className={classNames(
                  'shrink-0 typo-caption1',
                  inkClass[item.state],
                )}
              >
                {stateLabel[item.state]}
              </span>
              {!!item.line && (
                <>
                  <span aria-hidden className="text-text-quaternary">
                    ·
                  </span>
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                    className="min-w-0 flex-1 truncate"
                  >
                    {item.line}
                  </Typography>
                </>
              )}
            </FlexRow>
          </FlexCol>
        </a>
      </Link>
    </li>
  );
};

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
  agents: AgentMonitorSource[];
  isPending?: boolean;
  onCreate: (query: string) => void;
  isCreating?: boolean;
  /** Rendered without the app chrome, so the screen owns the viewport. */
  isStandalone?: boolean;
}): ReactElement => {
  const shellHeight = useAgentShellHeight(isStandalone);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState('');
  const items = toMonitorItems(agents);
  const waiting = items.filter(({ state }) => state === 'waiting').length;
  // The ones still doing their job — which is not simply "not paused": a
  // stopped agent and one whose last run failed are not working either.
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
          {/* Nothing until the list lands: "None watching" is a claim, and it
              was being made about agents that had not loaded yet. */}
          {isPending && ''}
          {!isPending &&
            (waiting
              ? `${waiting} waiting for review`
              : `${working || 'None'} watching`)}
        </Typography>
      </FlexRow>

      <div className="agent-scroll min-h-0 flex-1 overflow-y-auto px-5 tablet:px-8 laptop:px-10">
        {/* Centred while the list is short, scrolling from the top once it is
            long enough to fill the screen. */}
        <FlexCol className="mx-auto min-h-full w-full max-w-[45rem] justify-center gap-6 py-6">
          <FlexCol className="gap-1">
            <Typography
              tag={TypographyTag.H1}
              type={TypographyType.Title2}
              bold
              className="text-balance"
            >
              {/* While the list is loading we do not know which of these is
                  true, and telling someone with eight agents to spawn their
                  first one is the worse guess. */}
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
              {/* The shape of the cards they become — tile, name, the state
                  line under it, when — so the list does not jump as it fills
                  in. Widths vary because real names do. */}
              <FlexCol
                className="gap-2"
                aria-busy
                aria-label="Loading your agents"
              >
                {['w-40', 'w-28', 'w-48'].map((nameWidth) => (
                  <FlexRow
                    key={nameWidth}
                    className="items-start gap-2.5 rounded-12 bg-surface-float px-3 py-2.5"
                  >
                    <span className="mt-1.5 size-2 shrink-0" />
                    <FlexCol className="min-w-0 flex-1 gap-1.5">
                      <FlexRow className="items-center gap-2">
                        <ElementPlaceholder
                          className={classNames(
                            'agent-skeleton h-3.5 rounded-8',
                            nameWidth,
                          )}
                        />
                        <span className="flex-1" />
                        <ElementPlaceholder className="agent-skeleton h-3 w-8 shrink-0 rounded-8" />
                      </FlexRow>
                      <ElementPlaceholder className="agent-skeleton h-3 w-32 rounded-8" />
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
              {/* Cards with air between them rather than one bordered block:
                  each agent is its own thing to open, and the gaps are what
                  make a stack of them scannable at arm's length. */}
              <ol className="flex flex-col gap-2">
                {items.map((item) => (
                  <AgentRow key={item.id} item={item} />
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
          className="pointer-events-none absolute inset-x-0 bottom-full -mb-px h-12 bg-gradient-to-t from-background-default to-transparent"
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

          {/* `pr-6` matches the fade's width, so the last starter clears the
              mask when the row is scrolled to its end. */}
          <FlexRow className="agent-fade-right no-scrollbar items-center gap-1.5 overflow-x-auto pl-0.5 pr-6">
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
