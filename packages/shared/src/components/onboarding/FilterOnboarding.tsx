import React, { ReactElement } from 'react';
import { cloudinary } from '../../lib/image';
import OnboardingStep from './OnboardingStep';
import FeedTopicCard from '../containers/FeedTopicCard';
import { TagCategory } from '../../graphql/feedSettings';

interface FilterOnboardingProps {
  tagsCategories: TagCategory[];
  selectedId: Record<string, boolean>;
  onSelectedChange: (id: string) => void;
}

function FilterOnboarding({
  selectedId,
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
      {tagsCategories?.map((category) => (
        <FeedTopicCard
          key={category.title}
          topic={category}
          isActive={selectedId[category.id]}
          onClick={() => onSelectedChange(category.id)}
        />
      ))}
    </OnboardingStep>
  );
}

export default FilterOnboarding;
