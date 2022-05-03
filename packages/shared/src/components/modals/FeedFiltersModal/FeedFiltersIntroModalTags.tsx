import React, { ReactElement, useState } from 'react';
import { FeedFiltersIntroModalTagPill } from '../../utilities';

type FeedFiltersIntroModalTagsProps = {
  tag: string;
  shouldBeCut: boolean;
};

const widths = ['w-[4.5rem]', 'w-24', 'w-[7.5rem]'];

const getRandomWidth = () => {
  const randomIndex = Math.floor(Math.random() * widths.length);
  return widths[randomIndex];
};

const getWidth = (shouldBeCut: boolean) => {
  if (shouldBeCut) {
    return 'flex-1';
  }
  return getRandomWidth();
};

const FeedFiltersIntroModalTags = ({
  tag,
  shouldBeCut,
}: FeedFiltersIntroModalTagsProps): ReactElement => {
  const [pillWidth] = useState(() => getWidth(shouldBeCut));

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
