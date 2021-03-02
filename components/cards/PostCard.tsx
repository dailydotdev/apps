/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { HTMLAttributes, ReactElement, useState } from 'react';
import Link from 'next/link';
import { Post } from '../../graphql/posts';
import {
  Card,
  CardHeader,
  CardImage,
  CardLink,
  CardSpace,
  CardTextContainer,
  CardTitle,
} from './Card';
import styled from '@emotion/styled';
import { smallRoundedImage, SmallRoundedImage } from '../utilities';
import sizeN from '../../macros/sizeN.macro';
import { typoCallout, typoFootnote } from '../../styles/typography';
import { postDateFormat } from '../../lib/dateFormat';
import QuandaryButton from '../buttons/QuandaryButton';
import UpvoteIcon from '../../icons/upvote.svg';
import CommentIcon from '../../icons/comment.svg';
import BookmarkIcon from '../../icons/bookmark.svg';
import FeatherIcon from '../../icons/feather.svg';
import TertiaryButton from '../buttons/TertiaryButton';
import classNames from 'classnames';
import rem from '../../macros/rem.macro';
import dynamic from 'next/dynamic';
import InteractionCounter from '../InteractionCounter';
import { focusOutline } from '../../styles/helpers';
import { Comment } from '../../graphql/comments';

const ShareIcon = dynamic(() => import('../../icons/share.svg'));
const FeaturedComment = dynamic(() => import('./FeaturedComment'));

type Callback = (post: Post) => unknown;

export type PostCardProps = {
  post: Post;
  onLinkClick?: Callback;
  onUpvoteClick?: (post: Post, upvoted: boolean) => unknown;
  onCommentClick?: Callback;
  onBookmarkClick?: (post: Post, bookmarked: boolean) => unknown;
  showShare?: boolean;
  onShare?: Callback;
} & HTMLAttributes<HTMLDivElement>;

const MetadataContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0 ${sizeN(4)};
  color: var(--theme-label-tertiary);
  ${typoFootnote}
`;

const MetadataSeparator = styled.div`
  width: 1em;
  height: 1em;
  margin: 0 ${sizeN(1)};
  font-size: ${sizeN(0.5)};
  border-radius: 100%;
  background: var(--theme-label-tertiary);
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 ${sizeN(4)};

  & > * {
    margin-left: ${sizeN(1)};

    &:first-child {
      margin-left: 0;
    }
  }
`;

const AuthorBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  padding: ${rem(8)} ${rem(12)};
  color: var(--theme-label-secondary);
  background: var(--theme-background-primary);
  z-index: 1;
  font-weight: bold;
  ${typoCallout}

  span {
    flex: 1;
    overflow: hidden;
    margin: 0 ${rem(12)};
    text-overflow: ellipsis;
  }

  .icon {
    font-size: ${rem(24)};
    color: var(--theme-status-help);
  }
`;

const StyledCard = styled(Card)`
  &.read {
    border-color: var(--theme-divider-quaternary);
    background: var(--theme-post-disabled);
    box-shadow: none;

    ${CardTitle} {
      color: var(--theme-label-tertiary);
    }
  }

  ${CardImage} {
    margin: ${sizeN(2)} 0;
  }

  @media (pointer: fine) {
    ${AuthorBox} {
      visibility: hidden;
    }

    &:hover ${AuthorBox} {
      visibility: visible;
    }
  }
`;

const FeaturedCommentButton = styled.button`
  display: flex;
  padding: 0;
  background: none;
  border: none;
  border-radius: 100%;
  cursor: pointer;
  ${focusOutline}
`;

export function PostCard({
  post,
  onLinkClick,
  onUpvoteClick,
  onCommentClick,
  onBookmarkClick,
  showShare,
  onShare,
  className,
  children,
  ...props
}: PostCardProps): ReactElement {
  const [selectedComment, setSelectedComment] = useState<Comment>();

  return (
    <StyledCard
      {...props}
      className={classNames({ read: post.read }, className)}
    >
      {selectedComment ? (
        <FeaturedComment
          comment={selectedComment}
          onBack={() => setSelectedComment(null)}
        />
      ) : (
        <>
          <CardLink
            href={post.permalink}
            target="_blank"
            rel="noopener"
            title={post.title}
            onClick={() => onLinkClick?.(post)}
            onMouseUp={(event) => event.button === 1 && onLinkClick?.(post)}
          />
          <CardTextContainer>
            <CardHeader>
              <Link href={`/sources/${post.source.id}`} prefetch={false}>
                <a
                  title={post.source.name}
                  css={css`
                    display: flex;
                    padding-right: ${sizeN(2)};
                    cursor: pointer;
                  `}
                >
                  <img
                    src={post.source.image}
                    alt={post.source.name}
                    css={smallRoundedImage}
                    style={{ background: 'var(--theme-background-tertiary)' }}
                  />
                </a>
              </Link>
              {post.featuredComments?.map((comment) => (
                <FeaturedCommentButton
                  title={`See ${comment.author.name}'s comment`}
                  onClick={() => setSelectedComment(comment)}
                  key={comment.id}
                >
                  <img
                    src={comment.author.image}
                    alt={`${comment.author.name}'s profile image`}
                    css={smallRoundedImage}
                    style={{ background: 'var(--theme-background-tertiary)' }}
                  />
                </FeaturedCommentButton>
              ))}
            </CardHeader>
            <CardTitle>{post.title}</CardTitle>
          </CardTextContainer>
          <CardSpace />
          <MetadataContainer>
            <time dateTime={post.createdAt}>
              {postDateFormat(post.createdAt)}
            </time>
            {!!post.readTime && (
              <>
                <MetadataSeparator />
                <span data-testid="readTime">{post.readTime}m read time</span>
              </>
            )}
          </MetadataContainer>
          <CardImage
            imgAlt="Post Cover image"
            imgSrc={post.image}
            fallbackSrc="https://res.cloudinary.com/daily-now/image/upload/f_auto/v1/placeholders/1"
          >
            {post.author && (
              <AuthorBox>
                <SmallRoundedImage
                  imgSrc={post.author.image}
                  imgAlt="Author's profile picture"
                />
                <span>{post.author.name}</span>
                <FeatherIcon />
              </AuthorBox>
            )}
          </CardImage>
          <ActionButtons>
            <QuandaryButton
              id={`post-${post.id}-upvote-btn`}
              icon={<UpvoteIcon />}
              themeColor="avocado"
              buttonSize="small"
              pressed={post.upvoted}
              title={post.upvoted ? 'Remove upvote' : 'Upvote'}
              onClick={() => onUpvoteClick?.(post, !post.upvoted)}
              style={{ width: rem(78) }}
            >
              <InteractionCounter
                value={post.numUpvotes > 0 && post.numUpvotes}
              />
            </QuandaryButton>
            <Link href={post.commentsPermalink} passHref prefetch={false}>
              <QuandaryButton
                id={`post-${post.id}-comment-btn`}
                tag="a"
                icon={<CommentIcon />}
                themeColor="avocado"
                buttonSize="small"
                pressed={post.commented}
                title="Comment"
                onClick={() => onCommentClick?.(post)}
                style={{ width: rem(78) }}
              >
                <InteractionCounter
                  value={post.numComments > 0 && post.numComments}
                />
              </QuandaryButton>
            </Link>
            <TertiaryButton
              icon={<BookmarkIcon />}
              themeColor="bun"
              buttonSize="small"
              pressed={post.bookmarked}
              title={post.bookmarked ? 'Remove bookmark' : 'Bookmark'}
              onClick={() => onBookmarkClick?.(post, !post.bookmarked)}
            />
            {showShare && (
              <TertiaryButton
                icon={<ShareIcon />}
                buttonSize="small"
                title="Share post"
                onClick={() => onShare?.(post)}
              />
            )}
          </ActionButtons>
        </>
      )}

      {children}
    </StyledCard>
  );
}
