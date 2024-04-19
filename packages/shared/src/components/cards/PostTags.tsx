import React, { ReactElement, useMemo } from 'react';
import { Post } from '../../graphql/posts';
import Classed from '../../lib/classed';

type PostTagsProps = Pick<Post, 'tags'>;

const Chip = Classed(
  'div',
  'rounded-8 border border-border-subtlest-tertiary px-2 h-6 flex items-center justify-center typo-footnote text-text-quaternary my-2',
);

export default function PostTags({ tags }: PostTagsProps): ReactElement {
  const tagList = useMemo(() => {
    if (!tags) {
      return [];
    }

    let totalLength = 0;
    return tags.reduce((acc, tag) => {
      totalLength += tag.length;
      if (totalLength >= 12 && acc.length >= 2) {
        return acc;
      }
      if (totalLength >= 18 && acc.length > 0) {
        return acc;
      }

      acc.push(tag);
      return acc;
    }, []);
  }, [tags]);

  const tagsCount = tags?.length || 0;
  const remainingTags = tagsCount - tagList.length;

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
