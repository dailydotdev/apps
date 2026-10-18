import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { HashtagIcon } from '@dailydotdev/shared/src/components/icons/Hashtag';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { Interest, TopicEvidence } from '../../policy/profile';
import { InterestOrigin, maxTopicWeight, Strength } from '../../policy/profile';
import { formatBoost } from '../../policy/describe';
import { usePersonalization } from '../PersonalizationContext';
import { ControlSection } from '../FeedScreenContext';
import { BoostSlider } from '../controls';
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

const topicIcon = (
  <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-surface-float text-text-tertiary">
    <HashtagIcon size={IconSize.Size16} secondary />
  </span>
);

const InterestRow = ({ interest }: { interest: Interest }): ReactElement => {
  const store = usePersonalization();
  const isFollowed = interest.origin === InterestOrigin.Declared;

  return (
    <EntityRow
      media={topicIcon}
      name={interest.tag}
      description={describeInterest(interest)}
      boost={
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
  const followed = next.interests
    .filter(({ origin }) => origin === InterestOrigin.Declared)
    .sort(byWeight);
  const learned = next.interests
    .filter(({ origin }) => origin === InterestOrigin.Inferred)
    .sort(byWeight);

  return (
    <PanelSection
      section={ControlSection.Interests}
      description="Posts about these topics get a boost. Drag to change how much, or all the way left to turn a topic off."
    >
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
    </PanelSection>
  );
};
