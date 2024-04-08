import React, { ReactElement, useMemo, useRef } from 'react';
import { Post } from '../../graphql/posts';
import Classed from '../../lib/classed';

type PostTagsProps = Pick<Post, 'tags'>;

const Chip = Classed(
  'div',
  'rounded-8 border border-border-subtlest-tertiary px-2 h-6 flex items-center justify-center typo-footnote text-text-quaternary my-2',
);

export default function PostTags({ tags }: PostTagsProps): ReactElement {
  const totalLength = useRef(0);
  const tagList = useMemo(() => {
    return tags.reduce((acc, tag) => {
      if (totalLength.current >= 15) {
        return acc;
      }

      acc.push(tag);
      totalLength.current += tag.length;
      return acc;
    }, []);
  }, [tags]);

  const remainingTags = tags.length - tagList.length;

  return (
    <div className="flex items-center tablet:mx-2">
      {tagList.map((tag) => (
        <Chip key={tag} className="mr-2">
          #{tag}
        </Chip>
      ))}
      {remainingTags > 0 && <Chip>+{remainingTags} tags</Chip>}
    </div>
  );
}
