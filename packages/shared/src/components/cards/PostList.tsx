import React, {
  forwardRef,
  ReactElement,
  Ref,
  useContext,
  useMemo,
} from 'react';
import classNames from 'classnames';
import { PostCardProps } from './PostCard';
import {
  getPostClassNames,
  ListCard,
  ListCardTitle,
  ListCardDivider,
  ListCardAside,
  ListCardMain,
} from './Card';
import PostLink from './PostLink';
import PostMetadata from './PostMetadata';
import ActionButtons from './ActionButtons';
import SourceButton from './SourceButton';
import styles from './Card.module.css';
import TrendingFlag from './TrendingFlag';
import PostAuthor from './PostAuthor';
import FeaturesContext from '../../contexts/FeaturesContext';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import { ProfileImageLink } from '../profile/ProfileImageLink';
import classed from '../../lib/classed';

export const PostList = forwardRef(function PostList(
  {
    post,
    onLinkClick,
    onUpvoteClick,
    onCommentClick,
    onBookmarkClick,
    onMenuClick,
    showShare,
    onShare,
    openNewTab,
    enableMenu,
    menuOpened,
    className,
    children,
    postHeadingFont,
    ...props
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { trending } = post;
  const { postCardVersion } = useContext(FeaturesContext);
  const isV1 = postCardVersion === 'v1';
  const isV2 = postCardVersion === 'v2';
  const ActionsContainer = isV2
    ? useMemo(() => classed('div', 'flex flex-row items-center w-full'), [isV2])
    : React.Fragment;

  const card = (
    <ListCard
      {...props}
      className={getPostClassNames(post, className)}
      ref={ref}
    >
      <PostLink post={post} openNewTab={openNewTab} onLinkClick={onLinkClick} />
      {isV1 && (
        <>
          <ListCardAside className="w-14">
            <SourceButton
              source={post?.source}
              className="pb-2"
              tooltipPosition="top"
            />
          </ListCardAside>
          <ListCardDivider className="mb-1" />
        </>
      )}
      <ListCardMain>
        <ListCardTitle className={classNames(className, postHeadingFont)}>
          {post.title}
        </ListCardTitle>
        <PostMetadata
          createdAt={post.createdAt}
          readTime={post.readTime}
          className="my-1"
        >
          {isV1 && <PostAuthor post={post} className="ml-2" />}
        </PostMetadata>
        <ActionsContainer>
          {isV2 && (
            <>
              <SourceButton source={post?.source} tooltipPosition="top" />
              {post.author && (
                <ProfileTooltip
                  link={{ href: post.author.permalink }}
                  user={post.author}
                >
                  <ProfileImageLink
                    className="ml-2"
                    user={post.author}
                    picture={{ size: 'medium' }}
                  />
                </ProfileTooltip>
              )}
              <ListCardDivider className="mx-3" />
            </>
          )}
          <ActionButtons
            post={post}
            onUpvoteClick={onUpvoteClick}
            onCommentClick={onCommentClick}
            onBookmarkClick={onBookmarkClick}
            showShare={showShare}
            onShare={onShare}
            className="relative self-stretch mt-1"
            onMenuClick={(event) => onMenuClick?.(event, post)}
            insaneMode
          />
        </ActionsContainer>
      </ListCardMain>
      {children}
    </ListCard>
  );
  if (trending) {
    return (
      <div className={`relative ${styles.cardContainer}`}>
        {card}
        <TrendingFlag trending={trending} listMode />
      </div>
    );
  }
  return card;
});
