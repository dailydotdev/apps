import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import Link from '../../../components/utilities/Link';
import { ArrowIcon, BellIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { DateFormat } from '../../../components/utilities/DateFormat';
import { TimeFormatType } from '../../../lib/dateFormat';
import { webappUrl } from '../../../lib/constants';
import type { UserInterest } from '../../../graphql/interests';
import { UserInterestStatus } from '../../../graphql/interests';
import { AgentMark } from './AgentMark';

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

const stateLabel: Record<AgentMonitorState, string> = {
  new: 'New',
  hunting: 'Hunting',
  paused: 'Paused',
};

const pillClass: Record<AgentMonitorState, string> = {
  new: 'bg-brand-float text-brand-default',
  hunting: 'bg-surface-float text-text-tertiary',
  paused: 'bg-surface-float text-text-quaternary',
};

const StatePill = ({ state }: { state: AgentMonitorState }): ReactElement => (
  <span
    className={classNames(
      'flex shrink-0 items-center gap-1 rounded-6 px-1.5 typo-caption2',
      pillClass[state],
    )}
  >
    {state === 'hunting' && (
      <span
        aria-hidden
        className="size-1.5 animate-pulse rounded-6 bg-action-upvote-default"
      />
    )}
    {stateLabel[state]}
  </span>
);

/**
 * One agent, one line: who, what, state, when.
 *
 * Single row on purpose. A dozen agents have to be scannable in one look, and
 * a second line each turns the panel into a page.
 */
const Row = ({ item }: { item: AgentMonitorItem }): ReactElement => (
  <li>
    <Link href={`${webappUrl}agent/${item.id}`}>
      <a className="flex items-center gap-2 rounded-10 px-2 py-1 transition-colors hover:bg-surface-hover">
        <AgentMark
          isCompact
          status={
            item.state === 'paused'
              ? UserInterestStatus.Paused
              : UserInterestStatus.Active
          }
          isWorking={item.state === 'hunting'}
        />
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
        <StatePill state={item.state} />
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Quaternary}
          className="w-14 shrink-0 text-right tabular-nums"
        >
          {item.at ? (
            <DateFormat date={item.at} type={TimeFormatType.LastActivity} />
          ) : (
            'Not yet'
          )}
        </Typography>
      </a>
    </Link>
  </li>
);

/**
 * One line under the field for everything the agents are doing, and the whole
 * list one gesture away.
 *
 * Collapsed it is a ticker: each agent's latest, in rotation, so the strip is
 * never a static "3 running" that you stop seeing by the second day. The bell
 * on the right holds the only number that asks for anything, which is how many
 * came back while you were reading. Hovering opens the list and stops the
 * rotation, because text that moves under a pointer is text you cannot read.
 *
 * No toast and no badge elsewhere in the chrome, on purpose: a toast leaves
 * with the news, and a second badge is a second inbox to check.
 */
export const AgentMonitor = ({
  items,
  defaultOpen,
}: {
  items: AgentMonitorItem[];
  /** Opened for you when a run lands while you are on the feed. */
  defaultOpen?: boolean;
}): ReactElement | null => {
  const [isPinned, setPinned] = useState(!!defaultOpen);
  const [isHovered, setHovered] = useState(false);
  const [cursor, setCursor] = useState(0);
  const isOpen = isPinned || isHovered;
  const count = items.length;

  useEffect(() => {
    const isStill = globalThis.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    )?.matches;

    if (isOpen || count < 2 || isStill) {
      return undefined;
    }

    const timer = setInterval(
      () => setCursor((current) => (current + 1) % count),
      tickerMs,
    );

    return () => clearInterval(timer);
  }, [isOpen, count]);

  if (!count) {
    return null;
  }

  const fresh = items.filter(({ state }) => state === 'new').length;
  const hunting = items.filter(({ state }) => state === 'hunting').length;
  const paused = items.filter(({ state }) => state === 'paused').length;
  // Modulo again here: the list can shrink under a cursor that has moved on.
  const showing = items[cursor % count];
  const summary = [
    !!fresh && `${fresh} new`,
    !!hunting && `${hunting} hunting`,
    !!paused && `${paused} paused`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isOpen && (
        // The gap to the strip is padding on this wrapper, not a margin on the
        // panel: a real gap is a hole in the hover target, and the list closes
        // under the pointer on its way up to a row.
        <div className="absolute inset-x-0 bottom-full z-popup pb-2">
          <FlexCol className="agent-menu-in rounded-14 border border-border-subtlest-tertiary bg-background-popover p-1 shadow-3">
            <FlexRow className="items-center justify-between gap-2 px-2 py-1">
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.Quaternary}
              >
                {summary}
              </Typography>
              <Link href={`${webappUrl}agent`}>
                <a className="text-text-tertiary typo-caption2 hover:text-text-primary">
                  See all
                </a>
              </Link>
            </FlexRow>
            <ol className="max-h-72 overflow-y-auto">
              {items.map((item) => (
                <Row key={item.id} item={item} />
              ))}
            </ol>
          </FlexCol>
        </div>
      )}

      <button
        type="button"
        aria-expanded={isOpen}
        aria-label={`Agent monitor: ${summary}`}
        onClick={() => setPinned((current) => !current)}
        onKeyDown={(event) => event.key === 'Escape' && setPinned(false)}
        className="flex w-full items-center gap-2 rounded-10 px-2 py-1 text-left transition-colors hover:bg-surface-hover"
      >
        {/* Keyed on the agent, so a turn of the ticker plays the new line in
            instead of swapping the text under you. */}
        <Typography
          key={showing.id}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="agent-line-in min-w-0 flex-1 truncate"
        >
          <strong className="text-text-primary">{showing.name}</strong>
          {` ${showing.line}`}
        </Typography>
        {/* One object rather than an icon next to a number: filled and loud
            when something is waiting, a quiet glyph when nothing is. */}
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
            !isOpen && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
    </div>
  );
};
