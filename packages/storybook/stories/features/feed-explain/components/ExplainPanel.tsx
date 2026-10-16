import type { ReactElement } from 'react';
import React from 'react';
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
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import type { Decision } from '../policy/rank';
import { Exclusion, FollowKind, SourceMode } from '../policy/rank';
import { InterestOrigin, TopicMode } from '../policy/profile';
import {
  getCategory,
  getCategoryDot,
  getLeaveMessage,
  getReason,
} from '../policy/describe';
import { defaultParams } from '../policy/params';
import { usePersonalization } from './PersonalizationContext';
import { useFeedScreen } from './FeedScreenContext';
import { Strong } from './controls';

export enum ExplainVariant {
  Grid = 'grid',
  List = 'list',
}

enum SignalKind {
  Topic = 'topic',
  Source = 'source',
}

interface CardSignal {
  key: string;
  kind: SignalKind;
  id: string;
  label: string;
  source?: Source;
}

const getCardSignals = (decision: Decision, limit: number): CardSignal[] => {
  const { post } = decision;
  const matched = decision.matches.map(({ tag }) => tag);
  const topics = [
    ...matched,
    ...(post.tags ?? []).filter((tag) => !matched.includes(tag)),
  ].map(
    (tag): CardSignal => ({
      key: `topic:${tag}`,
      kind: SignalKind.Topic,
      id: tag,
      label: `#${tag}`,
    }),
  );
  if (!post.source?.id) {
    return topics.slice(0, limit);
  }
  const source: CardSignal = {
    key: `source:${post.source.id}`,
    kind: SignalKind.Source,
    id: post.source.id,
    label: post.source.name ?? post.source.id,
    source: post.source as Source,
  };
  return decision.followedBy === FollowKind.Source
    ? [source, ...topics.slice(0, limit - 1)]
    : [...topics.slice(0, limit - 1), source];
};

export const ReasonLine = ({
  decision,
  isClamped,
}: {
  decision: Decision;
  isClamped?: boolean;
}): ReactElement => {
  const { next } = usePersonalization();
  const { lead, name, tail } = getReason(decision, next.interests);

  return (
    <p className="flex gap-2 text-text-secondary typo-footnote">
      <span
        className={classNames(
          'mt-1.5 size-2 shrink-0 rounded-max',
          getCategoryDot(getCategory(decision)),
        )}
      />
      <span
        className={classNames('min-w-0 shrink', isClamped && 'line-clamp-2')}
      >
        {name ? (
          <>
            {lead}
            <Strong>{name}</Strong>
            {tail}
          </>
        ) : (
          <>
            <Strong>{lead}</Strong>
            {tail}
          </>
        )}
      </span>
    </p>
  );
};

const SignalGlyph = ({ signal }: { signal: CardSignal }): ReactElement =>
  signal.source ? (
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

const SignalRow = ({
  signal,
  size,
}: {
  signal: CardSignal;
  size: ButtonSize;
}): ReactElement => {
  const store = usePersonalization();
  const { state, next } = store;
  const isTopic = signal.kind === SignalKind.Topic;
  const entity = { id: signal.id, name: signal.label };
  const isBlocked = isTopic
    ? state.blockedTags.includes(signal.id)
    : state.blockedSources.includes(signal.id);
  const mode = isTopic ? state.controls[signal.id]?.mode : undefined;
  const isFollowedSource =
    !isTopic && state.followedSources.includes(signal.id);
  const isDemotedSource =
    !isTopic && state.sourceControls[signal.id] === SourceMode.Demoted;
  const interest = next.interests.find(({ tag }) => tag === signal.id);
  const evidence = state.evidence.find(({ topic }) => topic === signal.id);
  let meta: string;
  let metaClassName = 'text-text-quaternary';

  if (isBlocked) {
    meta = 'Blocked';
    metaClassName = 'text-accent-ketchup-default';
  } else if (mode === TopicMode.Muted) {
    meta = 'Muted';
    metaClassName = 'text-accent-ketchup-default';
  } else if (mode === TopicMode.Boosted) {
    meta = 'Showing more';
    metaClassName = 'text-accent-avocado-default';
  } else if (mode === TopicMode.Demoted || isDemotedSource) {
    meta = 'Showing less';
    metaClassName = 'text-accent-bun-default';
  } else if (isFollowedSource || interest?.origin === InterestOrigin.Declared) {
    meta = 'You follow it';
  } else if (isTopic) {
    const stories = interest?.evidence?.stories ?? evidence?.stories ?? 0;
    meta = stories
      ? `You've read ${stories} ${stories === 1 ? 'post' : 'posts'} on it`
      : 'Not one of your topics';
  } else {
    meta = "You don't follow it";
  }

  const onBlock = () =>
    isTopic
      ? store.setTagBlocked(signal.id, !isBlocked)
      : store.setSourceBlocked(entity, !isBlocked);

  return (
    <li
      className={classNames(
        'flex items-center gap-3',
        size === ButtonSize.XSmall ? 'min-h-11' : 'min-h-12',
      )}
    >
      <span className={classNames('flex', isBlocked && 'opacity-50')}>
        <SignalGlyph signal={signal} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={classNames(
            'truncate font-bold typo-footnote',
            isBlocked ? 'text-text-tertiary line-through' : 'text-text-primary',
          )}
        >
          {signal.label}
        </span>
        <span className={classNames('truncate typo-caption1', metaClassName)}>
          {meta}
        </span>
      </span>
      {isBlocked || mode === TopicMode.Muted ? (
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={size}
          onClick={() =>
            isBlocked ? onBlock() : store.setTopicMode(signal.id, undefined)
          }
        >
          {isBlocked ? 'Unblock' : 'Unmute'}
        </Button>
      ) : (
        <span className="flex items-center gap-0.5">
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Bun}
            size={size}
            icon={<MinusIcon />}
            pressed={mode === TopicMode.Demoted || isDemotedSource}
            aria-label={isTopic ? `Less ${signal.label}` : `Less from ${signal.label}`}
            title={isTopic ? `Less ${signal.label}` : `Less from ${signal.label}`}
            onClick={() =>
              isTopic
                ? store.setTopicMode(
                    signal.id,
                    mode === TopicMode.Demoted ? undefined : TopicMode.Demoted,
                  )
                : store.setSourceMode(
                    entity,
                    isDemotedSource ? undefined : SourceMode.Demoted,
                  )
            }
          />
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Avocado}
            size={size}
            icon={<PlusIcon />}
            pressed={mode === TopicMode.Boosted || isFollowedSource}
            aria-label={isTopic ? `More ${signal.label}` : `Follow ${signal.label}`}
            title={isTopic ? `More ${signal.label}` : `Follow ${signal.label}`}
            onClick={() =>
              isTopic
                ? store.setTopicMode(
                    signal.id,
                    mode === TopicMode.Boosted ? undefined : TopicMode.Boosted,
                  )
                : store.setSourceFollowed(entity, !isFollowedSource)
            }
          />
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Ketchup}
            size={size}
            icon={<BlockIcon />}
            aria-label={`Block ${signal.label}`}
            title={`Block ${signal.label}`}
            onClick={onBlock}
          />
        </span>
      )}
    </li>
  );
};

interface LeaveFix {
  label: string;
  run: () => void;
}

const useLeaveFix = (served: Decision, now: Decision): LeaveFix | undefined => {
  const store = usePersonalization();
  const { state } = store;
  const source = {
    id: served.post.source?.id ?? '',
    name: served.post.source?.name ?? 'this source',
  };
  const tag = served.best?.tag;

  switch (now.exclusion) {
    case Exclusion.Hidden:
      return { label: 'Undo', run: () => store.setHidden(served.post.id, false) };
    case Exclusion.BlockedSource:
      return { label: 'Unblock', run: () => store.setSourceBlocked(source, false) };
    case Exclusion.BlockedTag:
      return now.exclusionTag
        ? {
            label: 'Unblock',
            run: () => store.setTagBlocked(now.exclusionTag ?? '', false),
          }
        : undefined;
    case Exclusion.SideTopicsOff:
      return {
        label: 'Turn back on',
        run: () =>
          store.setParam(
            'relevance.side_topic_weight',
            defaultParams['relevance.side_topic_weight'],
          ),
      };
    case Exclusion.PopularFillOff:
      return { label: 'Turn back on', run: () => store.setFilling(true) };
    case Exclusion.NoInterestOrFollow:
      if (tag && state.controls[tag]?.mode === TopicMode.Muted) {
        return { label: 'Unmute', run: () => store.setTopicMode(tag, undefined) };
      }
      if (!state.isLearning) {
        return { label: 'Turn learning on', run: () => store.setLearning(true) };
      }
      if (served.followedBy === FollowKind.Source) {
        return { label: 'Follow again', run: () => store.setSourceFollowed(source, true) };
      }
      return tag
        ? { label: 'Follow again', run: () => store.setTagFollowed(tag, true) }
        : undefined;
    default:
      return undefined;
  }
};

const LeaveNotice = ({
  served,
  now,
}: {
  served: Decision;
  now: Decision;
}): ReactElement => {
  const { state } = usePersonalization();
  const fix = useLeaveFix(served, now);
  const isBlock =
    now.exclusion === Exclusion.BlockedTag ||
    now.exclusion === Exclusion.BlockedSource;
  const Icon = isBlock ? BlockIcon : EyeCancelIcon;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-surface-float text-text-secondary">
        <Icon size={IconSize.Medium} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-bold text-text-primary typo-callout">
          Leaves your feed on refresh
        </span>
        <span className="text-text-tertiary typo-footnote">
          {getLeaveMessage(served, now, state)}
        </span>
      </span>
      {fix && (
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          icon={<UndoIcon />}
          onClick={fix.run}
        >
          {fix.label}
        </Button>
      )}
    </div>
  );
};

interface ExplainPanelProps {
  decision: Decision;
  /** Set when the current settings would drop this card. */
  leaving?: Decision;
  variant: ExplainVariant;
  className?: string;
}

const rowLimit: Record<ExplainVariant, number> = {
  [ExplainVariant.Grid]: 3,
  [ExplainVariant.List]: 3,
};

export const ExplainPanel = ({
  decision,
  leaving,
  variant,
  className,
}: ExplainPanelProps): ReactElement => {
  const { setHidden } = usePersonalization();
  const { onOpenDetails } = useFeedScreen();
  const isGrid = variant === ExplainVariant.Grid;

  if (leaving) {
    return (
      <div className={classNames('min-h-0 flex-1', className)}>
        <LeaveNotice served={decision} now={leaving} />
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'flex min-h-0 flex-1 flex-col gap-3 pt-4',
        isGrid ? 'px-4 pb-2' : 'pb-4',
        className,
      )}
    >
      <ReasonLine decision={decision} isClamped />
      <ul className="flex min-h-0 flex-col gap-1">
        {getCardSignals(decision, rowLimit[variant]).map((signal) => (
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
          onClick={() => setHidden(decision.post.id, true)}
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
            onClick={() => onOpenDetails(decision)}
          >
            Full explanation
          </Button>
        )}
      </div>
    </div>
  );
};
