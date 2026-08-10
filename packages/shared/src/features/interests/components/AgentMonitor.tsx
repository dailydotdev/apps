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
import { useOutsideClick } from '../../../hooks/utils/useOutsideClick';
import { useKeyboardNavigation } from '../../../hooks/useKeyboardNavigation';
import type { AgentMonitorItem, AgentMonitorState } from '../monitorItems';
import { dotClass, inkClass, stateLabel, stateMeaning } from '../monitorItems';

const tickerMs = 3600;
const shownByDefault = 2;

const StateDot = ({ state }: { state: AgentMonitorState }): ReactElement => (
  <span
    aria-hidden
    className={classNames('size-1.5 shrink-0 rounded-6', dotClass[state])}
  />
);

export const AgentState = ({
  state,
  className,
}: {
  state: AgentMonitorState;
  className?: string;
}): ReactElement => (
  <span
    aria-label={stateMeaning[state]}
    className={classNames(
      'flex shrink-0 items-center gap-1.5 typo-caption1',
      inkClass[state],
      className,
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
    {at ? <DateFormat date={at} type={TimeFormatType.Elapsed} /> : 'Not yet'}
  </Typography>
);

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
          size={IconSize.Size16}
          className="shrink-0 rotate-90 text-text-disabled"
          aria-hidden
        />
      </a>
    </Link>
  </li>
);

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
    {/* `passHref`, or the anchor renders with no href at all: legacyBehavior
        only injects one into a plain `<a>` child, not into a component. */}
    <Link href={`${webappUrl}agent/${item.id}`} passHref>
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

type AgentMonitorView = 'collapsed' | 'waiting' | 'all';

export const AgentMonitor = ({
  items,
  defaultOpen,
}: {
  items: AgentMonitorItem[];
  defaultOpen?: boolean;
}): ReactElement | null => {
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
    ({ id, state }) => state === 'waiting' && !dismissed.includes(id),
  );
  const shown = waiting.slice(0, shownByDefault);
  const hidden = waiting.length - shown.length;
  const fresh = waiting.length;
  // With nothing waiting, the `waiting` view would be an empty list.
  const listed = view === 'all' || !fresh ? items : waiting;
  const rest = items.length - listed.length;
  // The list can shrink under a cursor the ticker has already moved on.
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
        className="agent-press-row flex w-full items-center gap-2 rounded-14 px-2 py-2 text-left transition-colors hover:bg-surface-hover"
      >
        {/* Keyed so a turn of the ticker replays the enter animation. */}
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
