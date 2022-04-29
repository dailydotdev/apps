import React, { ReactElement, useState } from 'react';
import { FeedFiltersIntroModalTagPill } from '../../utilities';

type FeedFiltersIntroModalTagsProps = {
  tag: string;
  isLast: boolean;
  isFirst: boolean;
};

const widths = ['w-[4.5rem]', 'w-24', 'w-[7.5rem]'];

const getRandomWidth = () => {
  const randomIndex = Math.floor(Math.random() * widths.length);
  const randomWidthValue = widths[randomIndex];
  return randomWidthValue;
};

const getWidth = (isFirst: boolean, isLast: boolean) => {
  if (isFirst || isLast) {
    return 'flex-1';
  }
  return getRandomWidth();
};

const FeedFiltersIntroModalTags = ({
  tag,
  isLast,
  isFirst,
}: FeedFiltersIntroModalTagsProps): ReactElement => {
  const [pillWidth] = useState(() => getWidth(isFirst, isLast));

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
export default FeedFiltersIntroModalTags;
