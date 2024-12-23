import React, { ReactElement, useRef } from 'react';
import classNames from 'classnames';
import { Post } from '../../../graphql/posts';
import Classed from '../../../lib/classed';
import { useFeedTags } from '../../../hooks/feed/useFeedTags';
import { useFeedLayout } from '../../../hooks';
import { useFeature } from '../../GrowthBookProvider';
import { feedActionSpacing } from '../../../lib/featureManagement';

interface PostTagsProps extends Pick<Post, 'tags'> {
  className?: string;
}

const Chip = Classed(
  'div',
  'rounded-8 border border-border-subtlest-tertiary px-2 h-6 flex items-center justify-center typo-footnote text-text-quaternary my-2',
);

export default function PostTags({
  tags,
  className,
}: PostTagsProps): ReactElement {
  const { isListMode } = useFeedLayout();
  const elementRef = useRef<HTMLDivElement>(null);
  const width = elementRef?.current?.getBoundingClientRect()?.width || 0;
  const feedActionSpacingExp = useFeature(feedActionSpacing);
  const list = useFeedTags({
    tags,
    width,
    offset: isListMode ? 0 : 8,
    base: feedActionSpacingExp ? 16 : undefined,
  });
  const tagsCount = tags?.length || 0;
  const remainingTags = tagsCount - list.length;

  return (
    <div
      className={classNames(
        'flex min-h-px flex-1 items-center gap-2',
        className,
      )}
      ref={elementRef}
    >
      {width > 0 && list.map((tag) => <Chip key={tag}>#{tag}</Chip>)}
      {remainingTags > 0 && <Chip>+{remainingTags}</Chip>}
    </div>
  );
}
