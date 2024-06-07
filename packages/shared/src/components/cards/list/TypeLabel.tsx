import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { PostType } from '../../../graphql/posts';

type TypeLabelType = PostType | ReactElement | string;

const typeToClassName: Record<
  PostType.Collection | PostType.VideoYouTube,
  string
> = {
  [PostType.Collection]: 'text-brand-default',
  [PostType.VideoYouTube]: 'text-accent-blueCheese-default',
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
  focus?: boolean;
}

export function TypeLabel({
  type = PostType.Article,
  className,
  focus,
}: TypeLabelProps): ReactElement {
  // do not show tag label for excluded types
  if (excludedTypes.has(type as PostType)) {
    return null;
  }

  return (
    <legend
      className={classNames(
        'rounded-4 bg-background-default font-bold capitalize typo-caption1',
        typeToClassName[type as PostType] ?? 'text-text-tertiary',
        !focus && '-top-[9px]', // taking the border width into account
        focus && '-top-2.5',
        className,
      )}
    >
      <div
        className={classNames(
          'rounded-4 px-2 group-hover:bg-surface-float group-focus:bg-surface-float',
          focus && 'bg-surface-float',
        )}
      >
        {typeToLabel[type as PostType] ?? type}
      </div>
    </legend>
  );
}
