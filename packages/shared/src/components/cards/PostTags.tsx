import React, { ReactElement, useMemo, useState } from 'react';
import { Post } from '../../graphql/posts';
import Classed from '../../lib/classed';
import { useFeedLayout } from '../../hooks';
import { useFeedTags } from '../../hooks/feed/useFeedTags';

type PostTagsProps = Pick<Post, 'tags'>;

const Chip = Classed(
  'div',
  'rounded-8 border border-border-subtlest-tertiary px-2 h-6 flex items-center justify-center typo-footnote text-text-quaternary my-2',
);

export default function PostTags({ tags }: PostTagsProps): ReactElement {
  const { isListMode } = useFeedLayout();
  const [width, setWidth] = useState(0);
  const listModeTagsList = useFeedTags({ tags, width });
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

  const list = isListMode ? listModeTagsList : tagList;
  const tagsCount = tags?.length || 0;
  const remainingTags = tagsCount - tagList.length;

  return (
    <div
      className="flex w-full items-center gap-2"
      ref={(el) => {
        if (!el || !isListMode) {
          return;
        }

        const { width: elWidth } = el.getBoundingClientRect();

        if (elWidth !== width) {
          setWidth(elWidth);
        }
      }}
    >
      {list.map((tag) => (
        <Chip key={tag}>#{tag}</Chip>
      ))}
      {remainingTags > 0 && (
        <Chip>{`+${remainingTags}${isListMode ? '' : ' tags'}`}</Chip>
      )}
    </div>
  );
}
