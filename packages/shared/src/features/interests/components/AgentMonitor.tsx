import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import Link from '../../../components/utilities/Link';
import { ArrowIcon } from '../../../components/icons';
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
  at?: string | null;
};

const freshMs = 1000 * 60 * 60 * 6;

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
      line:
        agent.lastRunSummary ??
        (isPaused ? 'Paused. Nothing scheduled.' : 'Hunting. Nothing yet.'),
      at: agent.lastRunAt,
    };
  });

const pillClass: Record<AgentMonitorState, string> = {
  new: 'bg-brand-float text-brand-default',
  hunting: 'bg-surface-float text-text-tertiary',
  paused: 'bg-surface-float text-text-quaternary',
};

const StatePill = ({
  state,
  label,
}: {
  state: AgentMonitorState;
  label: string;
}): ReactElement => (
  <span
    className={classNames(
      'flex shrink-0 items-center gap-1 rounded-8 px-1.5 py-0.5 typo-caption1',
      pillClass[state],
    )}
  >
    {state === 'hunting' && (
      <span
        aria-hidden
        className="size-1.5 animate-pulse rounded-6 bg-action-upvote-default"
      />
    )}
    {label}
  </span>
);

const Row = ({ item }: { item: AgentMonitorItem }): ReactElement => (
  <li>
    <Link href={`${webappUrl}agent/${item.id}`}>
      {/* Read like a mail list: who it is from on the first line, what they
          said underneath, everything else on the right. */}
      <a className="flex flex-col gap-0.5 rounded-12 px-2 py-2 transition-colors hover:bg-surface-hover">
        <FlexRow className="items-center gap-2">
          <AgentMark
            status={
              item.state === 'paused'
                ? UserInterestStatus.Paused
                : UserInterestStatus.Active
            }
            isWorking={item.state === 'hunting'}
          />
          <Typography
            type={TypographyType.Footnote}
            bold
            className="min-w-0 flex-1 truncate"
          >
            {item.name}
          </Typography>
          <StatePill
            state={item.state}
            label={
              // eslint-disable-next-line no-nested-ternary
              item.state === 'new'
                ? 'New'
                : item.state === 'hunting'
                ? 'Hunting'
                : 'Paused'
            }
          />
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Quaternary}
            className="w-16 shrink-0 text-right tabular-nums"
          >
            {item.at ? (
              <DateFormat date={item.at} type={TimeFormatType.LastActivity} />
            ) : (
              'Not yet'
            )}
          </Typography>
        </FlexRow>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="line-clamp-2 pl-10"
        >
          {item.line}
        </Typography>
      </a>
    </Link>
  </li>
);

/**
 * One line under the field for everything the agents are doing, and the whole
 * list one gesture away.
 *
 * Collapsed it is a count: how many came back with something, how many are
 * still out. Hovering opens it, clicking pins it open, and each row reads like
 * a message from the agent that sent it. This is the only place a finished run
 * announces itself, on purpose: a toast that flies past takes the news with
 * it, and a badge somewhere else in the chrome is a second inbox to check.
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
  const isOpen = isPinned || isHovered;

  if (!items.length) {
    return null;
  }

  const count = (state: AgentMonitorState) =>
    items.filter((item) => item.state === state).length;
  const fresh = count('new');
  const hunting = count('hunting');
  const paused = count('paused');
  // The most recent run of any of them: the strip answers "when did I last
  // hear anything", not "when did the first one in the list run".
  const latest = items
    .map(({ at }) => at)
    .filter(Boolean)
    .sort()
    .pop();

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isOpen && (
        <FlexCol className="agent-menu-in absolute inset-x-0 bottom-full z-popup mb-2 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-1 shadow-3">
          <FlexRow className="items-center justify-between gap-2 px-2 py-1">
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Quaternary}
            >
              Agent monitor
            </Typography>
            <Link href={`${webappUrl}agent`}>
              <a className="text-text-tertiary typo-caption1 hover:text-text-primary">
                See all
              </a>
            </Link>
          </FlexRow>
          <ol className="max-h-80 overflow-y-auto">
            {items.map((item) => (
              <Row key={item.id} item={item} />
            ))}
          </ol>
        </FlexCol>
      )}

      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setPinned((current) => !current)}
        onKeyDown={(event) => event.key === 'Escape' && setPinned(false)}
        className="flex w-full items-center gap-1.5 rounded-12 px-2 py-1 text-left transition-colors hover:bg-surface-hover"
      >
        {!!fresh && <StatePill state="new" label={`${fresh} new`} />}
        {!!hunting && (
          <StatePill state="hunting" label={`${hunting} hunting`} />
        )}
        {!!paused && <StatePill state="paused" label={`${paused} paused`} />}
        <span className="flex-1" />
        {latest && (
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Quaternary}
            className="tabular-nums"
          >
            <DateFormat date={latest} type={TimeFormatType.LastActivity} />
          </Typography>
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
