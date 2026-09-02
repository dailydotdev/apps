import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { CardHeader } from './ListCard';
import { ReadArticleButton } from '../ReadArticleButton';
import { getGroupedHoverContainer } from '../common';
import { useBookmarkProvider, useFeedPreviewMode } from '../../../../hooks';
import type { Post } from '../../../../graphql/posts';
import { PostType } from '../../../../graphql/posts';
import { ButtonVariant } from '../../../buttons/common';
import type { PostMetadataProps } from './PostMetadata';
import PostMetadata from './PostMetadata';
import { OpenLinkIcon } from '../../../icons';
import { useReadPostButtonText } from './hooks';
import { BookmakProviderHeader } from './BookmarkProviderHeader';
import { PostOptionButton } from '../../../../features/posts/PostOptionButton';
import { AuthorSourceStack } from '../AuthorSourceStack';
import { useFeedCardContext } from '../../../../features/posts/FeedCardContext';

interface CardHeaderProps {
  post: Post;
  className?: string;
  children?: ReactNode;
  onReadArticleClick?: (e: React.MouseEvent) => unknown;
  postLink?: string;
  openNewTab?: boolean;
  readButtonContent?: string;
  readButtonIcon?: ReactElement;
  primaryAction?: ReactNode;
  metadata?: {
    topLabel?: PostMetadataProps['topLabel'];
    bottomLabel?: PostMetadataProps['bottomLabel'];
    dateFirst?: PostMetadataProps['dateFirst'];
    createdAt?: PostMetadataProps['createdAt'];
    dateLabel?: PostMetadataProps['dateLabel'];
    numSources?: PostMetadataProps['numSources'];
    dateType?: PostMetadataProps['dateType'];
  };
}

const Container = getGroupedHoverContainer('span');

export const PostCardHeader = ({
  post,
  className,
  onReadArticleClick,
  children,
  postLink,
  openNewTab,
  readButtonContent,
  readButtonIcon,
  primaryAction,
  metadata,
}: CardHeaderProps): ReactElement => {
  const isFeedPreview = useFeedPreviewMode();
  const postButtonText = useReadPostButtonText(post);
  const { highlightBookmarkedPost } = useBookmarkProvider({
    bookmarked: post.bookmarked ?? false,
  });

  const { hideSource } = useFeedCardContext();
  // Every card labels its source, which is pure repetition on a single-source
  // feed. Swap in the author, who is what actually varies — but only when there
  // is one, otherwise the card loses its only attribution.
  const resolvedMetadata = useMemo(() => {
    if (!hideSource || !post.author) {
      return metadata;
    }

    return {
      ...metadata,
      topLabel: post.author.name,
      bottomLabel: `@${post.author.username}`,
    };
  }, [hideSource, metadata, post.author]);

  const isCollectionType = post.type === 'collection';
  const showCTA =
    !isFeedPreview &&
    ([PostType.Article, PostType.VideoYouTube].includes(post.type) ||
      !!primaryAction ||
      !!readButtonContent);

  return (
    <>
      {highlightBookmarkedPost && <BookmakProviderHeader className="mb-4" />}
      <CardHeader className={className}>
        {post?.author && !isCollectionType ? (
          // Author present (freeform/share/squad): show the author + source as
          // an overlapping stack — author in front on the left, source behind
          // on the right — expanded on mobile, matching the collection source
          // stack. Collection cards keep their own source-stack children (even
          // if a collection ever has an author), and article cards keep their
          // single source.
          <AuthorSourceStack author={post.author} source={post.source} />
        ) : (
          children
        )}
        <PostMetadata
          className={classNames(
            'mr-2 flex-1',
            !isCollectionType && 'ml-4',
            isCollectionType && 'ml-2',
          )}
          createdAt={post.createdAt}
          {...resolvedMetadata}
        />
        <Container
          className="relative ml-auto flex flex-row"
          data-testid="cardHeaderActions"
        >
          {!isFeedPreview && (
            <>
              {showCTA &&
                (primaryAction ?? (
                  <ReadArticleButton
                    content={readButtonContent ?? postButtonText ?? ''}
                    className="mr-2"
                    variant={ButtonVariant.Tertiary}
                    icon={readButtonIcon ?? <OpenLinkIcon />}
                    href={postLink ?? ''}
                    onClick={onReadArticleClick}
                    openNewTab={openNewTab}
                  />
                ))}
              <PostOptionButton post={post} />
            </>
          )}
        </Container>
      </CardHeader>
    </>
  );
};
