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
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { ArrowIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { ElementPlaceholder } from '../../../components/ElementPlaceholder';
import { DateFormat } from '../../../components/utilities/DateFormat';
import { TimeFormatType } from '../../../lib/dateFormat';
import { webappUrl } from '../../../lib/constants';
import { useAgentShellHeight } from '../shell';
import type { AgentMonitorItem, AgentMonitorSource } from './AgentMonitor';
import {
  dotClass,
  inkClass,
  stateLabel,
  stateMeaning,
  toMonitorItems,
} from './AgentMonitor';
import { composerBar, composerColumn, composerFrame } from './AgentComposer';
import { AgentSendButton } from './AgentSendButton';

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
 * One agent: a two-line card on a phone, a single compact line from tablet up.
 *
 * On a phone the name leads, in full width and full weight, because it is the
 * only thing on a row that differs from the rows around it — the reading a
 * session list gets on a handset. What the agent is doing drops to a second
 * line, and a dot in the left gutter marks one that came back and is waiting on
 * you, findable without reading anything.
 *
 * Given width there is no reason to spend two lines on it, so from tablet up the
 * same four facts sit on one: state, name, what it last said, when. Same DOM
 * either way — the wrappers become `display: contents` and the fields reorder
 * into the row, so nothing is rendered twice for a screen reader to read twice.
 */
const AgentRow = ({ item }: { item: AgentMonitorItem }): ReactElement => {
  const isWaiting = item.state === 'waiting';

  return (
    <li className="tablet:[&:first-child>a]:rounded-t-12 tablet:[&:last-child>a]:rounded-b-12">
      <Link href={`${webappUrl}agent/${item.id}`}>
        <a className="agent-press-row group/item flex items-start gap-2.5 rounded-12 bg-surface-float px-3 py-2.5 transition-colors hover:bg-surface-hover tablet:items-center tablet:gap-3 tablet:rounded-none tablet:bg-transparent tablet:py-2 tablet:hover:bg-surface-float">
          {/* The gutter holds its width whether or not there is news in it, so
              the names start on one line down the whole stack and the dots are
              the only thing the eye has to run down. The compact row says the
              state in words, so it does not need this. */}
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
              {/* Last on the compact row, and a fixed column there so the rows
                  read as a table rather than as ragged lines. */}
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

          {/* A repeated affordance: the faintest tier there is, and small, so it
              marks the row as tappable without being read. Only where the row is
              a line in a block — the phone's cards are obviously their own
              targets. */}
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
  initialQuery = '',
}: {
  agents: AgentMonitorSource[];
  isPending?: boolean;
  onCreate: (query: string) => void | Promise<unknown>;
  isCreating?: boolean;
  /** Rendered without the app chrome, so the screen owns the viewport. */
  isStandalone?: boolean;
  /**
   * A prompt someone was handed. Arrives in the field rather than running on
   * its own: an agent that spawns itself off a link someone else sent is a link
   * that spends your allowance without asking.
   */
  initialQuery?: string;
}): ReactElement => {
  const shellHeight = useAgentShellHeight(isStandalone);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const resizeFrame = useRef<number>();
  const [query, setQuery] = useState(initialQuery);
  // `useState` reads its argument once, and a handed-over prompt comes off the
  // URL — which on this statically optimised route is empty until after
  // hydration. So it arrives a render late, and the field it was meant for has
  // already mounted without it. Adopted only into an empty field: a prompt
  // someone was sent is worth less than a word they typed themselves.
  useEffect(() => {
    if (!initialQuery) {
      return;
    }

    setQuery((current) => current || initialQuery);
  }, [initialQuery]);

  // The measuring frame is dropped on unmount: it reaches for the field, and a
  // screen that has left takes the field with it.
  useEffect(
    () => () => {
      if (resizeFrame.current) {
        cancelAnimationFrame(resizeFrame.current);
      }
    },
    [],
  );

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
    resizeFrame.current = requestAnimationFrame(resize);
  };

  const onSubmit = () => {
    const trimmed = query.trim();

    if (!trimmed || isCreating) {
      return;
    }

    // The mutation behind this reports its own failure with a toast. Swallowed
    // here so the same failure does not also escape the press as an unhandled
    // rejection.
    Promise.resolve(onCreate(trimmed)).catch(() => undefined);
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
              {/* The shape of the rows they become, at both readings: two lines
                  in a card on a phone, one line in a block from tablet up, so
                  the list does not jump as it fills in. Widths vary because real
                  names do. */}
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
              {/* Cards with air between them on a phone: each agent is its own
                  thing to open, and the gaps are what make a stack of them
                  scannable at arm's length. Given width they collapse back into
                  one bordered block of thin lines. */}
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
        {/* Softens the hard cut where the list disappears behind the bar. */}
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
