import React, { ReactElement, ReactNode, useContext, useMemo } from 'react';
import { IBulletTrainFeature } from 'flagsmith';
import classNames from 'classnames';
import { Post } from '../../graphql/posts';
import { postDateFormat } from '../../lib/dateFormat';
import FeaturesContext from '../../contexts/FeaturesContext';
import classed from '../../lib/classed';

const Separator = classed(
  'div',
  'mx-1 w-0.5 h-0.5 rounded-full bg-theme-label-tertiary',
);

const shouldDisplayPublishDate = (hidePublicationDate: IBulletTrainFeature) =>
  !hidePublicationDate?.enabled
    ? true
    : !parseInt(hidePublicationDate.value, 10);

export default function PostMetadata({
  post,
  className,
  children,
}: {
  post: Post;
  className?: string;
  children?: ReactNode;
}): ReactElement {
  const { flags } = useContext(FeaturesContext);
  const date = useMemo(() => postDateFormat(post.createdAt), [post.createdAt]);
  const shouldDisplay = shouldDisplayPublishDate(flags?.hide_publication_date);

  return (
    <div
      className={classNames(
        'flex items-center text-theme-label-tertiary typo-footnote',
        className,
      )}
    >
      {shouldDisplay && <time dateTime={post.createdAt}>{date}</time>}
      {shouldDisplay && !!post.readTime && <Separator />}
      {!!post.readTime && (
        <span data-testid="readTime">{post.readTime}m read time</span>
      )}
      {children}
    </div>
  );
}
