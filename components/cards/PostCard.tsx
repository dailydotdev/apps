import React, { HTMLAttributes, ReactElement } from 'react';
import Link from 'next/link';
import { Post } from '../../graphql/posts';
import {
  Card,
  CardImage,
  CardLink,
  CardSpace,
  CardTextContainer,
  CardTitle,
} from './Card';
import styled from 'styled-components/macro';
import { SmallRoundedImage } from '../utilities';
import { size05, size1, size2, size4, size6 } from '../../styles/sizes';
import { typoFootnote } from '../../styles/typography';
import { postDateFormat } from '../../lib/dateFormat';
import QuandaryButton from '../buttons/QuandaryButton';
import UpvoteIcon from '../../icons/upvote.svg';
import CommentIcon from '../../icons/comment.svg';

type Callback = (post: Post) => unknown;

export type PostCardProps = {
  post: Post;
  onLinkClick?: Callback;
  onUpvoteClick?: (post: Post, upvoted: boolean) => unknown;
  onCommentClick?: Callback;
} & HTMLAttributes<HTMLDivElement>;

const CardHeader = styled.div`
  display: flex;
  margin: ${size2} 0;
`;

const MetadataContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0 ${size4};
  color: var(--theme-label-tertiary);
  ${typoFootnote}
`;

const MetadataSeparator = styled.div`
  width: 1em;
  height: 1em;
  margin: 0 ${size1};
  font-size: ${size05};
  border-radius: 100%;
  background: var(--theme-label-tertiary);
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  margin: 0 ${size4};

  & > * {
    margin-left: ${size6};

    &:first-child {
      margin-left: 0;
    }
  }
`;

const StyledCard = styled(Card)<{ read: boolean }>`
  ${({ read }) =>
    read &&
    `
  && {
    border-color: var(--theme-divider-quaternary);
    background: var(--theme-post-disabled);
    box-shadow: none;
  }`}
  ${CardImage} {
    margin: ${size2} 0;
  }
`;

export function PostCard({
  post,
  onLinkClick,
  onUpvoteClick,
  onCommentClick,
  ...props
}: PostCardProps): ReactElement {
  return (
    <StyledCard {...props} read={post.read}>
      <CardLink
        href={post.permalink}
        target="_blank"
        rel="noopener"
        onClick={() => onLinkClick?.(post)}
        onMouseUp={(event) => event.button === 1 && onLinkClick?.(post)}
      />
      <CardTextContainer>
        <CardHeader>
          <SmallRoundedImage
            imgSrc={post.source.image}
            imgAlt={post.source.name}
            background="var(--theme-background-tertiary)"
          />
        </CardHeader>
        <CardTitle>{post.title}</CardTitle>
      </CardTextContainer>
      <CardSpace />
      <MetadataContainer>
        <time dateTime={post.createdAt}>{postDateFormat(post.createdAt)}</time>
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
        lowsrc={post.placeholder}
      />
      <ActionButtons>
        <QuandaryButton
          id={`post-${post.id}-upvote-btn`}
          icon={<UpvoteIcon />}
          themeColor="avocado"
          buttonSize="small"
          pressed={post.upvoted}
          title={post.upvoted ? 'Remove upvote' : 'Upvote'}
          onClick={() => onUpvoteClick?.(post, !post.upvoted)}
        >
          {post.numUpvotes > 0 && post.numUpvotes}
        </QuandaryButton>
        <Link href={post.commentsPermalink} passHref prefetch={false}>
          <QuandaryButton
            id={`post-${post.id}-comment-btn`}
            as="a"
            icon={<CommentIcon />}
            themeColor="avocado"
            buttonSize="small"
            pressed={post.commented}
            title="Comment"
            onClick={() => onCommentClick?.(post)}
          >
            {post.numComments > 0 && post.numComments}
          </QuandaryButton>
        </Link>
      </ActionButtons>
    </StyledCard>
  );
}
