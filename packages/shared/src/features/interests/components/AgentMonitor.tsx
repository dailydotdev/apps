import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import Link from '../../../components/utilities/Link';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { ArrowIcon, BellIcon, MiniCloseIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { DateFormat } from '../../../components/utilities/DateFormat';
import { TimeFormatType } from '../../../lib/dateFormat';
import { webappUrl } from '../../../lib/constants';
import type { UserInterest } from '../../../graphql/interests';
import { UserInterestStatus } from '../../../graphql/interests';
import { useOutsideClick } from '../../../hooks/utils/useOutsideClick';
import { useKeyboardNavigation } from '../../../hooks/useKeyboardNavigation';

export type AgentMonitorState = 'new' | 'hunting' | 'paused';

export type AgentMonitorItem = {
  id: string;
  name: string;
  state: AgentMonitorState;
  /** What it found, or what it is doing right now. One line. */
  line: string;
  /** How many findings are waiting, when the run left any. */
  found?: number;
  at?: string | null;
};

const freshMs = 1000 * 60 * 60 * 6;
const tickerMs = 3600;
// Two waiting rows, then a count. Any more and the field is buried under its
// own news.
const shownByDefault = 2;

/**
 * The agents, as the strip sees them.
 *
 * "New" stands in for an unseen-findings count the API does not return yet: a
 * run that landed in the last few hours and had something to say.
 */
export const toMonitorItems = (
  agents: UserInterest[],
  now = Date.now(),
): AgentMonitorItem[] =>
  agents.map((agent) => {
    const ran = agent.lastRunAt ? Date.parse(agent.lastRunAt) : 0;
    const isFresh = !!agent.lastRunSummary && now - ran < freshMs;
    const isPaused = agent.status !== UserInterestStatus.Active;
    // eslint-disable-next-line no-nested-ternary
    const state: AgentMonitorState = isPaused
      ? 'paused'
      : isFresh
      ? 'new'
      : 'hunting';

    return {
      id: agent.id,
      name: agent.query,
      state,
      // Read back out of the summary. The API returns no findings count yet,
      // and the run's own sentence is the only place the number exists.
      found:
        Number(/kept (\d+)/.exec(agent.lastRunSummary ?? '')?.[1]) || undefined,
      line:
        agent.lastRunSummary ??
        (isPaused ? 'Paused. Nothing scheduled.' : 'Hunting. Nothing yet.'),
      at: agent.lastRunAt,
    };
  });

export const stateLabel: Record<AgentMonitorState, string> = {
  new: 'Waiting for you',
  hunting: 'Hunting',
  paused: 'Paused',
};

const inkClass: Record<AgentMonitorState, string> = {
  new: 'text-brand-default',
  hunting: 'text-action-upvote-default',
  paused: 'text-text-quaternary',
};

const dotClass: Record<AgentMonitorState, string> = {
  new: 'bg-brand-default',
  hunting: 'animate-pulse bg-action-upvote-default',
  paused: 'bg-text-quaternary',
};

const StateDot = ({ state }: { state: AgentMonitorState }): ReactElement => (
  <span
    aria-hidden
    className={classNames('size-1.5 shrink-0 rounded-6', dotClass[state])}
  />
);

/**
 * The state as a word, the way a pull-request list says "Ready for review".
 *
 * A coloured dot and a phrase carry it better than a badge does: at this size
 * a filled pill is a second object competing with the agent's own name, and
 * the words are the thing being scanned.
 */
export const AgentState = ({
  state,
}: {
  state: AgentMonitorState;
}): ReactElement => (
  <span
    className={classNames(
      'flex shrink-0 items-center gap-1.5 typo-caption1',
      inkClass[state],
    )}
  >
    <StateDot state={state} />
    {stateLabel[state]}
  </span>
);

const Elapsed = ({ at }: { at?: string | null }): ReactElement => (
  <Typography
    type={TypographyType.Caption2}
    color={TypographyColor.Quaternary}
    className="shrink-0 tabular-nums"
  >
    {at ? (
      <DateFormat date={at} type={TimeFormatType.LastActivity} />
    ) : (
      'Not yet'
    )}
  </Typography>
);

/**
 * One agent in the expanded list: state, who, what, when.
 *
 * Single row on purpose. A dozen agents have to be scannable in one look, and
 * a second line each turns the list into a page.
 */
const AgentRow = ({ item }: { item: AgentMonitorItem }): ReactElement => (
  <li>
    <Link href={`${webappUrl}agent/${item.id}`}>
      <a className="agent-press-row flex items-center gap-2 rounded-10 px-2 py-1.5 transition-colors hover:bg-surface-hover">
        <AgentState state={item.state} />
        <Typography
          type={TypographyType.Caption1}
          bold
          className="max-w-[10rem] shrink-0 truncate"
        >
          {item.name}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="min-w-0 flex-1 truncate"
        >
          {item.line}
        </Typography>
        <Elapsed at={item.at} />
        <ArrowIcon
          size={IconSize.XSmall}
          className="shrink-0 rotate-90 text-text-quaternary"
          aria-hidden
        />
      </a>
    </Link>
  </li>
);

/**
 * An agent that came back, in the collapsed stack.
 *
 * No state word on this one: there are at most two of them, they are all in
 * the same state, and the button on the right already says what to do about
 * it. The dot is what marks it as news.
 */
const WaitingRow = ({
  item,
  onDismiss,
}: {
  item: AgentMonitorItem;
  onDismiss: () => void;
}): ReactElement => (
  <FlexRow className="items-center gap-2 rounded-14 bg-surface-float py-1 pl-2.5 pr-1">
    <StateDot state={item.state} />
    <Typography
      type={TypographyType.Caption1}
      bold
      className="max-w-[9rem] shrink-0 truncate"
    >
      {item.name}
    </Typography>
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Tertiary}
      className="min-w-0 flex-1 truncate"
    >
      {item.line}
    </Typography>
    <Elapsed at={item.at} />
    <Link href={`${webappUrl}agent/${item.id}`}>
      <Button
        tag="a"
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Subtle}
        className="shrink-0"
      >
        Review
      </Button>
    </Link>
    <Button
      icon={<MiniCloseIcon size={IconSize.Size16} />}
      size={ButtonSize.XSmall}
      variant={ButtonVariant.Tertiary}
      className="shrink-0"
      aria-label={`Dismiss the update from ${item.name}`}
      onClick={onDismiss}
    />
  </FlexRow>
);

/**
 * Everything the agents are doing, stacked over the field.
 *
 * One object rather than two. Collapsed it is whatever is waiting on you, at
 * most two rows, sitting on a ticker of each agent's latest in rotation with
 * the bell carrying the count that came back while you were reading. Clicking
 * the ticker grows the stack upward into the full list rather than opening a
 * panel over it: they are the same rows, so a second surface to hold them was
 * one surface too many.
 *
 * No toast and no badge elsewhere in the chrome, on purpose: a toast leaves
 * with the news, and a second badge is a second inbox to check.
 */
type AgentMonitorView = 'collapsed' | 'waiting' | 'all';

export const AgentMonitor = ({
  items,
  defaultOpen,
}: {
  items: AgentMonitorItem[];
  /** Opened for you when a run lands while you are on the feed. */
  defaultOpen?: boolean;
}): ReactElement | null => {
  // Three steps rather than two: shut, everything that came back, then every
  // agent whatever it is doing. Opening the list to hunt for the two rows that
  // want you among six that do not is the thing this avoids.
  const [view, setView] = useState<AgentMonitorView>(
    defaultOpen ? 'waiting' : 'collapsed',
  );
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [cursor, setCursor] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const count = items.length;

  const isExpanded = view !== 'collapsed';

  useOutsideClick(containerRef, () => setView('collapsed'), isExpanded);
  useKeyboardNavigation(globalThis?.window, [
    ['Escape', () => setView('collapsed')],
  ]);

  useEffect(() => {
    const isStill = globalThis.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    )?.matches;

    if (isExpanded || count < 2 || isStill) {
      return undefined;
    }

    const timer = setInterval(
      () => setCursor((current) => (current + 1) % count),
      tickerMs,
    );

    return () => clearInterval(timer);
  }, [isExpanded, count]);

  if (!count) {
    return null;
  }

  const waiting = items.filter(
    ({ id, state }) => state === 'new' && !dismissed.includes(id),
  );
  const shown = waiting.slice(0, shownByDefault);
  const hidden = waiting.length - shown.length;
  const fresh = waiting.length;
  // Nothing came back, so "what is waiting" would be an empty list: the first
  // press goes straight to everything instead.
  const listed = view === 'all' || !fresh ? items : waiting;
  const rest = items.length - listed.length;
  // Modulo again here: the list can shrink under a cursor that has moved on.
  const showing = items[cursor % count];

  return (
    <FlexCol className="gap-1" ref={containerRef}>
      {isExpanded ? (
        <FlexCol className="agent-line-in">
          <ol className="agent-scroll max-h-72 overflow-y-auto">
            {listed.map((item) => (
              <AgentRow key={item.id} item={item} />
            ))}
          </ol>
          {!!rest && (
            <button
              type="button"
              onClick={() => setView('all')}
              className="agent-press-row rounded-10 px-2 py-1.5 text-left text-text-tertiary transition-colors typo-caption1 hover:bg-surface-hover hover:text-text-primary"
            >
              {`Show all ${items.length} agents`}
            </button>
          )}
        </FlexCol>
      ) : (
        shown.map((item) => (
          <WaitingRow
            key={item.id}
            item={item}
            onDismiss={() => setDismissed((current) => [...current, item.id])}
          />
        ))
      )}

      <button
        type="button"
        aria-expanded={isExpanded}
        aria-label={`Agent monitor: ${fresh} waiting, ${count} in total`}
        onClick={() =>
          setView((current) =>
            current === 'collapsed' ? 'waiting' : 'collapsed',
          )
        }
        // The whole strip is the control, edge to edge and over the bell, and
        // tall enough to be an easy target rather than a 28px sliver.
        className="agent-press-row flex w-full items-center gap-2 rounded-14 px-2 py-2 text-left transition-colors hover:bg-surface-hover"
      >
        {/* Keyed on what it is showing, so a turn of the ticker plays the new
            line in instead of swapping the text under you. */}
        <Typography
          key={isExpanded ? view : showing.id}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="agent-line-in min-w-0 flex-1 truncate"
        >
          {isExpanded ? (
            `${listed.length} ${
              listed === waiting ? 'waiting for you' : 'agents'
            }`
          ) : (
            <>
              <strong className="text-text-primary">{showing.name}</strong>
              {` ${showing.line}`}
            </>
          )}
        </Typography>
        {!isExpanded && !!hidden && (
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
            className="shrink-0"
          >
            {`Show ${hidden} more`}
          </Typography>
        )}
        {fresh ? (
          <FlexRow className="shrink-0 items-center gap-1 rounded-8 bg-brand-default py-0.5 pl-1 pr-1.5 text-white">
            <BellIcon size={IconSize.Size16} secondary />
            <span className="tabular-nums typo-caption2">{fresh}</span>
          </FlexRow>
        ) : (
          <BellIcon
            size={IconSize.Size16}
            className="shrink-0 text-text-quaternary"
          />
        )}
        <ArrowIcon
          size={IconSize.XSmall}
          className={classNames(
            'shrink-0 text-text-quaternary transition-transform',
            !isExpanded && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
    </FlexCol>
  );
};
