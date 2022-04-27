import React, { ReactElement, useMemo } from 'react';
import { FeedFiltersIntroModalTagPill } from '../utilities';

type FeedTagItemProps = {
  tag: string;
  isLastTagPill: boolean;
  isFirstTagPill: boolean;
};

const tagPillWidths = ['w-[4.5rem]', 'w-24', 'w-[7.5rem]'];

const getRandomTagWidth = () => {
  const randomIndex = Math.floor(Math.random() * tagPillWidths.length);
  const randomWidthValue = tagPillWidths[randomIndex];
  return randomWidthValue;
};

const getPillWidth = (isFirstTagPill: boolean, isLastTagPill: boolean) => {
  if (isFirstTagPill || isLastTagPill) {
    return 'flex-1';
  }
  return getRandomTagWidth();
};

const FeedTagItem = ({
  tag,
  isLastTagPill,
  isFirstTagPill,
}: FeedTagItemProps): ReactElement => {
  const pillWidth = useMemo(
    () => getPillWidth(isFirstTagPill, isLastTagPill),
    [isFirstTagPill, isLastTagPill],
  );
  const isPlaceholder = !tag.length;
  const className = isPlaceholder
    ? `${pillWidth} rounded-10 bg-theme-float`
    : 'flex-shrink w-auto bg-theme-label-disabled';

  return (
    <FeedFiltersIntroModalTagPill className={className}>
      {isPlaceholder ? '' : `#${tag}`}
    </FeedFiltersIntroModalTagPill>
  );
};
export default FeedTagItem;
