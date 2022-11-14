import React, { ReactElement, useState, useContext } from 'react';
import classNames from 'classnames';
import OnboardingStep from './OnboardingStep';
import FeedTopicCard from '../containers/FeedTopicCard';
import { OnboardingFiltersLayout } from '../../lib/featureValues';
import FeaturesContext from '../../contexts/FeaturesContext';
import useTagAndSource from '../../hooks/useTagAndSource';
import useFeedSettings from '../../hooks/useFeedSettings';
import { Origin } from '../../lib/analytics';

interface FilterOnboardingProps {
  preselected?: Record<string, boolean>;
  onSelectedChange: (result: Record<string, boolean>) => void;
}

const classes: Record<OnboardingFiltersLayout, string> = {
  grid: 'tablet:grid-cols-3 grid-cols-2',
  list: 'grid-cols-1',
};

function FilterOnboarding({
  preselected = {},
  onSelectedChange,
}: FilterOnboardingProps): ReactElement {
  const [selectedTopics, setSelectedTopics] = useState(preselected);
  const { onboardingFiltersLayout } = useContext(FeaturesContext);
  const { tagsCategories } = useFeedSettings();
  const { onFollowTags, onUnfollowTags } = useTagAndSource({
    origin: Origin.TagsFilter,
  });
  const onChangeSelectedTopic = (value: string) => {
    const isFollowed = !selectedTopics[value];
    const tagCommand = isFollowed ? onFollowTags : onUnfollowTags;
    const { tags, title } = tagsCategories.find(({ id }) => id === value);
    tagCommand({ tags, category: title });
    const result = { ...selectedTopics, [value]: isFollowed };
    setSelectedTopics(result);
    onSelectedChange(result);
  };

  return (
    <OnboardingStep
      title="Choose topics to follow"
      description="Pick topics you are interested in. You can always change these later."
      className={{ content: 'p-4 mt-1 flex flex-row justify-center' }}
    >
      <div
        className={classNames(
          'grid gap-4 w-fit',
          classes[onboardingFiltersLayout],
        )}
      >
        {tagsCategories?.map((category) => (
          <FeedTopicCard
            key={category.title}
            topic={category}
            isActive={selectedTopics[category.id]}
            topicLayout={onboardingFiltersLayout}
            onClick={() => onChangeSelectedTopic(category.id)}
          />
        ))}
      </div>
    </OnboardingStep>
  );
}

export default FilterOnboarding;
