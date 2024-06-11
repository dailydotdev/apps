import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import FeedTopicCard, { ButtonEvent } from '../containers/FeedTopicCard';
import useTagAndSource from '../../hooks/useTagAndSource';
import useFeedSettings from '../../hooks/useFeedSettings';
import { Origin } from '../../lib/log';

export interface FilterOnboardingProps {
  onSelectedTopics?(tags: Record<string, boolean>): void;
  shouldUpdateAlerts?: boolean;
  className?: string;
  shouldFilterLocally?: boolean;
  feedId?: string;
}

export function FilterOnboarding({
  onSelectedTopics,
  className,
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
    if (onSelectedTopics) {
      onSelectedTopics(result);
    }
    e.currentTarget.blur();
    if (invalidMessage) {
      setInvalidMessage(null);
    }
  };

  return (
    <div
      className={classNames(
        'grid w-fit grid-cols-2 gap-4 tablet:w-full tablet:grid-cols-3',
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
