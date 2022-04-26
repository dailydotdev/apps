import React, { ReactElement } from 'react';
import { FeedFiltersIntroModalTagPill } from '../utilities';

type FeedTagItemProps = {
  tag: string;
  lastTagPill: boolean;
  firstTagPill: boolean;
};

const tagPillWidths = [18, 24, 30];

const randomTagWidth = () => {
  const randomIndex = Math.floor(Math.random() * tagPillWidths.length);
  const randomWidthValue = tagPillWidths[randomIndex];
  return randomWidthValue;
};

const getPillWidth = (firstTagPill, lastTagPill) => {
  if (firstTagPill || lastTagPill) {
    return 'flex-1';
  } else return `w-${randomTagWidth()}`;
};

const FeedTagItem = ({
  tag,
  lastTagPill,
  firstTagPill,
}: FeedTagItemProps): ReactElement => {
  const isPlaceholder = !tag.length;
  const className = isPlaceholder
    ? `${getPillWidth(firstTagPill, lastTagPill)} rounded-10 bg-theme-float`
    : 'flex-shrink w-auto bg-theme-label-disabled';

  return (
    <FeedFiltersIntroModalTagPill className={className}>
      {isPlaceholder ? '' : `#${tag}`}
    </FeedFiltersIntroModalTagPill>
  );
};
export default FeedTagItem;
