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
import { SourceAvatar } from '@dailydotdev/shared/src/components/profile/source/SourceAvatar';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks/usePlusSubscription';
import type { Decision } from '../policy/rank';
import { Exclusion, FollowKind, SourceMode } from '../policy/rank';
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
import { usePersonalization } from './PersonalizationContext';
import { ControlSection, useFeedScreen } from './FeedScreenContext';
import { Strong } from './controls';
import { AnchoredPopover } from './AnchoredPopover';
import { PlusLine, TopicLevelPicker } from './plus';

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

const getBoostHelp = (
  tag: string,
  isInProfile: boolean,
  isPlus: boolean,
): string => {
  if (!isInProfile) {
    return isPlus
      ? `Not in your profile yet. Drag right to get posts about #${tag}.`
      : `Not in your profile yet. Follow it to get posts about #${tag}.`;
  }
  return isPlus
    ? `Posts about #${tag} get this boost. All the way left takes it away.`
    : `Posts about #${tag} get this boost. Less lowers it. Not interested unfollows it and stops it counting.`;
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
  const weight = interest?.weight ?? 0;
  const boost = formatBoost(weight);
  const isSet = !!interest?.control;
  const label = `Boost for #${tag}`;
  const valueClassName = isSet
    ? 'text-accent-cabbage-default'
    : 'text-text-secondary';

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={!!anchor}
        aria-label={`${label}: ${boost}`}
        title={label}
        onClick={(event) =>
          setAnchor(anchor ? null : (event.currentTarget as HTMLButtonElement))
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
      {anchor && (
        <AnchoredPopover
          anchor={anchor}
          label={label}
          onClose={() => setAnchor(null)}
        >
          <header className="flex items-baseline justify-between gap-3">
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
          {!isPlus && interest && (
            <TopicLevelPicker tag={tag} interest={interest} hasValue={false} />
          )}
          <p className="text-text-tertiary typo-footnote">
            {getBoostHelp(tag, !!interest, isPlus)}
          </p>
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
                Back to automatic ({formatBoost(interest?.computedWeight ?? 0)})
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
  const isNotInterested = isTopic
    ? mode === TopicMode.NotInterested
    : sourceMode === SourceMode.NotInterested;
  const isFollowed = isTopic
    ? state.followedTags.includes(signal.id)
    : state.followedSources.includes(signal.id);
  const isDemotedSource = sourceMode === SourceMode.Demoted;
  const interest = isTopic
    ? next.interests.find(({ tag }) => tag === signal.id)
    : undefined;
  const evidence = state.evidence.find(({ topic }) => topic === signal.id);
  let meta: string;
  let metaClassName = 'text-text-quaternary';

  if (isBlocked) {
    meta = 'Blocked';
    metaClassName = 'text-accent-ketchup-default';
  } else if (isNotInterested) {
    meta = 'Not interested';
    metaClassName = 'text-accent-ketchup-default';
  } else if (mode === TopicMode.Boosted) {
    meta = 'Showing more';
    metaClassName = 'text-accent-avocado-default';
  } else if (mode === TopicMode.Demoted || isDemotedSource) {
    meta = 'Showing less';
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
      {isBlocked || isNotInterested ? (
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
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Avocado}
            size={size}
            icon={<PlusIcon />}
            pressed={isFollowed}
            aria-label={followLabel}
            title={followLabel}
            onClick={onFollow}
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
      if (tag && state.controls[tag]?.mode === TopicMode.NotInterested) {
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
