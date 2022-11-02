import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { cloudinary } from '../../lib/image';
import OnboardingStep from './OnboardingStep';
import FeedTopicCard from '../containers/FeedTopicCard';
import { TagCategory } from '../../graphql/feedSettings';
import { OnboardingFiltersLayout } from '../../lib/featureValues';

interface FilterOnboardingProps {
  tagsCategories: TagCategory[];
  selectedId: Record<string, boolean>;
  topicLayout?: OnboardingFiltersLayout;
  onSelectedChange: (id: string) => void;
}

const classes: Record<OnboardingFiltersLayout, string> = {
  grid: 'grid-cols-3 gap-6',
  list: 'grid-cols-1 gap-4',
};

function FilterOnboarding({
  selectedId,
  topicLayout,
  tagsCategories,
  onSelectedChange,
}: FilterOnboardingProps): ReactElement {
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
        content: classNames('p-5 mt-1 grid', classes[topicLayout]),
      }}
    >
      {tagsCategories?.map((category) => (
        <FeedTopicCard
          key={category.title}
          topic={category}
          topicLayout={topicLayout}
          isActive={selectedId[category.id]}
          onClick={() => onSelectedChange(category.id)}
        />
      ))}
    </OnboardingStep>
  );
}

export default FilterOnboarding;
