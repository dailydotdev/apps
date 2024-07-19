import React, { ReactElement, useState } from 'react';
import { Post } from '../../graphql/posts';
import Classed from '../../lib/classed';
import { useFeedTags } from '../../hooks/feed/useFeedTags';

type PostTagsProps = Pick<Post, 'tags'>;

const Chip = Classed(
  'div',
  'rounded-8 border border-border-subtlest-tertiary px-2 h-6 flex items-center justify-center typo-footnote text-text-quaternary my-2',
);

export default function PostTags({ tags }: PostTagsProps): ReactElement {
  const [width, setWidth] = useState(0);
  const list = useFeedTags({ tags, width });
  const tagsCount = tags?.length || 0;
  const remainingTags = tagsCount - list.length;

  return (
    <div
      className="flex w-full items-center gap-2"
      ref={(el) => {
        if (!el) {
          return;
        }

        setWidth(el.getBoundingClientRect().width);
      }}
    >
      {list.map((tag) => (
        <Chip key={tag}>#{tag}</Chip>
      ))}
      {remainingTags > 0 && <Chip>+{remainingTags}</Chip>}
    </div>
  );
}
