import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import { PostRelationType } from '../../../graphql/posts';
import { useRelatedPosts } from '../../../hooks/post/useRelatedPosts';
import { SourceAvatar } from '../../profile/source';
import { ProfileImageSize } from '../../ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { anchorDefaultRel, pluralize } from '../../../lib/strings';

interface CollectionSourcesProps {
  post: Post;
}

/**
 * The collection's reference sources, integrated into the main reading flow as
 * a horizontal carousel of source cards instead of the classic right-rail list.
 */
export const CollectionSources = ({
  post,
}: CollectionSourcesProps): ReactElement | null => {
  const { relatedPosts, isLoading } = useRelatedPosts({
    postId: post.id,
    relationType: PostRelationType.Collection,
    perPage: 20,
  });
  const edges = relatedPosts?.pages.flatMap((page) => page.edges) ?? [];

  if (!isLoading && edges.length === 0) {
    return null;
  }

  const count = post.numCollectionSources ?? edges.length;

  return (
    <section className="flex flex-col gap-3">
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Body}
        color={TypographyColor.Primary}
        bold
      >
        {count} {pluralize('source', count)}
      </Typography>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {edges.map(({ node }) => (
          <a
            key={node.id}
            href={node.commentsPermalink}
            rel={anchorDefaultRel}
            target="_blank"
            title={node.title}
            className="flex w-64 shrink-0 flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-3 transition-colors hover:border-border-subtlest-primary"
          >
            <div className="flex min-w-0 items-center gap-2">
              <SourceAvatar
                source={node.source}
                size={ProfileImageSize.Small}
              />
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
                className="truncate"
              >
                {node.source.name}
              </Typography>
            </div>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Primary}
              className="line-clamp-3"
            >
              {node.title}
            </Typography>
          </a>
        ))}
      </div>
    </section>
  );
};
