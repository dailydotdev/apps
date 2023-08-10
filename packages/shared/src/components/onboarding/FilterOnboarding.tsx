import React, { ReactElement, useEffect, useState } from 'react';
import classNames from 'classnames';
import FeedTopicCard, { ButtonEvent } from '../containers/FeedTopicCard';
import useTagAndSource from '../../hooks/useTagAndSource';
import useFeedSettings from '../../hooks/useFeedSettings';
import { Origin } from '../../lib/analytics';

interface FilterOnboardingProps {
  onSelectedTopics?(tags: Record<string, boolean>): void;
  className?: string;
  setHasCategories?: (hasCategories: boolean) => void;
}

export function FilterOnboarding({
  onSelectedTopics,
  className,
  setHasCategories,
}: FilterOnboardingProps): ReactElement {
  const [invalidMessage, setInvalidMessage] = useState<string>(null);
  const [selectedTopics, setSelectedTopics] = useState({});
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

  useEffect(() => {
    const hasSelectedTopics = Object.values(selectedTopics).some(
      (value) => value === true,
    );
    if (setHasCategories) setHasCategories(hasSelectedTopics);
  }, [selectedTopics, setHasCategories]);

  return (
    <div
      className={classNames(
        'grid gap-4 w-fit tablet:w-full tablet:grid-cols-3 grid-cols-2',
        className,
      )}
    >
      {tagsCategories?.map((category) => (
        <FeedTopicCard
          key={category.title}
          topic={category}
          isActive={selectedTopics[category.id]}
          onClick={(e) => onChangeSelectedTopic(e, category.id)}
        />
      ))}
    </div>
  );
}
