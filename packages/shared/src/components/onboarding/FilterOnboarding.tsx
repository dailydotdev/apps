import React, { ReactElement, useState, useContext } from 'react';
import classNames from 'classnames';
import { cloudinary } from '../../lib/image';
import OnboardingStep from './OnboardingStep';
import FeedTopicCard from '../containers/FeedTopicCard';
import { OnboardingFiltersLayout } from '../../lib/featureValues';
import FeaturesContext from '../../contexts/FeaturesContext';
import useTagAndSource from '../../hooks/useTagAndSource';
import useFeedSettings from '../../hooks/useFeedSettings';
import { Origin } from '../../lib/analytics';

interface FilterOnboardingProps {
  onSelectedChange: (result: Record<string, boolean>) => void;
}

const classes: Record<OnboardingFiltersLayout, string> = {
  grid: 'grid-cols-3 gap-6',
  list: 'grid-cols-1 gap-4',
};

function FilterOnboarding({
  onSelectedChange,
}: FilterOnboardingProps): ReactElement {
  const [selectedTopics, setSelectedTopics] = useState({});
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
      topIcon={
        <img
          className="mx-auto mb-6 w-16"
          src={cloudinary.feedFilters.supercharge}
          alt="A lightning icon to resemble supercharge"
        />
      }
      title="Pick topics you are interested in. You can always change these later."
      className={{
        content: classNames('p-5 mt-1 grid', classes[onboardingFiltersLayout]),
      }}
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
    </OnboardingStep>
  );
}

export default FilterOnboarding;
