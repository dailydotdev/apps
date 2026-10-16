import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { Decision } from '../policy/rank';
import { TopicRole } from '../policy/rank';
import type { ParamKey } from '../policy/params';
import { defaultParams } from '../policy/params';
import { InterestOrigin, strengthLabel, TopicMode } from '../policy/profile';
import type { FactorChip } from '../policy/describe';
import { FactorId, getFactorChips } from '../policy/describe';
import { usePersonalization } from './PersonalizationContext';
import { AnchoredPopover } from './AnchoredPopover';
import { Segmented, Strong, ToggleRow, ParamSlider } from './controls';
import { ControlSection, useFeedScreen } from './FeedScreenContext';

export const formatMultiplier = (value: number): string =>
  `×${value.toFixed(value >= 10 ? 0 : 2)}`;

const getTone = (chip: FactorChip): 'up' | 'down' | 'neutral' => {
  if (chip.id === FactorId.Popular || Math.abs(Math.log(chip.value)) < 0.05) {
    return 'neutral';
  }
  return chip.value > 1 ? 'up' : 'down';
};

const toneClassName = {
  up: 'text-accent-avocado-default',
  down: 'text-accent-bun-default',
  neutral: 'text-text-tertiary',
};

/** A knob that is either at its default or switched off. */
const ParamToggle = ({
  id,
  paramKey,
  offValue,
  label,
  description,
}: {
  id: string;
  paramKey: ParamKey;
  offValue: number;
  label: string;
  description?: ReactNode;
}): ReactElement => {
  const { state, setParam } = usePersonalization();
  const isOn = state.params[paramKey] !== offValue;

  return (
    <ToggleRow
      id={id}
      label={label}
      description={description}
      checked={isOn}
      onToggle={() =>
        setParam(paramKey, isOn ? offValue : defaultParams[paramKey])
      }
    />
  );
};

const freshnessOptions = [
  { value: 3, label: 'Newest' },
  { value: 7, label: 'Balanced' },
  { value: 21, label: 'Evergreen' },
];

const FactorDetails = ({
  chip,
  decision,
}: {
  chip: FactorChip;
  decision: Decision;
}): ReactElement => {
  const store = usePersonalization();
  const { state, next } = store;
  const { onOpenControls } = useFeedScreen();
  const { params } = state;
  const sourceName = decision.post.source?.name ?? 'this source';
  const id = `${decision.post.id}-${chip.id}`;
  let body: ReactNode;
  let section = ControlSection.Ranking;

  switch (chip.id) {
    case FactorId.Match: {
      const best = decision.best!;
      const interest = next.interests.find(({ tag }) => tag === best.tag);
      const mode = state.controls[best.tag]?.mode;
      const isFollowed = state.followedTags.includes(best.tag);
      section = ControlSection.Interests;
      body = (
        <>
          <p className="text-text-secondary typo-footnote">
            <Strong>#{best.tag}</Strong> is a{' '}
            {best.origin === InterestOrigin.Declared ? 'topic you follow' : 'topic learned from your reading'}
            {interest?.strength && (
              <>
                {' '}
                ({strengthLabel[interest.strength].toLowerCase()},{' '}
                {interest.evidence?.stories}{' '}
                {interest.evidence?.stories === 1 ? 'story' : 'stories'})
              </>
            )}
            . Its weight, <Strong>{best.weight.toFixed(2)}</Strong>
            {best.role === TopicRole.Side &&
              `, counted at ${Math.round(best.roleWeight * 100)}% as a side topic`}
            , lifts this post {formatMultiplier(decision.factors.match)}.
          </p>
          <Segmented
            label={`How much #${best.tag}`}
            value={mode}
            onChange={(value) => store.setTopicMode(best.tag, value)}
            options={[
              ...(isFollowed
                ? []
                : [{ value: TopicMode.Muted, label: 'Mute' }]),
              {
                value: TopicMode.Demoted,
                label: 'Less',
                activeClassName: 'text-accent-bun-default',
              },
              { value: undefined, label: 'Normal' },
              {
                value: TopicMode.Boosted,
                label: 'More',
                activeClassName: 'text-accent-avocado-default',
              },
            ]}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              onClick={() => store.setTagFollowed(best.tag, !isFollowed)}
            >
              {isFollowed ? 'Unfollow' : 'Follow'}
            </Button>
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              onClick={() => store.setTagBlocked(best.tag, true)}
            >
              Block #{best.tag}
            </Button>
          </div>
        </>
      );
      break;
    }
    case FactorId.Follow:
      body = (
        <>
          <p className="text-text-secondary typo-footnote">
            You follow <Strong>{sourceName}</Strong>, so every post from it is
            in and multiplied by {formatMultiplier(decision.factors.follow)}.
          </p>
          <ParamSlider paramKey="follows.source_multiplier" isCompact />
          <Button
            type="button"
            className="self-start"
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            onClick={() =>
              store.setSourceFollowed(
                { id: decision.post.source?.id ?? '', name: sourceName },
                false,
              )
            }
          >
            Unfollow {sourceName}
          </Button>
        </>
      );
      break;
    case FactorId.Base:
      body = (
        <p className="text-text-secondary typo-footnote">
          Per view, readers upvoted and commented on this post{' '}
          <Strong>{formatMultiplier(decision.factors.base)}</Strong> as much as
          the typical post here. Well-liked posts also stay fresh longer. This
          one is about other readers, so there is nothing to turn off.
        </p>
      );
      break;
    case FactorId.Age:
      body = (
        <>
          <p className="text-text-secondary typo-footnote">
            Posted {Math.round(decision.ageDays)} days ago. A post loses half
            its pull every <Strong>{params['age.half_life_days']} days</Strong>
            , stretched up to {params['age.max_stretch']}× for well-liked
            posts.
          </p>
          <Segmented
            label="Freshness"
            value={params['age.half_life_days']}
            onChange={(value) => store.setParam('age.half_life_days', value)}
            options={freshnessOptions}
          />
        </>
      );
      break;
    case FactorId.Seen:
      body = (
        <>
          <p className="text-text-secondary typo-footnote">
            It was on your screen {decision.impressions}{' '}
            {decision.impressions === 1 ? 'time' : 'times'} without a click.
            Each view keeps{' '}
            {Math.round(params['history.seen_factor_per_show'] * 100)}% of its
            pull, and at {params['history.max_impressions_without_action']}{' '}
            views it leaves.
          </p>
          <ParamToggle
            id={`${id}-seen`}
            paramKey="history.seen_factor_per_show"
            offValue={1}
            label="Lower posts I scrolled past"
          />
          <Button
            type="button"
            className="self-start"
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            onClick={store.clearSeen}
          >
            Forget what I scrolled past
          </Button>
        </>
      );
      break;
    case FactorId.Waiting:
      body = (
        <>
          <p className="text-text-secondary typo-footnote">
            <Strong>#{decision.slot?.waitingTag}</Strong> had not been on your
            first screen lately, so its first post gets a turn and jumps ahead
            of topics you just saw.
          </p>
          <ParamToggle
            id={`${id}-waiting`}
            paramKey="diversity.waiting_interest_lift"
            offValue={0}
            label="Rotate my interests"
          />
        </>
      );
      break;
    case FactorId.SourceRepeat:
      body = (
        <>
          <p className="text-text-secondary typo-footnote">
            {decision.slot?.sourceCount}{' '}
            {decision.slot?.sourceCount === 1 ? 'post' : 'posts'} from{' '}
            {sourceName} already sit above it. Each one lowers the next by{' '}
            {Math.round(params['diversity.source_repeat_discount'] * 100)}%.
          </p>
          <ParamToggle
            id={`${id}-sources`}
            paramKey="diversity.source_repeat_discount"
            offValue={0}
            label="Spread out sources"
          />
        </>
      );
      break;
    case FactorId.TopicRepeat:
      body = (
        <>
          <p className="text-text-secondary typo-footnote">
            Posts on similar topics already sit above it, so it moves down to
            mix the page.
          </p>
          <ParamToggle
            id={`${id}-topics`}
            paramKey="diversity.topic_repeat_discount"
            offValue={0}
            label="Spread out similar topics"
          />
        </>
      );
      break;
    case FactorId.SameHeadline:
      body = (
        <>
          <p className="text-text-secondary typo-footnote">
            Its headline overlaps a post above it, so it is likely the same
            story.
          </p>
          <ParamToggle
            id={`${id}-headline`}
            paramKey="diversity.same_headline_discount"
            offValue={0}
            label="Lower the same story"
          />
        </>
      );
      break;
    default:
      section = ControlSection.Interests;
      body = (
        <>
          <p className="text-text-secondary typo-footnote">
            Your topics and follows found fewer posts than a page, so popular
            posts fill the rest. Following a few more topics replaces them.
          </p>
          <ToggleRow
            id={`${id}-fill`}
            label="Fill a short feed with popular posts"
            checked={state.isFillingWithPopular}
            onToggle={() => store.setFilling(!state.isFillingWithPopular)}
          />
        </>
      );
  }

  return (
    <>
      <header className="flex items-baseline justify-between gap-3">
        <span className="font-bold text-text-primary typo-callout">
          {chip.label}
        </span>
        {chip.id !== FactorId.Popular && (
          <span
            className={classNames(
              'shrink-0 tabular-nums typo-footnote',
              toneClassName[getTone(chip)],
            )}
          >
            {formatMultiplier(chip.value)} on this post
          </span>
        )}
      </header>
      {body}
      <footer className="flex items-center justify-between gap-2 border-t border-border-subtlest-tertiary pt-3 text-text-quaternary typo-caption1">
        <span>Changes apply when you refresh.</span>
        {onOpenControls && (
          <button
            type="button"
            className="font-bold text-text-link hover:underline"
            onClick={() => onOpenControls(section)}
          >
            All controls
          </button>
        )}
      </footer>
    </>
  );
};

const Chip = ({
  chip,
  decision,
}: {
  chip: FactorChip;
  decision: Decision;
}): ReactElement => {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const tone = getTone(chip);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={!!anchor}
        onClick={(event) =>
          setAnchor(anchor ? null : (event.currentTarget as HTMLButtonElement))
        }
        className={classNames(
          'flex h-6 min-w-0 max-w-full items-center gap-1 rounded-8 px-1.5 font-bold typo-caption1 transition-colors',
          anchor ? 'bg-surface-hover' : 'bg-surface-float hover:bg-surface-hover',
        )}
      >
        {tone !== 'neutral' && (
          <ArrowIcon
            size={IconSize.Size16}
            className={classNames(
              'shrink-0',
              toneClassName[tone],
              tone === 'down' && 'rotate-180',
            )}
          />
        )}
        <span className="min-w-0 shrink truncate text-text-secondary">
          {chip.label}
        </span>
      </button>
      {anchor && (
        <AnchoredPopover
          anchor={anchor}
          label={chip.label}
          onClose={() => setAnchor(null)}
        >
          <FactorDetails chip={chip} decision={decision} />
        </AnchoredPopover>
      )}
    </>
  );
};

export const FactorChips = ({
  decision,
  limit,
}: {
  decision: Decision;
  limit: number;
}): ReactElement => (
  <ul className="flex flex-wrap gap-1" aria-label="What moved this post">
    {getFactorChips(decision)
      .slice(0, limit)
      .map((chip) => (
        <li key={chip.id} className="min-w-0 max-w-full">
          <Chip chip={chip} decision={decision} />
        </li>
      ))}
  </ul>
);
