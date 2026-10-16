import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Slider } from '@dailydotdev/shared/src/components/fields/Slider';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { HashtagIcon } from '@dailydotdev/shared/src/components/icons/Hashtag';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { Interest, TopicEvidence } from '../../policy/profile';
import {
  InterestOrigin,
  Strength,
  strengthLabel,
  strengthRule,
  TopicMode,
} from '../../policy/profile';
import { usePersonalization } from '../PersonalizationContext';
import { ControlSection } from '../FeedScreenContext';
import { Segmented } from '../controls';
import { Badge, PanelCard, PanelSection } from './Section';

enum RowStatus {
  Followed = 'followed',
  Learned = 'learned',
  Early = 'early',
  Muted = 'muted',
  Blocked = 'blocked',
}

enum Filter {
  All = 'all',
  Followed = 'followed',
  Learned = 'learned',
  Early = 'early',
  Off = 'off',
}

interface ProfileRow {
  tag: string;
  status: RowStatus;
  interest?: Interest;
  evidence?: TopicEvidence;
}

const statusBadge: Record<RowStatus, { label: string; className: string }> = {
  [RowStatus.Followed]: {
    label: 'You follow',
    className: 'bg-accent-cabbage-flat text-accent-cabbage-default',
  },
  [RowStatus.Learned]: {
    label: 'Learned',
    className: 'bg-accent-blueCheese-flat text-accent-blueCheese-default',
  },
  [RowStatus.Early]: {
    label: 'Not counted yet',
    className: 'bg-surface-float text-text-tertiary',
  },
  [RowStatus.Muted]: {
    label: 'Muted',
    className: 'bg-accent-ketchup-flat text-accent-ketchup-default',
  },
  [RowStatus.Blocked]: {
    label: 'Blocked',
    className: 'bg-accent-ketchup-flat text-accent-ketchup-default',
  },
};

const filterStatuses: Record<Filter, RowStatus[]> = {
  [Filter.All]: Object.values(RowStatus),
  [Filter.Followed]: [RowStatus.Followed],
  [Filter.Learned]: [RowStatus.Learned],
  [Filter.Early]: [RowStatus.Early],
  [Filter.Off]: [RowStatus.Muted, RowStatus.Blocked],
};

const maxWeight = 1.5;

const formatDays = (days: number): string => {
  if (days < 1) {
    return 'today';
  }
  return days === 1 ? 'yesterday' : `${days} days ago`;
};

const WeightBar = ({ interest }: { interest?: Interest }): ReactElement => {
  const weight = interest?.weight ?? 0;
  const computed = interest?.computedWeight ?? 0;
  const isAdjusted = !!interest?.control && weight !== computed;

  return (
    <span className="flex items-center gap-2">
      <span className="relative h-1.5 w-24 shrink-0 rounded-max bg-border-subtlest-tertiary">
        <span
          className={classNames(
            'absolute inset-y-0 left-0 rounded-max',
            isAdjusted ? 'bg-accent-cabbage-default' : 'bg-text-secondary',
          )}
          style={{ width: `${Math.min(1, weight / maxWeight) * 100}%` }}
        />
        {isAdjusted && (
          <span
            className="absolute -top-0.5 h-2.5 w-0.5 rounded-max bg-text-tertiary"
            style={{ left: `${Math.min(1, computed / maxWeight) * 100}%` }}
            title={`Computed ${computed.toFixed(2)}`}
          />
        )}
      </span>
      <span
        className={classNames(
          'w-9 tabular-nums typo-footnote',
          isAdjusted ? 'text-accent-cabbage-default' : 'text-text-secondary',
        )}
      >
        {weight.toFixed(2)}
      </span>
    </span>
  );
};

const Formula = ({ row }: { row: ProfileRow }): ReactElement => {
  const { state } = usePersonalization();
  const { params } = state;
  const { interest } = row;
  if (!interest || row.status === RowStatus.Blocked) {
    return (
      <p className="text-text-tertiary typo-footnote">
        Blocked topics are not interests. Posts with this topic never show.
      </p>
    );
  }
  const recency = interest.recency.toFixed(2);
  let base: string;
  if (row.status === RowStatus.Early) {
    base = `1 story so far. It starts counting at 2 stories, or right away if you follow it.`;
  } else if (interest.origin === InterestOrigin.Declared) {
    const boostKey = interest.strength
      ? `interests.declared_boost.${interest.strength}`
      : undefined;
    base =
      interest.strength && boostKey && interest.strength !== Strength.EarlySignal
        ? `${params['interests.base_weight'].toFixed(2)} for following + ${(
            params[boostKey as 'interests.declared_boost.strong'] ?? 0
          ).toFixed(2)} (${strengthLabel[interest.strength].toLowerCase()}) × ${recency} freshness = ${interest.computedWeight.toFixed(2)}`
        : `${params['interests.base_weight'].toFixed(2)} for following. Reading about it adds more.`;
  } else {
    const weightKey = `interests.inferred_weight.${interest.strength}` as
      | 'interests.inferred_weight.strong'
      | 'interests.inferred_weight.moderate';
    base = `${(params[weightKey] ?? 0).toFixed(2)} (${strengthLabel[
      interest.strength ?? Strength.Moderate
    ].toLowerCase()}) × ${recency} freshness = ${interest.computedWeight.toFixed(2)}`;
  }
  const { control } = interest;
  let adjustment: string | undefined;
  if (control?.weight !== undefined) {
    adjustment = `You set it to ${control.weight.toFixed(2)}.`;
  } else if (control?.mode === TopicMode.Boosted) {
    adjustment = `× ${params['interests.control_boost'].toFixed(2)} for More = ${interest.weight.toFixed(2)}`;
  } else if (control?.mode === TopicMode.Demoted) {
    adjustment = `× ${params['interests.control_demote'].toFixed(2)} for Less = ${interest.weight.toFixed(2)}`;
  } else if (control?.mode === TopicMode.Muted) {
    adjustment = 'Muted, so it counts as 0.';
  }

  return (
    <p className="flex flex-col gap-0.5 font-mono text-text-secondary typo-footnote">
      <span>{base}</span>
      {adjustment && <span className="text-accent-cabbage-default">{adjustment}</span>}
    </p>
  );
};

const RowDetail = ({ row }: { row: ProfileRow }): ReactElement => {
  const store = usePersonalization();
  const { interest } = row;
  const isFollowed = row.status === RowStatus.Followed;
  const isBlocked = row.status === RowStatus.Blocked;

  return (
    <div className="flex flex-col gap-4 border-t border-border-subtlest-tertiary bg-surface-float p-4">
      <Formula row={row} />
      {interest && !isBlocked && (
        <div className="flex flex-col gap-2">
          <span className="flex items-baseline justify-between gap-3">
            <span className="font-bold text-text-primary typo-callout">
              Exact weight
            </span>
            <span className="tabular-nums text-text-secondary typo-callout">
              {interest.weight.toFixed(2)}
            </span>
          </span>
          <Slider
            compact
            min={0}
            max={maxWeight}
            step={0.01}
            value={[interest.weight]}
            thumbLabel={`Weight of #${row.tag}`}
            onValueChange={([value]) => store.setTopicWeight(row.tag, value)}
          />
          <span className="text-text-tertiary typo-footnote">
            A post whose main topic is #{row.tag} gets ×
            {(1 + interest.weight).toFixed(2)}; as a side topic, ×
            {(
              1 +
              interest.weight * store.state.params['relevance.side_topic_weight']
            ).toFixed(2)}
            .
          </span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {!isBlocked && (
          <Button
            type="button"
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            onClick={() => store.setTagFollowed(row.tag, !isFollowed)}
          >
            {isFollowed ? 'Unfollow' : 'Follow'}
          </Button>
        )}
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          onClick={() => store.setTagBlocked(row.tag, !isBlocked)}
        >
          {isBlocked ? 'Unblock' : 'Block'}
        </Button>
        {interest?.control && (
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            onClick={() => store.setTopicMode(row.tag, undefined)}
          >
            Use the learned weight
          </Button>
        )}
      </div>
    </div>
  );
};

const ProfileRowItem = ({
  row,
  onScreen,
  isCompact,
}: {
  row: ProfileRow;
  onScreen: number;
  isCompact?: boolean;
}): ReactElement => {
  const store = usePersonalization();
  const [isOpen, setIsOpen] = useState(false);
  const { interest, evidence } = row;
  const badge = statusBadge[row.status];
  const isOff = row.status === RowStatus.Blocked;
  const mode = store.state.controls[row.tag]?.mode;
  const facts = [
    evidence
      ? `${evidence.stories} ${evidence.stories === 1 ? 'story' : 'stories'}`
      : 'No reading yet',
    evidence?.strongStories
      ? `${evidence.strongStories} upvoted, saved or shared`
      : undefined,
    evidence ? `last ${formatDays(evidence.daysSinceLastAction)}` : undefined,
    interest?.evidence ? `${Math.round(interest.recency * 100)}% fresh` : undefined,
    onScreen ? `in ${onScreen} of your next 12` : undefined,
  ].filter(Boolean);

  return (
    <li className="overflow-hidden rounded-12 border border-border-subtlest-tertiary">
      <div
        className={classNames(
          'flex gap-3 p-3',
          isCompact ? 'flex-col' : 'items-center',
        )}
      >
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-surface-float text-text-tertiary">
            <HashtagIcon size={IconSize.Size16} secondary />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className={classNames(
                  'min-w-0 shrink truncate font-bold typo-callout',
                  isOff ? 'text-text-tertiary line-through' : 'text-text-primary',
                )}
              >
                {row.tag}
              </span>
              <Badge className={badge.className}>{badge.label}</Badge>
              {interest?.strength && row.status !== RowStatus.Early && (
                <span
                  className="hidden shrink-0 text-text-quaternary typo-caption1 tablet:inline"
                  title={strengthRule[interest.strength]}
                >
                  {strengthLabel[interest.strength]}
                </span>
              )}
            </span>
            <span className="truncate text-text-tertiary typo-caption1">
              {facts.join(' · ')}
            </span>
          </span>
          <ArrowIcon
            size={IconSize.Size16}
            className={classNames(
              'shrink-0 text-text-tertiary transition-transform',
              isOpen ? 'rotate-0' : 'rotate-180',
            )}
          />
        </button>
        <div
          className={classNames(
            'flex items-center gap-3',
            isCompact ? 'flex-wrap justify-between' : 'shrink-0',
          )}
        >
          <WeightBar interest={interest} />
          {!isOff && (
            <Segmented
              label={`How much #${row.tag}`}
              value={mode}
              onChange={(value) => store.setTopicMode(row.tag, value)}
              options={[
                ...(row.status === RowStatus.Followed
                  ? []
                  : [
                      {
                        value: TopicMode.Muted,
                        label: 'Mute',
                        activeClassName: 'text-accent-ketchup-default',
                      },
                    ]),
                {
                  value: TopicMode.Demoted,
                  label: 'Less',
                  activeClassName: 'text-accent-bun-default',
                },
                { value: undefined, label: 'Auto' },
                {
                  value: TopicMode.Boosted,
                  label: 'More',
                  activeClassName: 'text-accent-avocado-default',
                },
              ]}
            />
          )}
        </div>
      </div>
      {isOpen && <RowDetail row={row} />}
    </li>
  );
};

const filterLabels: Record<Filter, string> = {
  [Filter.All]: 'All',
  [Filter.Followed]: 'Followed',
  [Filter.Learned]: 'Learned',
  [Filter.Early]: 'Not counted yet',
  [Filter.Off]: 'Muted and blocked',
};

export const InterestsSection = ({
  isCompact,
}: {
  isCompact?: boolean;
}): ReactElement => {
  const store = usePersonalization();
  const { state, next, pool } = store;
  const [filter, setFilter] = useState(Filter.All);
  const rows = useMemo((): ProfileRow[] => {
    const fromInterests = next.interests.map((interest): ProfileRow => {
      let status = RowStatus.Learned;
      if (interest.control?.mode === TopicMode.Muted) {
        status = RowStatus.Muted;
      } else if (interest.origin === InterestOrigin.Declared) {
        status = RowStatus.Followed;
      } else if (interest.strength === Strength.EarlySignal) {
        status = RowStatus.Early;
      }
      return {
        tag: interest.tag,
        status,
        interest,
        evidence: state.evidence.find(({ topic }) => topic === interest.tag),
      };
    });
    const blocked = state.blockedTags.map(
      (tag): ProfileRow => ({
        tag,
        status: RowStatus.Blocked,
        evidence: state.evidence.find(({ topic }) => topic === tag),
      }),
    );
    const order = Object.values(RowStatus);
    return [...fromInterests, ...blocked].sort(
      (a, b) =>
        order.indexOf(a.status) - order.indexOf(b.status) ||
        (b.interest?.weight ?? 0) - (a.interest?.weight ?? 0),
    );
  }, [next.interests, state.blockedTags, state.evidence]);
  const onScreen = (tag: string) =>
    next.served.filter(({ post }) => post.tags?.includes(tag)).length;
  const suggestions = useMemo(() => {
    const known = new Set(rows.map(({ tag }) => tag));
    const counts = new Map<string, number>();
    pool.forEach(({ tags }) =>
      (tags ?? []).forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)),
    );
    return [...counts.entries()]
      .filter(([tag]) => !known.has(tag))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [pool, rows]);
  const visible = rows.filter(({ status }) =>
    filterStatuses[filter].includes(status),
  );
  const countFor = (value: Filter) =>
    rows.filter(({ status }) => filterStatuses[value].includes(status)).length;

  return (
    <PanelSection
      section={ControlSection.Interests}
      title="Your interest profile"
      description="Every topic the feed ranks you by. Followed topics come from you; learned ones from what you opened, upvoted, saved, commented on or shared in the last 90 days. A post's best matching topic multiplies its score by 1 + weight."
    >
      {!state.isLearning && (
        <p className="rounded-12 bg-accent-bun-flat p-3 text-text-primary typo-footnote">
          Learning from reading is off, so only followed topics count right now.
        </p>
      )}
      <div className="-mx-4 flex gap-1 overflow-x-auto px-4 no-scrollbar tablet:mx-0 tablet:flex-wrap tablet:px-0">
        {Object.values(Filter).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className={classNames(
              'flex h-8 shrink-0 items-center gap-1.5 rounded-10 px-3 typo-footnote',
              filter === value
                ? 'bg-surface-float font-bold text-text-primary'
                : 'text-text-tertiary hover:text-text-primary',
            )}
          >
            {filterLabels[value]}
            <span className="tabular-nums text-text-quaternary">
              {countFor(value)}
            </span>
          </button>
        ))}
      </div>
      <ul className="flex flex-col gap-2">
        {visible.map((row) => (
          <ProfileRowItem
            key={row.tag}
            row={row}
            onScreen={onScreen(row.tag)}
            isCompact={isCompact}
          />
        ))}
        {!visible.length && (
          <li className="rounded-12 border border-dashed border-border-subtlest-secondary p-4 text-center text-text-tertiary typo-footnote">
            Nothing here.
          </li>
        )}
      </ul>
      <PanelCard className="flex flex-col gap-3 p-4">
        <span className="font-bold text-text-primary typo-callout">
          Follow a topic
        </span>
        <span className="text-text-tertiary typo-footnote">
          Topics in posts you could see, most common first.
        </span>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((tag) => (
            <Button
              key={tag}
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
              onClick={() => store.setTagFollowed(tag, true)}
            >
              {tag}
            </Button>
          ))}
        </div>
      </PanelCard>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-text-tertiary typo-caption1 tablet:grid-cols-2">
        {Object.values(Strength).map((strength) => (
          <div key={strength} className="flex gap-2">
            <dt className="font-bold text-text-secondary">
              {strengthLabel[strength]}
            </dt>
            <dd>{strengthRule[strength]}</dd>
          </div>
        ))}
      </dl>
    </PanelSection>
  );
};
