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
import { FlagIcon } from '@dailydotdev/shared/src/components/icons/Flag';
import { HashtagIcon } from '@dailydotdev/shared/src/components/icons/Hashtag';
import { MinusIcon } from '@dailydotdev/shared/src/components/icons/Minus';
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
  Lane,
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
  getShownBecause,
} from '../policy/describe';
import { defaultParams } from '../policy/params';
import { describeAction, FeedAction, glossary } from '../policy/glossary';
import { getCuration, getCurations } from '../policy/curation';
import {
  Duration,
  expiryKey,
  formatUntil,
  getUntil,
  getUntilFor,
} from '../policy/timed';
import { usePersonalization } from './PersonalizationContext';
import { ControlSection, useFeedScreen } from './FeedScreenContext';
import { Strong } from './controls';
import { AnchoredPopover } from './AnchoredPopover';
import {
  getLevelOption,
  getTopicLevel,
  isTimedLocked,
  Level,
  levelActions,
  PlusDurationPicker,
  PlusSection,
  topicModes,
} from './plus';

export enum ExplainVariant {
  Grid = 'grid',
  List = 'list',
}

/** Why a card explains itself: Explain mode, or the reader just downvoted it. */
export enum ExplainMode {
  Explain = 'explain',
  Downvote = 'downvote',
}

enum SignalKind {
  Topic = 'topic',
  Source = 'source',
  Curation = 'curation',
  Fill = 'fill',
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
  // A post's categories always come last, each as its own row, and take the
  // place of its least telling topics so the card keeps its height.
  const curationRows = getCurations(post).map(
    (id): CardSignal => ({
      key: `curation:${id}`,
      kind: SignalKind.Curation,
      id,
      label: getCuration(id).label,
    }),
  );
  // A popular fill-in leads with the switch that added it.
  const fillRows: CardSignal[] =
    decision.lane === Lane.Popular
      ? [
          {
            key: 'fill',
            kind: SignalKind.Fill,
            id: 'fill',
            label: 'Popular fill-ins',
          },
        ]
      : [];
  const topicLimit = Math.max(0, limit - curationRows.length - fillRows.length);
  if (!post.source?.id) {
    return [...fillRows, ...topics.slice(0, topicLimit), ...curationRows].slice(
      0,
      limit,
    );
  }
  const source: CardSignal = {
    key: `source:${post.source.id}`,
    kind: SignalKind.Source,
    id: post.source.id,
    label: post.source.name ?? post.source.id,
    source: post.source as Source,
  };
  const sideTopics = topics.slice(0, Math.max(0, topicLimit - 1));
  const withSource =
    decision.followedBy === FollowKind.Source
      ? [source, ...sideTopics]
      : [...sideTopics, source];
  return [...fillRows, ...withSource, ...curationRows].slice(0, limit);
};

/** Rows sit a step closer after a downvote, to make room for its prompt. */
const getRowHeight = (size: ButtonSize, isDense?: boolean): string => {
  if (size === ButtonSize.XSmall) {
    return isDense ? 'min-h-10' : 'min-h-11';
  }
  return isDense ? 'min-h-11' : 'min-h-12';
};

/** The popular fill-in switch, for a post it added. */
const FillRow = ({
  size,
  isDense,
}: {
  size: ButtonSize;
  isDense?: boolean;
}): ReactElement => {
  const store = usePersonalization();
  const isOn = store.state.isFillingWithPopular;

  return (
    <li
      className={classNames(
        'flex items-center gap-3',
        getRowHeight(size, isDense),
      )}
    >
      <span className="size-6" aria-hidden />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={classNames(
            'min-w-0 shrink truncate font-bold typo-footnote',
            isOn ? 'text-text-primary' : 'text-text-tertiary line-through',
          )}
        >
          Popular fill-ins
        </span>
        <span
          className={classNames(
            'truncate typo-caption1',
            isOn ? 'text-text-quaternary' : 'text-accent-ketchup-default',
          )}
        >
          {isOn ? 'Tops up a short feed with popular posts' : 'Off'}
        </span>
      </span>
      {isOn ? (
        <Tooltip content="Stop popular fill-ins. A short feed stays short instead of topping up with popular posts.">
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Ketchup}
            size={size}
            icon={<BlockIcon />}
            aria-label="Stop popular fill-ins"
            onClick={() => store.setFilling(false)}
          />
        </Tooltip>
      ) : (
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={size}
          onClick={() => store.setFilling(true)}
        >
          Turn on
        </Button>
      )}
    </li>
  );
};

/** One of the post's categories, styled like the topic and source rows. */
const CurationRow = ({
  signal,
  decision,
  size,
  isDense,
}: {
  signal: CardSignal;
  decision: Decision;
  size: ButtonSize;
  isDense?: boolean;
}): ReactElement => {
  const store = usePersonalization();
  const { state } = store;
  const { title } = getCuration(signal.id);
  const isHidden = !!state.blockedCurations?.includes(signal.id);
  const until = getUntilFor(state, expiryKey.curation(signal.id));
  let meta = 'Kind of post';
  let metaClassName = 'text-text-quaternary';
  if (isHidden) {
    metaClassName = 'text-accent-ketchup-default';
    meta = decision.followedBy
      ? "Hidden, but you follow where it's from"
      : `Hidden${
          until !== undefined ? ` ${formatUntil(until, store.now)}` : ''
        }`;
  }

  return (
    <li
      className={classNames(
        'flex items-center gap-3',
        getRowHeight(size, isDense),
      )}
    >
      <span className="size-6" aria-hidden />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={classNames(
            'min-w-0 shrink truncate font-bold typo-footnote',
            isHidden ? 'text-text-tertiary line-through' : 'text-text-primary',
          )}
        >
          {signal.label}
        </span>
        <span className={classNames('truncate typo-caption1', metaClassName)}>
          {meta}
        </span>
      </span>
      {isHidden ? (
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={size}
          onClick={() => store.setCurationHidden(signal.id, false)}
        >
          Show again
        </Button>
      ) : (
        <Tooltip content={describeAction(FeedAction.HideCategory, title)}>
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Ketchup}
            size={size}
            icon={<BlockIcon />}
            aria-label={`Hide ${title}`}
            onClick={() => store.setCurationHidden(signal.id, true)}
          />
        </Tooltip>
      )}
    </li>
  );
};

const ReasonLine = ({
  decision,
  isClamped,
  isDownvote,
}: {
  decision: Decision;
  isClamped?: boolean;
  /** Says why we showed it as a cause, then asks what to change. */
  isDownvote?: boolean;
}): ReactElement => {
  const { next } = usePersonalization();
  const { lead, name, tail } = (isDownvote ? getShownBecause : getReason)(
    decision,
    next.interests,
  );

  return (
    <div className="flex gap-2 typo-footnote">
      <span
        className={classNames(
          'mt-1.5 size-2 shrink-0 rounded-max',
          getCategoryDot(getCategory(decision)),
        )}
      />
      <span className="flex min-w-0 shrink flex-col gap-0.5">
        <span
          className={classNames(
            'text-text-secondary',
            isClamped && 'line-clamp-2',
          )}
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
        {isDownvote && (
          <span className="text-text-tertiary typo-caption1">
            You downvoted it. Change what brought it here:
          </span>
        )}
      </span>
    </div>
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
          {!interest && (
            <p className="text-text-tertiary typo-footnote">
              {`Not in your profile yet. Follow it to get posts about #${tag}.`}
            </p>
          )}
          <LevelList
            tag={tag}
            interest={interest}
            duration={
              isTimedLocked(duration, isPlus) ? Duration.Ongoing : duration
            }
          />
          <PlusSection>
            {(isLocked) => (
              <>
                <div className="flex flex-col gap-1.5">
                  <span className="flex items-baseline justify-between gap-3 text-text-tertiary typo-caption1">
                    Exact boost
                    <span
                      className={classNames(
                        'tabular-nums typo-footnote',
                        isLocked ? 'text-text-quaternary' : valueClassName,
                      )}
                    >
                      {boost}
                    </span>
                  </span>
                  <div
                    className={classNames(
                      'flex',
                      isLocked && 'pointer-events-none opacity-40 grayscale',
                    )}
                  >
                    <Slider
                      compact
                      className="flex-1"
                      disabled={isLocked}
                      min={0}
                      max={maxTopicWeight}
                      step={0.05}
                      value={[weight]}
                      thumbLabel={label}
                      onValueChange={([value]) =>
                        store.setTopicWeight(tag, value)
                      }
                    />
                  </div>
                </div>
                <PlusDurationPicker
                  value={duration}
                  onChange={onDuration}
                  hasUpsell={false}
                />
              </>
            )}
          </PlusSection>
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

/** Show less, with how long it lasts: until changed, or a while with Plus. */
const ShowLessButton = ({
  size,
  label,
  isLowered,
  onLower,
  onReset,
}: {
  size: ButtonSize;
  label: string;
  isLowered: boolean;
  onLower: (duration: Duration) => void;
  onReset: () => void;
}): ReactElement => {
  const store = usePersonalization();
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const subject = label.startsWith('#') ? label : `from ${label}`;
  const choices: Choice[] = [
    Duration.Ongoing,
    Duration.ThreeDays,
    Duration.Week,
  ].map((duration) => {
    const until = getUntil(duration, store.now);
    return {
      id: duration,
      title:
        duration === Duration.Ongoing
          ? 'Until I change it'
          : `For ${duration === Duration.ThreeDays ? '3 days' : 'a week'}`,
      effect: until
        ? `Ranks it lower ${formatUntil(until, store.now)}, then back to Auto.`
        : glossary[FeedAction.ShowLess].effect,
      isTimed: duration !== Duration.Ongoing,
      run: () => onLower(duration),
    };
  });

  return (
    <>
      <Tooltip
        content={
          isLowered
            ? `Back to Auto for ${label}.`
            : describeAction(FeedAction.ShowLess, subject)
        }
      >
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Bun}
          size={size}
          icon={<MinusIcon />}
          pressed={isLowered}
          aria-label={`Show less ${subject}`}
          aria-haspopup={isLowered ? undefined : 'dialog'}
          onClick={(event) => {
            if (isLowered) {
              onReset();
              return;
            }
            setAnchor(
              anchor ? null : (event.currentTarget as HTMLButtonElement),
            );
          }}
        />
      </Tooltip>
      {anchor && (
        <AnchoredPopover
          anchor={anchor}
          label={`Show less ${subject}`}
          onClose={() => setAnchor(null)}
        >
          <header className="flex flex-col gap-0.5">
            <span className="font-bold text-text-primary typo-callout">
              Show less {subject}
            </span>
            <span className="text-text-tertiary typo-footnote">
              How long should it last?
            </span>
          </header>
          <ChoiceList
            choices={choices.filter(({ isTimed }) => !isTimed)}
            onDone={() => setAnchor(null)}
          />
          <PlusSection>
            {(isLocked) => (
              <ChoiceList
                choices={choices.filter(({ isTimed }) => isTimed)}
                isLocked={isLocked}
                onDone={() => setAnchor(null)}
              />
            )}
          </PlusSection>
        </AnchoredPopover>
      )}
    </>
  );
};

const SignalRow = ({
  signal,
  size,
  isDownvote,
}: {
  signal: CardSignal;
  size: ButtonSize;
  /** After a downvote the first button is Show less instead of Follow. */
  isDownvote?: boolean;
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
        getRowHeight(size, isDownvote),
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
          {isDownvote ? (
            <ShowLessButton
              size={size}
              label={signal.label}
              isLowered={isTopic ? mode === TopicMode.Demoted : isDemotedSource}
              onLower={(duration) =>
                isTopic
                  ? store.setTopicMode(signal.id, TopicMode.Demoted, duration)
                  : store.setSourceMode(entity, SourceMode.Demoted, duration)
              }
              onReset={onUndo}
            />
          ) : (
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
          )}
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
        label: `Unblock ${source.name}`,
        run: () => store.setSourceBlocked(source, false),
      };
    case Exclusion.BlockedTag:
      return now.exclusionTag
        ? {
            label: `Unblock #${now.exclusionTag}`,
            run: () => store.setTagBlocked(now.exclusionTag ?? '', false),
          }
        : undefined;
    case Exclusion.BlockedCuration:
      return now.exclusionCuration
        ? {
            label: `Unhide ${getCuration(now.exclusionCuration).title}`,
            run: () =>
              store.setCurationHidden(now.exclusionCuration ?? '', false),
          }
        : undefined;
    case Exclusion.SideTopicsOff:
      return {
        label: 'Turn them back on',
        run: () =>
          store.setParam(
            'relevance.side_topic_weight',
            defaultParams['relevance.side_topic_weight'],
          ),
      };
    case Exclusion.PopularFillOff:
      return {
        label: 'Bring fill-ins back',
        run: () => store.setFilling(true),
      };
    case Exclusion.NoInterestOrFollow:
      if (tag && state.controls[tag]?.weight === 0) {
        return {
          label: `Set #${tag} back to Auto`,
          run: () => store.setTopicWeight(tag, undefined),
        };
      }
      if (tag && state.controls[tag]?.mode === TopicMode.StopLearning) {
        return {
          label: `Learn #${tag} again`,
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
          label: `Follow ${source.name}`,
          run: () => store.setSourceFollowed(source, true),
        };
      }
      return tag
        ? {
            label: `Follow #${tag}`,
            run: () => store.setTagFollowed(tag, true),
          }
        : undefined;
    default:
      return undefined;
  }
};

/** A centered message in the panel: icon, title, line and one action. */
const CardNotice = ({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: typeof BlockIcon;
  title: string;
  message: ReactElement;
  action?: ReactElement;
}): ReactElement => (
  <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-4 text-center">
    <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-surface-float text-text-secondary">
      <Icon size={IconSize.Medium} />
    </span>
    <span className="flex min-w-0 flex-col gap-1">
      <span className="font-bold text-text-primary typo-callout">{title}</span>
      {message}
    </span>
    {action}
  </div>
);

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

  const message = (
    <span className="text-text-tertiary typo-footnote">
      {getLeaveMessage(served, now, state, clock)}
    </span>
  );

  return (
    <CardNotice
      icon={isBlock ? BlockIcon : EyeCancelIcon}
      title="You won't see this after a refresh"
      message={
        now.exclusion === Exclusion.BlockedCuration ? (
          <Tooltip content="Posts of a hidden kind still show when they come from a source you follow.">
            {message}
          </Tooltip>
        ) : (
          message
        )
      }
      action={
        fix && (
          <Button
            type="button"
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            icon={<UndoIcon />}
            onClick={fix.run}
          >
            {fix.label}
          </Button>
        )
      }
    />
  );
};

interface Choice {
  id: string;
  title: string;
  effect: string;
  isTimed: boolean;
  run: () => void;
}

const ChoiceList = ({
  choices,
  isLocked,
  onDone,
}: {
  choices: Choice[];
  isLocked?: boolean;
  onDone: () => void;
}): ReactElement => (
  <ul className="-mx-2 flex flex-col">
    {choices.map((choice) => (
      <li key={choice.id}>
        <button
          type="button"
          aria-disabled={isLocked}
          onClick={() => {
            if (isLocked) {
              return;
            }
            choice.run();
            onDone();
          }}
          className={classNames(
            'flex w-full flex-col rounded-10 px-2 py-1.5 text-left transition-colors',
            isLocked ? 'cursor-default' : 'hover:bg-surface-hover',
          )}
        >
          <span
            className={classNames(
              'font-bold typo-footnote',
              isLocked ? 'text-text-tertiary' : 'text-text-primary',
            )}
          >
            {choice.title}
          </span>
          <span
            className={classNames(
              'typo-caption1',
              isLocked ? 'text-text-quaternary' : 'text-text-tertiary',
            )}
          >
            {choice.effect}
          </span>
        </button>
      </li>
    ))}
  </ul>
);

/** Fewer like this, with how far it goes: this post, or its topic for a while. */
const FewerLikeThis = ({ decision }: { decision: Decision }): ReactElement => {
  const store = usePersonalization();
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const { post } = decision;
  const mainTopic = getMainTopic(post);
  const choices: Choice[] = [
    {
      id: 'post',
      title: glossary[FeedAction.HidePost].verb,
      effect: glossary[FeedAction.HidePost].effect,
      isTimed: false,
      run: () => store.fewerLikeThis(post.id),
    },
    ...(mainTopic
      ? [
          {
            id: Duration.Ongoing,
            title: `Show less #${mainTopic}`,
            effect: `Removes this post too. #${mainTopic} ranks lower until you change it.`,
            isTimed: false,
            run: () =>
              store.fewerLikeThis(post.id, mainTopic, Duration.Ongoing),
          },
          ...[Duration.ThreeDays, Duration.Week].map((duration) => ({
            id: duration,
            title: `Show less #${mainTopic} for ${
              duration === Duration.ThreeDays ? '3 days' : 'a week'
            }`,
            effect: `Removes this post too. #${mainTopic} ranks lower ${formatUntil(
              getUntil(duration, store.now) ?? store.now,
              store.now,
            )}, then goes back to Auto.`,
            isTimed: true,
            run: () => store.fewerLikeThis(post.id, mainTopic, duration),
          })),
        ]
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
          <ChoiceList
            choices={choices.filter(({ isTimed }) => !isTimed)}
            onDone={() => setAnchor(null)}
          />
          {choices.some(({ isTimed }) => isTimed) && (
            <PlusSection>
              {(isLocked) => (
                <ChoiceList
                  choices={choices.filter(({ isTimed }) => isTimed)}
                  isLocked={isLocked}
                  onDone={() => setAnchor(null)}
                />
              )}
            </PlusSection>
          )}
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
  mode?: ExplainMode;
  onClose?: () => void;
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
  mode = ExplainMode.Explain,
  onClose,
  className,
}: ExplainPanelProps): ReactElement => {
  const { onOpenDetails, onExplainCard, onStopAskingAfterDownvote } =
    useFeedScreen();
  const [isReported, setIsReported] = useState(false);
  const isGrid = variant === ExplainVariant.Grid;
  const isDownvote = mode === ExplainMode.Downvote;
  const size = isGrid ? ButtonSize.XSmall : ButtonSize.Small;

  if (leaving || isReported) {
    return (
      <div className={classNames('min-h-0 flex-1', className)}>
        {leaving ? (
          <LeaveNotice served={decision} now={leaving} />
        ) : (
          <CardNotice
            icon={FlagIcon}
            title="Thanks for reporting"
            message={
              <span className="text-text-tertiary typo-footnote">
                We&apos;ll review this post.
              </span>
            }
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'flex min-h-0 flex-1 flex-col',
        isDownvote ? 'gap-2 pt-3' : 'gap-3 pt-4',
        isGrid && 'px-4 pb-2',
        !isGrid && (isDownvote ? 'pb-3' : 'pb-4'),
        className,
      )}
    >
      <ReasonLine decision={decision} isDownvote={isDownvote} isClamped />
      <ul className="flex min-h-0 flex-col gap-1">
        {getCardSignals(decision, rowLimit[variant]).map((signal) => {
          if (signal.kind === SignalKind.Fill) {
            return (
              <FillRow key={signal.key} size={size} isDense={isDownvote} />
            );
          }
          return signal.kind === SignalKind.Curation ? (
            <CurationRow
              key={signal.key}
              signal={signal}
              decision={decision}
              size={size}
              isDense={isDownvote}
            />
          ) : (
            <SignalRow
              key={signal.key}
              signal={signal}
              size={size}
              isDownvote={isDownvote}
            />
          );
        })}
      </ul>
      {isDownvote ? (
        <div className="-mx-1.5 mt-auto flex items-center justify-between gap-2">
          <span className="flex items-center">
            <Tooltip content="Tell us it breaks the rules: spam, broken, or harmful.">
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.XSmall}
                icon={<FlagIcon />}
                className="!text-text-tertiary"
                onClick={() => setIsReported(true)}
              >
                Report
              </Button>
            </Tooltip>
            {onStopAskingAfterDownvote && (
              <Tooltip content="Downvotes stop opening this card. Your downvote stays.">
                <Button
                  type="button"
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.XSmall}
                  className="!text-text-tertiary"
                  onClick={() => {
                    onStopAskingAfterDownvote();
                    onClose?.();
                  }}
                >
                  Don&apos;t ask again
                </Button>
              </Tooltip>
            )}
          </span>
          {onExplainCard && (
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              onClick={() => onExplainCard(decision.post.id)}
            >
              Explain my feed
            </Button>
          )}
        </div>
      ) : (
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
      )}
    </div>
  );
};
