import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '@dailydotdev/shared/src/components/dropdown/DropdownMenu';
import type { MenuItemProps } from '@dailydotdev/shared/src/components/dropdown/common';
import { MenuIcon } from '@dailydotdev/shared/src/components/MenuIcon';
import { BlockIcon } from '@dailydotdev/shared/src/components/icons/Block';
import { MinusIcon } from '@dailydotdev/shared/src/components/icons/Minus';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { UndoIcon } from '@dailydotdev/shared/src/components/icons/Undo';
import type { ExplainedPost, FeedSignal } from './feedExplain';
import {
  FeedReason,
  getSignalName,
  levelLabel,
  levelTextClassName,
  reasonMeta,
  reasonOrder,
  SignalKind,
  TuneLevel,
} from './feedExplain';
import { useFeedTuning } from './FeedTuningContext';

const topicLimit = 8;

const getTopTopics = (items: ExplainedPost[]) => {
  const byKey = new Map<string, { signal: FeedSignal; count: number }>();
  items.forEach(({ signals }) =>
    signals
      .filter(({ kind }) => kind === SignalKind.Topic)
      .forEach((signal) => {
        const entry = byKey.get(signal.key);
        byKey.set(signal.key, {
          signal,
          count: (entry?.count ?? 0) + 1,
        });
      }),
  );
  return [...byKey.values()]
    .filter(({ count }) => count > 1)
    .sort((a, b) => b.count - a.count)
    .slice(0, topicLimit);
};

const TopicChip = ({
  signal,
  count,
}: {
  signal: FeedSignal;
  count: number;
}): ReactElement => {
  const { levels, setLevel, setHoverKey } = useFeedTuning();
  const level = levels[signal.key];
  const name = getSignalName(signal);
  const options: MenuItemProps[] = [
    {
      icon: <MenuIcon Icon={PlusIcon} />,
      label: `Show more ${name}`,
      action: () => setLevel(signal, TuneLevel.More),
    },
    {
      icon: <MenuIcon Icon={MinusIcon} />,
      label: `Show less ${name}`,
      action: () => setLevel(signal, TuneLevel.Less),
    },
    {
      icon: <MenuIcon Icon={BlockIcon} />,
      label: `Block ${name}`,
      action: () => setLevel(signal, TuneLevel.Blocked),
    },
    ...(level
      ? [
          {
            icon: <MenuIcon Icon={UndoIcon} />,
            label: level === TuneLevel.Blocked ? 'Unblock' : 'Back to normal',
            action: () => setLevel(signal, undefined),
          },
        ]
      : []),
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onMouseEnter={() => setHoverKey(signal.key)}
          onMouseLeave={() => setHoverKey(null)}
          className={classNames(
            'flex h-8 items-center gap-1.5 rounded-10 border px-3 typo-footnote',
            level === TuneLevel.Blocked
              ? 'border-border-subtlest-tertiary text-text-tertiary line-through'
              : 'border-border-subtlest-secondary text-text-primary hover:bg-surface-float',
          )}
        >
          <span className="font-bold">{name}</span>
          <span className="tabular-nums text-text-tertiary">{count}</span>
          {level && level !== TuneLevel.Blocked && (
            <span className={classNames('typo-caption2', levelTextClassName[level])}>
              {levelLabel[level]}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuOptions options={options} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface ExplainBarProps {
  items: ExplainedPost[];
  isCompact?: boolean;
  onPickTopics: () => void;
}

export const ExplainBar = ({
  items,
  isCompact,
  onPickTopics,
}: ExplainBarProps): ReactElement => {
  const { focus, setFocus, getLeaveReason } = useFeedTuning();
  const staying = items.filter((item) => !getLeaveReason(item));
  const counts = reasonOrder
    .map((reason) => ({
      reason,
      count: staying.filter((item) => item.reason === reason).length,
    }))
    .filter(({ count }) => count > 0);
  const popularCount =
    counts.find(({ reason }) => reason === FeedReason.Popular)?.count ?? 0;
  const isLearning = staying.length > 0 && popularCount / staying.length >= 0.25;
  const topics = getTopTopics(staying);
  const focusedReason = focus?.type === 'reason' ? focus.reason : null;

  return (
    <section
      className={classNames(
        'flex flex-col rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4',
        isCompact ? 'gap-4' : 'gap-5 tablet:p-5',
      )}
    >
      <header className="flex flex-col gap-1">
        <h2
          className={classNames(
            'font-bold text-text-primary',
            isCompact ? 'typo-body' : 'typo-title3',
          )}
        >
          Why these posts are in your feed
        </h2>
        {!isCompact && (
          <p className="max-w-[40rem] text-text-tertiary typo-callout">
            Every post now shows what put it here. Use{' '}
            <MinusIcon className="inline align-text-bottom" /> or{' '}
            <PlusIcon className="inline align-text-bottom" /> to see less or
            more of something, or block it.
          </p>
        )}
      </header>
      <div className="flex flex-col gap-3">
        <div
          className="flex h-2 gap-0.5 overflow-hidden rounded-4"
          aria-hidden
        >
          {counts.map(({ reason, count }) => (
            <span
              key={reason}
              style={{ flexGrow: count }}
              className={classNames(
                'h-full transition-opacity',
                reasonMeta[reason].dotClassName,
                focusedReason && focusedReason !== reason && 'opacity-30',
              )}
            />
          ))}
        </div>
        <ul className="flex flex-wrap gap-x-1 gap-y-1">
          {counts.map(({ reason, count }) => (
            <li key={reason}>
              <button
                type="button"
                aria-pressed={focusedReason === reason}
                title="Highlight these posts"
                onClick={() =>
                  setFocus(
                    focusedReason === reason ? null : { type: 'reason', reason },
                  )
                }
                className={classNames(
                  '-ml-2 flex h-8 items-center gap-2 rounded-10 px-2 typo-footnote',
                  focusedReason === reason
                    ? 'bg-surface-float text-text-primary'
                    : 'text-text-secondary hover:bg-surface-float',
                )}
              >
                <span
                  className={classNames(
                    'size-2 rounded-max',
                    reasonMeta[reason].dotClassName,
                  )}
                />
                {reasonMeta[reason].label}
                <span className="tabular-nums text-text-tertiary">{count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {isLearning && (
        <div
          className={classNames(
            'flex gap-3 rounded-12 bg-surface-float p-3',
            isCompact ? 'flex-col' : 'items-center',
          )}
        >
          <p className="flex-1 text-text-secondary typo-footnote">
            <strong className="text-text-primary">
              Your feed is still learning what you like.
            </strong>{' '}
            {popularCount} of these {staying.length} posts are popular picks.
            Pick a few more topics and they&apos;ll make room for posts that fit
            you.
          </p>
          <Button
            type="button"
            className={isCompact ? 'self-start' : undefined}
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            onClick={onPickTopics}
          >
            Pick topics
          </Button>
        </div>
      )}
      {topics.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-text-tertiary typo-footnote">
            Most shown topics
          </h3>
          <div
            className={classNames(
              'flex gap-2',
              isCompact
                ? '-mx-4 overflow-x-auto px-4 no-scrollbar'
                : 'flex-wrap',
            )}
          >
            {topics.map(({ signal, count }) => (
              <TopicChip key={signal.key} signal={signal} count={count} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
