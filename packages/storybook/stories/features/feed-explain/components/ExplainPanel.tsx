import type { ReactElement } from 'react';
import React, { useState } from 'react';
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
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { UndoIcon } from '@dailydotdev/shared/src/components/icons/Undo';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Slider } from '@dailydotdev/shared/src/components/fields/Slider';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { SourceAvatar } from '@dailydotdev/shared/src/components/profile/source/SourceAvatar';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks/usePlusSubscription';
import type { Decision } from '../policy/rank';
import {
  Exclusion,
  FollowKind,
  getMainTopic,
  SourceMode,
} from '../policy/rank';
import type { Interest } from '../policy/profile';
import { maxTopicWeight, TopicMode } from '../policy/profile';
import {
  formatBoost,
  getCategory,
  getCategoryDot,
  getLeaveMessage,
  getReason,
} from '../policy/describe';
import { defaultParams } from '../policy/params';
import { describeAction, FeedAction, glossary } from '../policy/glossary';
import {
  Duration,
  expiryKey,
  formatUntil,
  getUntil,
  getUntilFor,
} from '../policy/timed';
import { usePersonalization } from './PersonalizationContext';
import { ControlSection, useFeedScreen } from './FeedScreenContext';
import { DurationPicker, Strong } from './controls';
import { AnchoredPopover } from './AnchoredPopover';
import {
  getLevelOption,
  getTopicLevel,
  Level,
  levelActions,
  PlusLine,
  topicModes,
} from './plus';

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

const LevelList = ({
  tag,
  interest,
  duration,
}: {
  tag: string;
  interest?: Interest;
  duration: Duration;
}): ReactElement => {
  const store = usePersonalization();
  const current = getTopicLevel(store.state.controls[tag]);
  // Show more and Stop learning only change a topic already in the profile.
  const levels = interest
    ? [Level.More, Level.Auto, Level.Less, Level.StopLearning]
    : [Level.Auto, Level.Less];

  return (
    <ul
      role="radiogroup"
      aria-label={`Level for #${tag}`}
      className="-mx-2 flex flex-col"
    >
      {levels.map((level) => {
        const option = getLevelOption(level, `#${tag}`);
        const isActive = current === level;
        return (
          <li key={level}>
            <button
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() =>
                store.setTopicMode(
                  tag,
                  topicModes[level],
                  level === Level.Auto ? undefined : duration,
                )
              }
              className={classNames(
                'flex w-full items-start gap-2 rounded-10 px-2 py-1.5 text-left transition-colors hover:bg-surface-hover',
                isActive && 'bg-surface-float',
              )}
            >
              <span
                className={classNames(
                  'mt-1 flex size-3.5 shrink-0 items-center justify-center rounded-max border-2',
                  isActive
                    ? 'border-accent-cabbage-default'
                    : 'border-border-subtlest-primary',
                )}
              >
                {isActive && (
                  <span className="size-1.5 rounded-max bg-accent-cabbage-default" />
                )}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span
                  className={classNames(
                    'font-bold typo-footnote',
                    isActive && option.activeClassName
                      ? option.activeClassName
                      : 'text-text-primary',
                  )}
                >
                  {option.label}
                </span>
                <span className="text-text-tertiary typo-caption1">
                  {glossary[levelActions[level]].effect}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

const TopicBoost = ({
  tag,
  interest,
}: {
  tag: string;
  /** Unset when the topic is not in the profile yet. */
  interest?: Interest;
}): ReactElement => {
  const store = usePersonalization();
  const { isPlus } = usePlusSubscription();
  const { onOpenControls } = useFeedScreen();
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [duration, setDuration] = useState(Duration.Ongoing);
  const control = store.state.controls[tag];
  const weight = interest?.weight ?? 0;
  const boost = formatBoost(weight);
  const isSet = !!control;
  const until = getUntilFor(store.state, expiryKey.topic(tag));
  const label = `Boost for #${tag}`;
  const valueClassName = isSet
    ? 'text-accent-cabbage-default'
    : 'text-text-secondary';
  const onDuration = (next: Duration) => {
    setDuration(next);
    if (control?.mode) {
      store.setTopicMode(tag, control.mode, next);
    }
  };

  return (
    <>
      <Tooltip
        content={`How much posts about #${tag} count. Tap to change it.`}
      >
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={!!anchor}
          aria-label={`${label}: ${boost}`}
          onClick={(event) =>
            setAnchor(
              anchor ? null : (event.currentTarget as HTMLButtonElement),
            )
          }
          className={classNames(
            'flex h-5 items-center rounded-6 px-1.5 font-bold tabular-nums typo-caption1 transition-colors',
            anchor
              ? 'bg-surface-hover'
              : 'bg-surface-float hover:bg-surface-hover',
            valueClassName,
          )}
        >
          {boost}
        </button>
      </Tooltip>
      {anchor && (
        <AnchoredPopover
          anchor={anchor}
          label={label}
          onClose={() => setAnchor(null)}
        >
          <header className="flex flex-col gap-0.5">
            <span className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 shrink font-bold text-text-primary typo-callout">
                {label}
              </span>
              <span
                className={classNames(
                  'shrink-0 tabular-nums typo-callout',
                  valueClassName,
                )}
              >
                {boost}
              </span>
            </span>
            {until !== undefined && control?.mode && (
              <span className="text-text-tertiary typo-caption1">
                {
                  glossary[levelActions[getTopicLevel(control) ?? Level.Auto]]
                    .verb
                }{' '}
                {formatUntil(until, store.now)}, then back to Auto.
              </span>
            )}
          </header>
          {isPlus && (
            <Slider
              compact
              min={0}
              max={maxTopicWeight}
              step={0.05}
              value={[weight]}
              thumbLabel={label}
              onValueChange={([value]) => store.setTopicWeight(tag, value)}
            />
          )}
          {!interest && (
            <p className="text-text-tertiary typo-footnote">
              {isPlus
                ? `Not in your profile yet. Drag right, or follow it, to get posts about #${tag}.`
                : `Not in your profile yet. Follow it to get posts about #${tag}.`}
            </p>
          )}
          <LevelList tag={tag} interest={interest} duration={duration} />
          <DurationPicker value={duration} onChange={onDuration} />
          {!isPlus && <PlusLine>Set the exact boost with Plus</PlusLine>}
          <footer className="flex min-h-6 items-center justify-between gap-2 border-t border-border-subtlest-tertiary pt-3 text-text-quaternary typo-caption1">
            {isSet ? (
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.XSmall}
                className="-ml-1.5"
                onClick={() => store.setTopicMode(tag, undefined)}
              >
                Back to Auto ({formatBoost(interest?.computedWeight ?? 0)})
              </Button>
            ) : (
              <span>Changes apply when you refresh.</span>
            )}
            {onOpenControls && (
              <button
                type="button"
                className="font-bold text-text-link hover:underline"
                onClick={() => onOpenControls(ControlSection.Interests)}
              >
                All topics
              </button>
            )}
          </footer>
        </AnchoredPopover>
      )}
    </>
  );
};

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
  const sourceMode = isTopic ? undefined : state.sourceControls[signal.id];
  const isStopLearning = mode === TopicMode.StopLearning;
  const isFollowed = isTopic
    ? state.followedTags.includes(signal.id)
    : state.followedSources.includes(signal.id);
  const isDemotedSource = sourceMode === SourceMode.Demoted;
  const interest = isTopic
    ? next.interests.find(({ tag }) => tag === signal.id)
    : undefined;
  const evidence = state.evidence.find(({ topic }) => topic === signal.id);
  const untilKey = (() => {
    if (isBlocked) {
      return isTopic
        ? expiryKey.blockedTag(signal.id)
        : expiryKey.blockedSource(signal.id);
    }
    return isTopic ? expiryKey.topic(signal.id) : expiryKey.source(signal.id);
  })();
  const until = getUntilFor(state, untilKey);
  const untilText =
    until !== undefined ? ` ${formatUntil(until, store.now)}` : '';
  let meta: string;
  let metaClassName = 'text-text-quaternary';

  if (isBlocked) {
    meta = `Blocked${untilText}`;
    metaClassName = 'text-accent-ketchup-default';
  } else if (isStopLearning) {
    meta = `Not learning from your reading${untilText}`;
    metaClassName = 'text-accent-ketchup-default';
  } else if (mode === TopicMode.Boosted) {
    meta = `Showing more${untilText}`;
    metaClassName = 'text-accent-avocado-default';
  } else if (mode === TopicMode.Demoted || isDemotedSource) {
    meta = `Showing less${untilText}`;
    metaClassName = 'text-accent-bun-default';
  } else if (isTopic) {
    const stories = interest?.evidence?.stories ?? evidence?.stories ?? 0;
    if (stories) {
      meta = `You've read ${stories} ${stories === 1 ? 'post' : 'posts'} on it`;
    } else if (isFollowed) {
      meta = 'You follow it';
    } else if (interest?.control?.weight !== undefined) {
      meta = 'You set its boost';
    } else {
      meta = 'Not one of your topics';
    }
  } else {
    meta = isFollowed ? 'You follow it' : "You don't follow it";
  }

  const onBlock = () =>
    isTopic
      ? store.setTagBlocked(signal.id, !isBlocked)
      : store.setSourceBlocked(entity, !isBlocked);
  const onUndo = () =>
    isTopic
      ? store.setTopicMode(signal.id, undefined)
      : store.setSourceMode(entity, undefined);
  const followLabel = `${isFollowed ? 'Unfollow' : 'Follow'} ${signal.label}`;
  const followHint = describeAction(
    isFollowed ? FeedAction.Unfollow : FeedAction.Follow,
    signal.label,
  );
  const onFollow = () =>
    isTopic
      ? store.setTagFollowed(signal.id, !isFollowed)
      : store.setSourceFollowed(entity, !isFollowed);

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
        <span className="flex min-w-0 items-center gap-1.5">
          <span
            className={classNames(
              'min-w-0 shrink truncate font-bold typo-footnote',
              isBlocked
                ? 'text-text-tertiary line-through'
                : 'text-text-primary',
            )}
          >
            {signal.label}
          </span>
          {isTopic && !isBlocked && (
            <TopicBoost tag={signal.id} interest={interest} />
          )}
        </span>
        <span className={classNames('truncate typo-caption1', metaClassName)}>
          {meta}
        </span>
      </span>
      {isBlocked || isStopLearning ? (
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={size}
          onClick={isBlocked ? onBlock : onUndo}
        >
          {isBlocked ? 'Unblock' : 'Undo'}
        </Button>
      ) : (
        <span className="flex items-center gap-0.5">
          <Tooltip content={followHint}>
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              color={ButtonColor.Avocado}
              size={size}
              icon={<PlusIcon />}
              pressed={isFollowed}
              aria-label={followLabel}
              onClick={onFollow}
            />
          </Tooltip>
          <Tooltip content={describeAction(FeedAction.Block, signal.label)}>
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              color={ButtonColor.Ketchup}
              size={size}
              icon={<BlockIcon />}
              aria-label={`Block ${signal.label}`}
              onClick={onBlock}
            />
          </Tooltip>
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
      return {
        label: 'Undo',
        run: () => store.setHidden(served.post.id, false),
      };
    case Exclusion.BlockedSource:
      return {
        label: 'Unblock',
        run: () => store.setSourceBlocked(source, false),
      };
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
      if (tag && state.controls[tag]?.weight === 0) {
        return {
          label: 'Undo',
          run: () => store.setTopicWeight(tag, undefined),
        };
      }
      if (tag && state.controls[tag]?.mode === TopicMode.StopLearning) {
        return {
          label: 'Undo',
          run: () => store.setTopicMode(tag, undefined),
        };
      }
      if (!state.isLearning) {
        return {
          label: 'Turn learning on',
          run: () => store.setLearning(true),
        };
      }
      if (served.followedBy === FollowKind.Source) {
        return {
          label: 'Follow again',
          run: () => store.setSourceFollowed(source, true),
        };
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
  const { state, now: clock } = usePersonalization();
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
          {getLeaveMessage(served, now, state, clock)}
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

/** Fewer like this, with how far it goes: this post, or its topic for a while. */
const FewerLikeThis = ({ decision }: { decision: Decision }): ReactElement => {
  const store = usePersonalization();
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const { post } = decision;
  const mainTopic = getMainTopic(post);
  const choices = [
    {
      id: 'post',
      title: glossary[FeedAction.HidePost].verb,
      effect: glossary[FeedAction.HidePost].effect,
      run: () => store.fewerLikeThis(post.id),
    },
    ...(mainTopic
      ? [Duration.ThreeDays, Duration.Week].map((duration) => ({
          id: duration,
          title: `Show less #${mainTopic} for ${
            duration === Duration.ThreeDays ? '3 days' : 'a week'
          }`,
          effect: `Removes this post too. #${mainTopic} ranks lower ${formatUntil(
            getUntil(duration, store.now) ?? store.now,
            store.now,
          )}, then goes back to Auto.`,
          run: () => store.fewerLikeThis(post.id, mainTopic, duration),
        }))
      : []),
  ];

  return (
    <>
      <Tooltip content={describeAction(FeedAction.FewerLikeThis)}>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          icon={<EyeCancelIcon />}
          className="!text-text-tertiary"
          aria-haspopup="dialog"
          aria-expanded={!!anchor}
          onClick={(event) =>
            setAnchor(
              anchor ? null : (event.currentTarget as HTMLButtonElement),
            )
          }
        >
          {glossary[FeedAction.FewerLikeThis].verb}
        </Button>
      </Tooltip>
      {anchor && (
        <AnchoredPopover
          anchor={anchor}
          label={glossary[FeedAction.FewerLikeThis].verb}
          onClose={() => setAnchor(null)}
        >
          <header className="flex flex-col gap-0.5">
            <span className="font-bold text-text-primary typo-callout">
              {glossary[FeedAction.FewerLikeThis].verb}
            </span>
            <span className="text-text-tertiary typo-footnote">
              How far should it go?
            </span>
          </header>
          <ul className="-mx-2 flex flex-col">
            {choices.map((choice) => (
              <li key={choice.id}>
                <button
                  type="button"
                  onClick={() => {
                    choice.run();
                    setAnchor(null);
                  }}
                  className="flex w-full flex-col rounded-10 px-2 py-1.5 text-left transition-colors hover:bg-surface-hover"
                >
                  <span className="font-bold text-text-primary typo-footnote">
                    {choice.title}
                  </span>
                  <span className="text-text-tertiary typo-caption1">
                    {choice.effect}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </AnchoredPopover>
      )}
    </>
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
        <FewerLikeThis decision={decision} />
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
