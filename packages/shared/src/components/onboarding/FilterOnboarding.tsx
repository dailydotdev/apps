import React, { ReactElement } from 'react';
import { cloudinary } from '../../lib/image';
import OnboardingStep from './OnboardingStep';
import FeedTopicCard from '../containers/FeedTopicCard';
import { TagCategory } from '../../graphql/feedSettings';

interface FilterOnboardingProps {
  tagsCategories: TagCategory[];
  selected: Record<string | number, boolean>;
  onSelectedChange: (key: string | number) => void;
}

function FilterOnboarding({
  selected,
  tagsCategories,
  onSelectedChange,
}: FilterOnboardingProps): ReactElement {
  return (
    <OnboardingStep
      topIcon={
        <img
          className="mx-auto mb-6 w-16"
          src={cloudinary.feedFilters.supercharge}
          alt="test"
        />
      }
      title="Let’s super-charge your feed with the content you actually read!"
      className={{ content: 'p-5 mt-1 grid grid-cols-3 gap-6' }}
    >
      {tagsCategories?.map((category, index) => (
        <FeedTopicCard
          key={category.title}
          topic={category}
          isActive={selected[index]}
          onClick={() => onSelectedChange(index)}
        />
      ))}
    </OnboardingStep>
  );
}

export default FilterOnboarding;
