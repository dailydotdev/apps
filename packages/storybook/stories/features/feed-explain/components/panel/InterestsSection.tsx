import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons/MiniClose';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks/usePlusSubscription';
import type { Interest, TopicEvidence } from '../../policy/profile';
import {
  InterestOrigin,
  maxTopicWeight,
  Strength,
  TopicMode,
} from '../../policy/profile';
import { formatBoost } from '../../policy/describe';
import { usePersonalization } from '../PersonalizationContext';
import { ControlSection } from '../FeedScreenContext';
import { BoostSlider } from '../controls';
import { PlusBanner, TopicLevelPicker } from '../plus';
import { EntityRow, PanelList, PanelListEmpty, PanelSection } from './Section';

const formatWhen = (days: number): string => {
  if (days < 1) {
    return 'today';
  }
  return days === 1 ? 'yesterday' : `${days} days ago`;
};

const describeReading = (evidence: TopicEvidence): string =>
  evidence.stories === 1
    ? `You read 1 post about it ${formatWhen(evidence.daysSinceLastAction)}.`
    : `You read ${evidence.stories} posts about it, the last one ${formatWhen(
        evidence.daysSinceLastAction,
      )}.`;

const describeInterest = (interest: Interest): string => {
  const { evidence } = interest;
  const isFollowed = interest.origin === InterestOrigin.Declared;
  if (!evidence) {
    return isFollowed
      ? "You follow this. You haven't read about it yet."
      : 'You added this with a boost.';
  }
  const reading = describeReading(evidence);
  if (isFollowed) {
    return `You follow this. ${reading}`;
  }
  return interest.strength === Strength.EarlySignal && !interest.control
    ? `${reading} It counts once you read 2.`
    : reading;
};

const InterestRow = ({ interest }: { interest: Interest }): ReactElement => {
  const store = usePersonalization();
  const { isPlus } = usePlusSubscription();
  const isFollowed = interest.origin === InterestOrigin.Declared;

  return (
    <EntityRow
      name={`#${interest.tag}`}
      description={describeInterest(interest)}
      boost={
        isPlus ? (
          <BoostSlider
            className="flex-1"
            label={`Boost for #${interest.tag}`}
            value={interest.weight}
            min={0}
            max={maxTopicWeight}
            step={0.05}
            display={formatBoost(interest.weight)}
            isSet={!!interest.control}
            resetLabel={`Back to automatic (${formatBoost(
              interest.computedWeight,
            )})`}
            onChange={(value) => store.setTopicWeight(interest.tag, value)}
            onReset={() => store.setTopicMode(interest.tag, undefined)}
          />
        ) : (
          <TopicLevelPicker
            className="flex-1"
            tag={interest.tag}
            interest={interest}
          />
        )
      }
      action={
        <Button
          type="button"
          className="w-24"
          variant={isFollowed ? ButtonVariant.Float : ButtonVariant.Secondary}
          size={ButtonSize.Small}
          onClick={() => store.setTagFollowed(interest.tag, !isFollowed)}
        >
          {isFollowed ? 'Unfollow' : 'Follow'}
        </Button>
      }
    />
  );
};

const byWeight = (a: Interest, b: Interest): number =>
  b.weight - a.weight || a.tag.localeCompare(b.tag);

export const InterestsSection = (): ReactElement => {
  const store = usePersonalization();
  const { state, next } = store;
  const { isPlus } = usePlusSubscription();
  const followed = next.interests
    .filter(({ origin }) => origin === InterestOrigin.Declared)
    .sort(byWeight);
  const learned = next.interests
    .filter(({ origin }) => origin === InterestOrigin.Inferred)
    .sort(byWeight);
  const turnedDown = Object.keys(state.controls)
    .filter(
      (tag) =>
        state.controls[tag].mode && !next.interests.some((i) => i.tag === tag),
    )
    .sort();

  return (
    <PanelSection
      section={ControlSection.Interests}
      description={
        isPlus
          ? 'Posts about these topics get a boost. Drag to change how much, or all the way left to take it away.'
          : 'Posts about these topics get a boost. Show less ranks a topic lower, and Stop learning makes reading about it stop counting.'
      }
    >
      <PlusBanner>Set the exact boost for each topic with Plus.</PlusBanner>
      <PanelList title="Topics you follow">
        {followed.map((interest) => (
          <InterestRow key={interest.tag} interest={interest} />
        ))}
        {!followed.length && (
          <PanelListEmpty>
            You don&apos;t follow any topics yet. Find some below.
          </PanelListEmpty>
        )}
      </PanelList>
      <PanelList
        title="Topics from your reading"
        description={
          state.isLearning
            ? "Topics you read about in the last 90 days but don't follow. One counts once you've read 2 posts about it."
            : undefined
        }
      >
        {learned.map((interest) => (
          <InterestRow key={interest.tag} interest={interest} />
        ))}
        {!learned.length && (
          <PanelListEmpty>
            {state.isLearning
              ? 'Nothing yet. Topics show up here as you read.'
              : 'Learning from your reading is off, so only topics you follow count.'}
          </PanelListEmpty>
        )}
      </PanelList>
      {turnedDown.length > 0 && (
        <div className="flex flex-col gap-3">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <span className="flex min-w-0 flex-[1_1_16rem] flex-col gap-1">
              <Typography
                tag={TypographyTag.H2}
                type={TypographyType.Body}
                className="tablet:typo-title3"
                bold
              >
                Topics you turned down
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                Not topics of yours, but posts about them rank lower. Tap one to
                put it back.
              </Typography>
            </span>
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              onClick={() =>
                store.applyChange(
                  'Every topic you turned down is back to Auto.',
                  (current) => ({
                    ...current,
                    controls: Object.fromEntries(
                      Object.entries(current.controls).filter(
                        ([tag]) => !turnedDown.includes(tag),
                      ),
                    ),
                  }),
                )
              }
            >
              Put all back
            </Button>
          </header>
          <ul className="flex flex-wrap gap-2">
            {turnedDown.map((tag) => {
              const isStopLearning =
                state.controls[tag].mode === TopicMode.StopLearning;
              return (
                <li key={tag}>
                  <button
                    type="button"
                    title={`Put #${tag} back to Auto`}
                    onClick={() => store.setTopicMode(tag, undefined)}
                    className="flex h-8 items-center gap-1.5 rounded-10 bg-surface-float pl-3 pr-2 font-bold text-text-primary typo-footnote hover:bg-surface-hover"
                  >
                    #{tag}
                    <span
                      className={
                        isStopLearning
                          ? 'text-accent-ketchup-default'
                          : 'text-accent-bun-default'
                      }
                    >
                      {isStopLearning ? 'Stop learning' : 'Show less'}
                    </span>
                    <MiniCloseIcon
                      size={IconSize.Size16}
                      className="text-text-tertiary"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </PanelSection>
  );
};
