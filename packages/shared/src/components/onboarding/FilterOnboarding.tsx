import React, { ReactElement, useState, useContext } from 'react';
import classNames from 'classnames';
import FeedTopicCard, { ButtonEvent } from '../containers/FeedTopicCard';
import { OnboardingFiltersLayout } from '../../lib/featureValues';
import FeaturesContext from '../../contexts/FeaturesContext';
import useTagAndSource from '../../hooks/useTagAndSource';
import useFeedSettings from '../../hooks/useFeedSettings';
import { Origin } from '../../lib/analytics';

const classes: Record<OnboardingFiltersLayout, string> = {
  grid: 'tablet:grid-cols-3 grid-cols-2',
  list: 'grid-cols-1',
};

interface FilterOnboardingProps {
  onSelectedTopics?(tags: Record<string, boolean>): void;
  isAnimated?: boolean;
  className?: string;
}

export function FilterOnboarding({
  onSelectedTopics,
  isAnimated,
  className,
}: FilterOnboardingProps): ReactElement {
  const [invalidMessage, setInvalidMessage] = useState<string>(null);
  const [selectedTopics, setSelectedTopics] = useState({});
  const { onboardingFiltersLayout } = useContext(FeaturesContext);
  const { tagsCategories } = useFeedSettings();
  const { onFollowTags, onUnfollowTags } = useTagAndSource({
    origin: Origin.TagsFilter,
  });

  const onChangeSelectedTopic = (e: ButtonEvent, value: string) => {
    const isFollowed = !selectedTopics[value];
    const tagCommand = isFollowed ? onFollowTags : onUnfollowTags;
    const { tags, title } = tagsCategories.find(({ id }) => id === value);
    tagCommand({ tags, category: title });
    const result = { ...selectedTopics, [value]: isFollowed };
    setSelectedTopics(result);
    if (onSelectedTopics) onSelectedTopics(result);
    e.currentTarget.blur();
    if (invalidMessage) {
      setInvalidMessage(null);
    }
  };

  return (
    <div
      className={classNames(
        'grid gap-4 w-fit tablet:w-full',
        classes[onboardingFiltersLayout],
        className,
      )}
    >
      {tagsCategories?.map((category) => (
        <FeedTopicCard
          key={category.title}
          topic={category}
          isAnimated={isAnimated}
          isActive={selectedTopics[category.id]}
          topicLayout={onboardingFiltersLayout}
          onClick={(e) => onChangeSelectedTopic(e, category.id)}
        />
      ))}
    </div>
  );
}
