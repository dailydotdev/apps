import React, { ReactElement } from 'react';

import { Post } from '../../graphql/posts';
import { ButtonSize } from '../buttons/Button';
import { IconSize } from '../Icon';
import { MagicIcon } from '../icons';
import { TagLinks } from '../TagLinks';
import { FlexCentered } from '../utilities';

function SquadEmptyScreen({ post }: { post: Post }): ReactElement {
  return (
    <FlexCentered className="mt-20 w-full flex-col text-center">
      <MagicIcon
        size={IconSize.XXXLarge}
        secondary
        className="text-text-disabled"
      />
      <p className="my-4 font-bold text-text-primary typo-title2">
        {post?.title
          ? `We couldn't find posts similar to "${post?.title}"`
          : `We couldn't find any similar posts`}
      </p>
      {post?.tags?.length > 0 && (
        <>
          <p className="text-text-tertiary typo-callout">
            Try exploring some related tags instead:
          </p>
          <div className="mt-6 flex gap-3">
            <TagLinks
              tags={post.tags || []}
              buttonProps={{ size: ButtonSize.Large }}
            />
          </div>
        </>
      )}
    </FlexCentered>
  );
}

export default SquadEmptyScreen;
