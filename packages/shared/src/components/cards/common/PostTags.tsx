import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import Classed from '../../../lib/classed';
import { useFeedTags } from '../../../hooks/feed/useFeedTags';
import { useFeedLayout } from '../../../hooks';

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
  const [width, setWidth] = useState(0);
  const { isListMode } = useFeedLayout();
  // const tags = post?.tags || [];
  const tags = ['c', 'sql', 'gpu', 'cuda', 'duckdb'];
  const elementRef = useRef<HTMLDivElement>(null);
  const list = useFeedTags({
    tags,
    width,
    offset: isListMode ? 0 : 8,
    baseTagWidth: 20,
  });
  const tagsCount = tags?.length || 0;
  const remainingTags = tagsCount - list.length;

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width || 0);
    });

    if (elementRef.current && globalThis) {
      resizeObserver.observe(elementRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      className={classNames(
        'flex min-h-px w-full min-w-0 items-center gap-2 overflow-hidden',
        className,
      )}
      ref={elementRef}
    >
      {width > 0 && list.map((tag) => <Chip key={tag}>#{tag}</Chip>)}
      {remainingTags > 0 && <Chip>+{remainingTags}</Chip>}
    </div>
  );
}
