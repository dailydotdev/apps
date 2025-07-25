import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { CardHeader } from './Card';
import SourceButton from './SourceButton';
import type { Source } from '../../../graphql/sources';
import { isSourceUserSource } from '../../../graphql/sources';
import { ReadArticleButton } from './ReadArticleButton';
import { getGroupedHoverContainer } from './common';
import { useBookmarkProvider, useFeedPreviewMode } from '../../../hooks';
import type { Post } from '../../../graphql/posts';
import {
  getReadPostButtonText,
  isInternalReadType,
  isSharedPostSquadPost,
} from '../../../graphql/posts';
import { ButtonVariant } from '../../buttons/Button';
import type { FlagProps } from './FeedItemContainer';
import {
  BookmakProviderHeader,
  headerHiddenClassName,
} from './BookmarkProviderHeader';
import { ProfileImageLink } from '../../profile/ProfileImageLink';
import { ProfileImageSize } from '../../ProfilePicture';
import { DeletedPostId } from '../../../lib/constants';
import { useInteractiveFeedContext } from '../../../contexts/InteractiveFeedContext';
import { PostOptionButton } from '../../../features/posts/PostOptionButton';
import type { UserShortProfile } from '../../../lib/user';
import { useFeature } from '../../GrowthBookProvider';
import { featureCardUiButtons } from '../../../lib/featureManagement';

const HoverCard = dynamic(
  /* webpackChunkName: "hoverCard" */ () => import('./HoverCard'),
);

const UserEntityCard = dynamic(
  /* webpackChunkName: "userEntityCard" */ () =>
    import('../entity/UserEntityCard'),
);

interface CardHeaderProps {
  post: Post;
  className?: string;
  children?: ReactNode;
  source: Source;
  onReadArticleClick?: (e: React.MouseEvent) => unknown;
  postLink: string;
  openNewTab?: boolean;
  flagProps?: FlagProps;
  showFeedback?: boolean;
}

const Container = getGroupedHoverContainer('span');

export const PostCardHeader = ({
  post,
  className,
  onReadArticleClick,
  children,
  source,
  postLink,
  openNewTab,
  showFeedback,
}: CardHeaderProps): ReactElement => {
  const isFeedPreview = useFeedPreviewMode();
  const isSharedPostDeleted = post.sharedPost?.id === DeletedPostId;
  const isUserSource = isSourceUserSource(post.source);
  const { interactiveFeedExp } = useInteractiveFeedContext();
  const buttonExp = useFeature(featureCardUiButtons);
  const { highlightBookmarkedPost } = useBookmarkProvider({
    bookmarked: post.bookmarked && !showFeedback,
  });

  const articleLink = useMemo(() => {
    if (post.sharedPost) {
      const shouldUseInternalLink =
        isSharedPostSquadPost(post) || isInternalReadType(post.sharedPost);

      return shouldUseInternalLink
        ? post.sharedPost?.commentsPermalink
        : post.sharedPost?.permalink;
    }

    return postLink;
  }, [post, postLink]);

  return (
    <>
      {highlightBookmarkedPost && (
        <BookmakProviderHeader className={className} isArticleCard />
      )}
      <CardHeader
        className={classNames(
          className,
          highlightBookmarkedPost && headerHiddenClassName,
          interactiveFeedExp && 'mx-0',
          buttonExp && 'mt-4',
        )}
      >
        {!isUserSource && (
          <SourceButton
            size={
              isFeedPreview && interactiveFeedExp
                ? ProfileImageSize.Small
                : undefined
            }
            source={source}
          />
        )}
        {!!post?.author && (
          <HoverCard
            align="start"
            side="bottom"
            sideOffset={10}
            trigger={
              <ProfileImageLink
                picture={{ size: ProfileImageSize.Medium }}
                user={post.author}
              />
            }
          >
            <UserEntityCard user={post.author as UserShortProfile} />
          </HoverCard>
        )}
        {children}
        <Container
          className="ml-auto flex flex-row"
          data-testid="cardHeaderActions"
        >
          {!isFeedPreview && (
            <>
              {!isSharedPostDeleted && (
                <ReadArticleButton
                  content={getReadPostButtonText(post)}
                  className="mr-2"
                  variant={ButtonVariant.Primary}
                  href={articleLink}
                  onClick={onReadArticleClick}
                  openNewTab={openNewTab}
                />
              )}
              <PostOptionButton post={post} />
            </>
          )}
        </Container>
      </CardHeader>
    </>
  );
};
