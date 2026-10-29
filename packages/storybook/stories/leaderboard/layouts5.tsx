import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { BoardId, Entry, Range } from './data';
import {
  BOARDS,
  boardById,
  DEVS,
  displayRank,
  formatNumber,
  ME,
  RANGES,
  rankBoard,
  unitFor,
} from './data';
import type { Option } from './kit';
import { Delta, Dropdown, FollowButton, RangeSwitch, Row, Score } from './kit';
import { BringTeamCard, SlackDigestCard } from './connected';
import type { Circle } from './layouts2';
import { CIRCLES } from './layouts2';

// Circles has three filters: who you compare with, what you rank by, and
// when. Each variant below keeps the list and widgets and only changes how
// those three are controlled. Scope leads, metric follows, time is smallest.

/* ----------------------------------------------------------------- state */

interface CircleState {
  circle: Circle;
  setCircle: (circle: Circle) => void;
  boardId: BoardId;
  setBoardId: (board: BoardId) => void;
  range: Range;
  setRange: (range: Range) => void;
  list: Entry[];
  mine: Entry;
  label: string;
}

const poolFor = (circle: Circle) => {
  const item = CIRCLES.find((entry) => entry.id === circle) ?? CIRCLES[0];
  return [ME, ...DEVS.filter(item.filter)];
};

const useCircleState = (): CircleState => {
  const [circle, setCircle] = useState<Circle>('following');
  const [boardId, setBoardId] = useState<BoardId>('reputation');
  const [range, setRange] = useState<Range>('week');
  const list = rankBoard(boardId, range, poolFor(circle));
  const current = CIRCLES.find((item) => item.id === circle) ?? CIRCLES[0];
  return {
    circle,
    setCircle,
    boardId,
    setBoardId,
    range,
    setRange,
    list,
    mine: list.find((entry) => entry.dev.isMe) as Entry,
    label: current.label,
  };
};

const rankOf = (state: CircleState, entry: Entry): number =>
  state.circle === 'global' ? displayRank(entry, state.range) : entry.rank;

const circleCount = (circle: Circle): string =>
  circle === 'global'
    ? 'millions of developers'
    : `${poolFor(circle).length} developers`;

/** Your rank in a circle, for the current board and time. */
const myRankIn = (circle: Circle, board: BoardId, range: Range): number => {
  const entry = rankBoard(board, range, poolFor(circle)).find(
    (row) => row.dev.isMe,
  ) as Entry;
  return circle === 'global' ? displayRank(entry, range) : entry.rank;
};

const rangeLabel = (range: Range): string =>
  RANGES.find((item) => item.id === range)?.label.toLowerCase() ?? '';

const circleOptions = (state: CircleState): Option<Circle>[] =>
  CIRCLES.map((item) => ({
    id: item.id,
    label: item.label,
    icon: item.icon,
    meta: `You #${myRankIn(item.id, state.boardId, state.range)}`,
  }));

const boardOptions: Option<BoardId>[] = BOARDS.map((board) => ({
  id: board.id,
  label: board.short,
  meta: board.unit,
}));

/* --------------------------------------------------------- shared pieces */

const CircleList = ({ state }: { state: CircleState }): ReactElement => {
  const board = boardById(state.boardId);
  return (
    <div className="flex flex-col">
      <ol className="flex flex-col">
        {state.list.slice(0, 10).map((entry) => (
          <Row
            key={entry.dev.id}
            rank={rankOf(state, entry)}
            dev={entry.dev}
            highlight={entry.dev.isMe}
            hoverCard
          >
            <Delta value={entry.delta} />
            <Score
              value={entry.score}
              unit={board.unit}
              className="w-28 text-right"
            />
            <span className="flex w-28 justify-end">
              <FollowButton dev={entry.dev} />
            </span>
          </Row>
        ))}
      </ol>
      <Button
        type="button"
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        className="mt-1 self-center"
      >
        Show the top 100
      </Button>
    </div>
  );
};

const CircleAside = ({ state }: { state: CircleState }): ReactElement => (
  <aside className="flex w-80 shrink-0 flex-col gap-4">
    {state.circle === 'company' && (
      <SlackDigestCard company={state.label} top={state.list} />
    )}
    <BringTeamCard />
  </aside>
);

const Shell = ({
  state,
  header,
  children,
}: {
  state: CircleState;
  header: ReactNode;
  children?: ReactNode;
}): ReactElement => (
  <div className="flex gap-8 px-8 py-6">
    <section className="flex min-w-0 flex-1 flex-col gap-5">
      {header}
      {children ?? <CircleList state={state} />}
    </section>
    <CircleAside state={state} />
  </div>
);

/** "You’re #3 of 15 in People you follow this week." */
const Summary = ({ state }: { state: CircleState }): ReactElement => {
  const board = boardById(state.boardId);
  return (
    <span className="text-text-tertiary typo-callout">
      You’re{' '}
      <strong className="text-text-primary">
        #{rankOf(state, state.mine)}
      </strong>
      {state.circle !== 'global' && ` of ${state.list.length}`} with{' '}
      {formatNumber(state.mine.score)} {unitFor(state.mine.score, board.unit)}{' '}
      {rangeLabel(state.range)}.
    </span>
  );
};

/* -------------------------------------------------------- 1. one toolbar */

export const ToolbarFilters = (): ReactElement => {
  const state = useCircleState();
  return (
    <Shell
      state={state}
      header={
        <div className="flex flex-col gap-4">
          <h1 className="font-bold typo-title1">Leaderboard</h1>
          <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary pb-4">
            <Dropdown
              value={state.circle}
              options={circleOptions(state)}
              onChange={state.setCircle}
            />
            <Dropdown
              value={state.boardId}
              options={boardOptions}
              onChange={state.setBoardId}
            />
            <span className="ml-auto">
              <RangeSwitch
                value={state.range}
                onChange={state.setRange}
                size="sm"
              />
            </span>
          </div>
          <Summary state={state} />
        </div>
      }
    />
  );
};

/* ---------------------------------------------------- 2. circles sidebar */

export const SidebarCircles = (): ReactElement => {
  const state = useCircleState();
  return (
    <div className="flex gap-8 px-8 py-6">
      <nav className="flex w-60 shrink-0 flex-col gap-1">
        <span className="px-3 pb-2 font-bold text-text-quaternary typo-caption1">
          Compare with
        </span>
        {CIRCLES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => state.setCircle(item.id)}
            className={classNames(
              'flex items-center gap-3 rounded-12 px-3 py-2 text-left',
              item.id === state.circle
                ? 'bg-surface-float'
                : 'hover:bg-surface-hover',
            )}
          >
            <span className="text-text-tertiary">{item.icon}</span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span
                className={classNames(
                  'truncate typo-callout',
                  item.id === state.circle
                    ? 'font-bold text-text-primary'
                    : 'text-text-secondary',
                )}
              >
                {item.label}
              </span>
              <span className="truncate text-text-quaternary typo-caption1">
                {circleCount(item.id)}
              </span>
            </span>
            <span className="font-bold tabular-nums text-text-tertiary typo-footnote">
              #{myRankIn(item.id, state.boardId, state.range)}
            </span>
          </button>
        ))}
        <button
          type="button"
          className="mt-1 rounded-12 px-3 py-2 text-left font-bold text-text-tertiary typo-footnote hover:bg-surface-hover"
        >
          + Add a squad
        </button>
      </nav>
      <section className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-bold typo-title2">{state.label}</h1>
            <Summary state={state} />
          </div>
          <div className="flex items-center gap-2">
            <Dropdown
              value={state.boardId}
              options={boardOptions}
              onChange={state.setBoardId}
            />
            <RangeSwitch
              value={state.range}
              onChange={state.setRange}
              size="sm"
            />
          </div>
        </div>
        <CircleList state={state} />
      </section>
      <CircleAside state={state} />
    </div>
  );
};
