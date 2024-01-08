import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { PostType } from '../../../graphql/posts';

type TypeLabelType = PostType | ReactElement | string;

const typeToClassName: Record<
  PostType.Collection | PostType.VideoYouTube,
  string
> = {
  [PostType.Collection]: 'text-theme-color-cabbage',
  [PostType.VideoYouTube]: 'text-theme-color-blueCheese',
};

const typeToLabel = {
  [PostType.VideoYouTube]: 'Video',
};

const excludedTypes = new Set<PostType>([
  PostType.Article,
  PostType.Freeform,
  PostType.Share,
  PostType.Welcome,
]);

export interface TypeLabelProps {
  type: TypeLabelType;
  className?: string | undefined;
}

export function TypeLabel({
  type = PostType.Article,
  className,
}: TypeLabelProps): ReactElement {
  // do not show tag label for excluded types
  if (excludedTypes.has(type as PostType)) {
    return null;
  }

  return (
    <legend
      className={classNames(
        'rounded bg-theme-bg-primary px-2 font-bold capitalize typo-caption1 group-hover:bg-theme-bg-secondary group-focus:bg-theme-bg-secondary',
        typeToClassName[type as PostType] ?? 'text-theme-label-tertiary',
        className,
      )}
    >
      {typeToLabel[type as PostType] ?? type}
    </legend>
  );
}
