import type { ReactElement, ReactNode } from 'react';
import React, { createContext, useContext } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { BlockIcon } from '@dailydotdev/shared/src/components/icons/Block';
import { EyeCancelIcon } from '@dailydotdev/shared/src/components/icons/EyeCancel';
import { HashtagIcon } from '@dailydotdev/shared/src/components/icons/Hashtag';
import { MinusIcon } from '@dailydotdev/shared/src/components/icons/Minus';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { UndoIcon } from '@dailydotdev/shared/src/components/icons/Undo';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { SourceAvatar } from '@dailydotdev/shared/src/components/profile/source/SourceAvatar';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import type { ExplainedPost, FeedSignal } from './feedExplain';
import {
  FeedReason,
  getCardSignals,
  getSignalName,
  levelLabel,
  levelTextClassName,
  originLabel,
  reasonMeta,
  SignalKind,
  SignalOrigin,
  TuneLevel,
} from './feedExplain';
import type { LeaveReason } from './FeedTuningContext';
import { useFeedTuning } from './FeedTuningContext';

interface FeedScreenValue {
  /** How many posts on screen carry each signal key. */
  counts: Record<string, number>;
  /** Opens the full "Why am I seeing this?" explanation. */
  onOpenDetails?: (item: ExplainedPost) => void;
}

export const FeedScreenContext = createContext<FeedScreenValue>({
  counts: {},
});

export enum ExplainVariant {
  Grid = 'grid',
  List = 'list',
}

const Strong = ({ children }: { children: ReactNode }): ReactElement => (
  <strong className="font-bold text-text-primary">{children}</strong>
);

export const ReasonLine = ({
  item,
  isClamped,
}: {
  item: ExplainedPost;
  isClamped?: boolean;
}): ReactElement => {
  const name = item.reasonSignal && getSignalName(item.reasonSignal);
  const copy: Record<FeedReason, ReactNode> = {
    [FeedReason.Following]: (
      <>
        You follow <Strong>{name}</Strong>.
      </>
    ),
    [FeedReason.Picked]: (
      <>
        You picked <Strong>{name}</Strong> when you signed up.
      </>
    ),
    [FeedReason.Reading]: (
      <>
        You&apos;ve been reading about <Strong>{name}</Strong>.
      </>
    ),
    [FeedReason.Popular]: (
      <>
        <Strong>Popular this week.</Strong> Shown while your feed learns what
        you like.
      </>
    ),
  };

  return (
    <p className="flex gap-2 text-text-secondary typo-footnote">
      <span
        className={classNames(
          'mt-1.5 size-2 shrink-0 rounded-max',
          reasonMeta[item.reason].dotClassName,
        )}
      />
      <span
        className={classNames('min-w-0 shrink', isClamped && 'line-clamp-2')}
      >
        {copy[item.reason]}
      </span>
    </p>
  );
};

const kindLabel: Record<SignalKind, string> = {
  [SignalKind.Topic]: 'Topic',
  [SignalKind.Source]: 'Source',
};

const SignalGlyph = ({ signal }: { signal: FeedSignal }): ReactElement =>
  signal.kind === SignalKind.Source && signal.source ? (
    <SourceAvatar
      source={signal.source}
      size={ProfileImageSize.Small}
      className="!mr-0"
    />
  ) : (
    <span className="flex size-6 items-center justify-center rounded-8 bg-surface-float text-text-tertiary">
      <HashtagIcon size={IconSize.Size16} secondary />
    </span>
  );

const getActionLabels = (signal: FeedSignal) => {
  const name = getSignalName(signal);
  return signal.kind === SignalKind.Source
    ? {
        less: `Less from ${name}`,
        more: `More from ${name}`,
        block: `Block ${name}`,
      }
    : { less: `Less ${name}`, more: `More ${name}`, block: `Block ${name}` };
};

export const SignalRow = ({
  signal,
  size = ButtonSize.XSmall,
}: {
  signal: FeedSignal;
  size?: ButtonSize;
}): ReactElement => {
  const { levels, setLevel, setHoverKey } = useFeedTuning();
  const { counts } = useContext(FeedScreenContext);
  const level = levels[signal.key];
  const count = counts[signal.key] ?? 0;
  const labels = getActionLabels(signal);
  const isBlocked = level === TuneLevel.Blocked;
  const meta = [
    signal.origin === SignalOrigin.Post
      ? kindLabel[signal.kind]
      : originLabel[signal.origin],
    count > 1 && `in ${count} posts`,
  ]
    .filter(Boolean)
    .join(' · ');
  const toggle = (next: TuneLevel) =>
    setLevel(signal, level === next ? undefined : next);

  return (
    <li
      className={classNames(
        'flex items-center gap-2',
        size === ButtonSize.XSmall ? 'min-h-8' : 'min-h-10',
      )}
      onMouseEnter={() => setHoverKey(signal.key)}
      onMouseLeave={() => setHoverKey(null)}
    >
      <span className={classNames('flex', isBlocked && 'opacity-50')}>
        <SignalGlyph signal={signal} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span
          className={classNames(
            'truncate font-bold typo-footnote',
            isBlocked ? 'text-text-tertiary line-through' : 'text-text-primary',
          )}
        >
          {getSignalName(signal)}
        </span>
        <span
          className={classNames(
            'truncate typo-caption2',
            level ? levelTextClassName[level] : 'text-text-quaternary',
          )}
        >
          {level ? levelLabel[level] : meta}
        </span>
      </span>
      {isBlocked ? (
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={size}
          onClick={() => setLevel(signal, undefined)}
        >
          Unblock
        </Button>
      ) : (
        <span className="flex items-center gap-0.5">
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Bun}
            size={size}
            icon={<MinusIcon />}
            pressed={level === TuneLevel.Less}
            aria-label={labels.less}
            title={labels.less}
            onClick={() => toggle(TuneLevel.Less)}
          />
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Avocado}
            size={size}
            icon={<PlusIcon />}
            pressed={level === TuneLevel.More}
            aria-label={labels.more}
            title={labels.more}
            onClick={() => toggle(TuneLevel.More)}
          />
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Ketchup}
            size={size}
            icon={<BlockIcon />}
            aria-label={labels.block}
            title={labels.block}
            onClick={() => setLevel(signal, TuneLevel.Blocked)}
          />
        </span>
      )}
    </li>
  );
};

const LeaveNotice = ({
  item,
  leaveReason,
  variant,
}: {
  item: ExplainedPost;
  leaveReason: LeaveReason;
  variant: ExplainVariant;
}): ReactElement => {
  const { setLevel, setDismissed } = useFeedTuning();
  const isGrid = variant === ExplainVariant.Grid;
  const Icon = leaveReason.type === 'blocked' ? BlockIcon : EyeCancelIcon;
  const onUndo = () => {
    if (leaveReason.type === 'dismissed') {
      setDismissed(item.post.id, false);
      return;
    }
    const signal = item.signals.find(
      ({ key }) => key === leaveReason.signal.key,
    );
    if (signal) {
      setLevel(signal, undefined);
    }
  };

  return (
    <div
      className={classNames(
        'flex gap-3',
        isGrid
          ? 'h-full flex-col items-center justify-center px-6 text-center'
          : 'items-center',
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-surface-float text-text-secondary">
        <Icon size={IconSize.Medium} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-bold text-text-primary typo-callout">
          Leaves your feed on refresh
        </span>
        <span className="text-text-tertiary typo-footnote">
          {leaveReason.type === 'blocked' ? (
            <>
              You blocked <Strong>{getSignalName(leaveReason.signal)}</Strong>.
            </>
          ) : (
            'You asked for fewer posts like this.'
          )}
        </span>
      </span>
      <Button
        type="button"
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        icon={<UndoIcon />}
        onClick={onUndo}
      >
        Undo
      </Button>
    </div>
  );
};

interface ExplainPanelProps {
  item: ExplainedPost;
  variant: ExplainVariant;
  className?: string;
}

const cardRows: Record<ExplainVariant, number> = {
  [ExplainVariant.Grid]: 4,
  [ExplainVariant.List]: 3,
};

export const ExplainPanel = ({
  item,
  variant,
  className,
}: ExplainPanelProps): ReactElement => {
  const { getLeaveReason, setDismissed } = useFeedTuning();
  const { onOpenDetails } = useContext(FeedScreenContext);
  const leaveReason = getLeaveReason(item);
  const isGrid = variant === ExplainVariant.Grid;

  if (leaveReason) {
    return (
      <div className={classNames(isGrid ? 'min-h-0 flex-1' : 'py-3', className)}>
        <LeaveNotice item={item} leaveReason={leaveReason} variant={variant} />
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'flex flex-col gap-2',
        isGrid ? 'min-h-0 flex-1 px-4 pb-2 pt-3' : 'py-3',
        className,
      )}
    >
      <ReasonLine item={item} isClamped={isGrid} />
      <ul className={classNames('flex flex-col', isGrid && 'min-h-0')}>
        {getCardSignals(item, cardRows[variant]).map((signal) => (
          <SignalRow
            key={signal.key}
            signal={signal}
            size={isGrid ? ButtonSize.XSmall : ButtonSize.Small}
          />
        ))}
      </ul>
      <div className="-mx-1.5 mt-auto flex items-center justify-between gap-2">
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          icon={<EyeCancelIcon />}
          className="!text-text-tertiary"
          onClick={() => setDismissed(item.post.id, true)}
        >
          Fewer like this
        </Button>
        {onOpenDetails && (
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.XSmall}
            icon={<ArrowIcon className="rotate-90" />}
            iconPosition={ButtonIconPosition.Right}
            aria-haspopup="dialog"
            onClick={() => onOpenDetails(item)}
          >
            Full explanation
          </Button>
        )}
      </div>
    </div>
  );
};
