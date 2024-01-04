import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { PostType } from '../../../graphql/posts';

type TypeLabelType = PostType | ReactElement | string;

const typeToClassName: Record<PostType, string> = {
  [PostType.Article]: 'text-theme-label-tertiary',
  [PostType.Collection]: 'text-theme-color-cabbage',
  [PostType.Freeform]: 'text-theme-label-tertiary',
  [PostType.Share]: 'text-theme-label-tertiary',
  [PostType.VideoYouTube]: 'text-theme-color-blueCheese',
  [PostType.Welcome]: 'text-theme-label-tertiary',
};

const typeToLabel = {
  [PostType.VideoYouTube]: 'Video',
};

export interface TypeLabelProps {
  type: TypeLabelType;
  className?: string | undefined;
}

export function TypeLabel({
  type = PostType.Article,
  className,
}: TypeLabelProps): ReactElement {
  // do not show tag label for these types
  if (
    type === PostType.Article ||
    type === PostType.Freeform ||
    type === PostType.Share ||
    type === PostType.Welcome
  ) {
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
