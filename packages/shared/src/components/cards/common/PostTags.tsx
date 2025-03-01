import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import Classed from '../../../lib/classed';
import { useFeedTags } from '../../../hooks/feed/useFeedTags';
import { useFeedLayout } from '../../../hooks';
import { useFollowPostTags } from '../../../hooks/feed/useFollowPostTags';

interface PostTagsProps {
  post: Post;
  className?: string;
}

const Chip = Classed(
  'div',
  'rounded-8 border border-border-subtlest-tertiary px-2 h-6 flex items-center justify-center typo-footnote text-text-quaternary my-2',
);

export default function PostTags({
  post,
  className,
}: PostTagsProps): ReactElement {
  const { isListMode } = useFeedLayout();
  const { tags: postTags, isTagExperiment } = useFollowPostTags({
    post,
    shouldEvaluateExperiment: true,
  });
  const shouldShowOnlyFollowedTags = !!(
    isTagExperiment && postTags?.followed.length
  );
  const tags = shouldShowOnlyFollowedTags ? postTags?.followed : postTags?.all;

  const elementRef = useRef<HTMLDivElement>(null);
  const width = elementRef?.current?.getBoundingClientRect()?.width || 0;
  const list = useFeedTags({
    tags,
    width,
    offset: isListMode ? 0 : 8,
    base: 16,
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
