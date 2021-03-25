import React, { ReactElement, useContext } from 'react';
import { QueryClient, useQuery, useQueryClient } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '../lib/config';
import { SIMILAR_POSTS_QUERY, SimilarPostsData } from '../graphql/similarPosts';
import classNames from 'classnames';
import Button from './buttons/Button';
import ArrowIcon from '../icons/arrow.svg';
import BookmarkIcon from '../icons/bookmark.svg';
import Link from 'next/link';
import { Post } from '../graphql/posts';
import styles from '../styles/cards.module.css';
import { CardLink } from './cards/Card';
import LazyImage from './LazyImage';
import { trackEvent } from '../lib/analytics';
import { getTooltipProps } from '../lib/tooltip';
import AuthContext from '../contexts/AuthContext';
import useBookmarkPost from '../hooks/useBookmarkPost';
import { ElementPlaceholder } from './utilities';
import classed from '../lib/classed';

export type SimilarPostsProps = {
  postId: string;
  tags: string[];
  className?: string;
};

const Separator = <div className="h-px bg-theme-divider-tertiary" />;

type PostProps = {
  post: Post;
  onLinkClick: (post: Post) => unknown;
  onBookmarkClick: (post: Post) => unknown;
};

const imageClassName = 'w-7 h-7 rounded-full mt-1';
const textContainerClassName = 'flex flex-col ml-3 mr-2 flex-1';

const ListItem = ({
  post,
  onLinkClick,
  onBookmarkClick,
}: PostProps): ReactElement => (
  <article
    className={classNames(
      'relative flex py-2 pl-4 pr-2 group items-start hover:bg-theme-hover',
      styles.card,
    )}
  >
    <CardLink
      href={post.permalink}
      target="_blank"
      rel="noopener"
      title={post.title}
      onClick={() => onLinkClick(post)}
      onMouseUp={(event) => event.button === 1 && onLinkClick(post)}
    />
    <LazyImage
      imgSrc={post.source.image}
      imgAlt={post.source.name}
      className={imageClassName}
    />
    <div className={textContainerClassName}>
      <h5
        className={classNames(
          'typo-callout text-theme-label-primary mb-0.5 multi-truncate',
          styles.title,
        )}
      >
        {post.title}
      </h5>
      <div className="flex items-center typo-footnote text-theme-label-tertiary">
        {post.trending ? (
          <>
            <div className="typo-caption2 uppercase font-bold bg-theme-status-error text-theme-label-primary rounded px-2 py-px">
              Hot
            </div>
            <div className="ml-2">{post.trending} devs read it last hour</div>
          </>
        ) : (
          <>
            {post.numUpvotes > 0 && <div>{post.numUpvotes} Upvotes</div>}
            {post.numComments > 0 && (
              <div className={post.numUpvotes > 0 && 'ml-2'}>
                {post.numComments} Comments
              </div>
            )}
          </>
        )}
      </div>
    </div>
    <Button
      className="btn-tertiary-bun mt-1 group-hover:visible mouse:invisible"
      pressed={post.bookmarked}
      buttonSize="small"
      icon={<BookmarkIcon />}
      {...getTooltipProps(post.bookmarked ? 'Remove bookmark' : 'Bookmark')}
      onClick={() => onBookmarkClick(post)}
    />
  </article>
);

const TextPlaceholder = classed(ElementPlaceholder, 'h-3 rounded-xl my-0.5');

const ListItemPlaceholder = (): ReactElement => (
  <article aria-busy className="relative flex py-2 pl-4 pr-2 items-start">
    <ElementPlaceholder className={imageClassName} />
    <div className={textContainerClassName}>
      <TextPlaceholder style={{ width: '80%' }} />
      <TextPlaceholder style={{ width: '80%' }} />
      <TextPlaceholder style={{ width: '40%' }} />
    </div>
  </article>
);

const transformPosts = (
  posts: Post[],
  id: string,
  update: (oldPost: Post) => Partial<Post>,
): Post[] =>
  posts.map((post) =>
    post.id === id
      ? {
          ...post,
          ...update(post),
        }
      : post,
  );

const updatePost = (
  queryClient: QueryClient,
  queryKey: string[],
  update: (oldPost: Post) => Partial<Post>,
): (({}: { id: string }) => Promise<() => void>) => async ({ id }) => {
  await queryClient.cancelQueries(queryKey);
  const previousData = queryClient.getQueryData<SimilarPostsData>(queryKey);
  queryClient.setQueryData(queryKey, {
    trendingPosts: transformPosts(previousData.trendingPosts, id, update),
    similarPosts: transformPosts(previousData.similarPosts, id, update),
  });
  return () => {
    queryClient.setQueryData(queryKey, previousData);
  };
};

export default function SimilarPosts({
  postId,
  tags,
  className,
}: SimilarPostsProps): ReactElement {
  const queryKey = ['similarPosts', postId];
  const { user, showLogin } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { data: posts, isLoading } = useQuery<SimilarPostsData>(
    queryKey,
    () =>
      request(`${apiUrl}/graphql`, SIMILAR_POSTS_QUERY, {
        loggedIn: !!user,
        post: postId,
        trendingFirst: 1,
        similarFirst: 3,
        tags,
      }),
    {
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      refetchOnMount: false,
    },
  );

  const { bookmark, removeBookmark } = useBookmarkPost({
    onBookmarkMutate: updatePost(queryClient, queryKey, () => ({
      bookmarked: true,
    })),
    onRemoveBookmarkMutate: updatePost(queryClient, queryKey, () => ({
      bookmarked: false,
    })),
  });

  if (
    !posts?.similarPosts?.length &&
    !posts?.trendingPosts?.length &&
    !isLoading
  ) {
    return <></>;
  }

  const onLinkClick = (): void => {
    trackEvent({
      category: 'Post',
      action: 'Click',
      label: 'Similar Posts',
    });
  };

  const onBookmark = async (post: Post): Promise<void> => {
    if (!user) {
      showLogin();
      return;
    }
    const bookmarked = !post.bookmarked;
    trackEvent({
      category: 'Post',
      action: 'Bookmark',
      label: bookmarked ? 'Add' : 'Remove',
    });
    if (bookmarked) {
      await bookmark({ id: post.id });
    } else {
      await removeBookmark({ id: post.id });
    }
  };

  const onShowMore = (): void => {
    trackEvent({
      category: 'Similar Posts',
      action: 'More',
    });
  };

  return (
    <section
      className={classNames(
        'flex flex-col rounded-2xl bg-theme-bg-secondary',
        className,
      )}
    >
      <h4 className="pl-6 pr-4 py-3 typo-body text-theme-label-tertiary">
        You might like
      </h4>
      {Separator}
      {isLoading ? (
        <>
          <ListItemPlaceholder />
          <ListItemPlaceholder />
          <ListItemPlaceholder />
        </>
      ) : (
        <>
          {posts.trendingPosts.map((post) => (
            <ListItem
              key={post.id}
              post={post}
              onLinkClick={onLinkClick}
              onBookmarkClick={onBookmark}
            />
          ))}
          {posts.similarPosts
            .slice(
              0,
              Math.min(
                posts.similarPosts.length,
                3 - posts.trendingPosts.length,
              ),
            )
            .map((post) => (
              <ListItem
                key={post.id}
                post={post}
                onLinkClick={onLinkClick}
                onBookmarkClick={onBookmark}
              />
            ))}
        </>
      )}

      {Separator}
      <Link href="/" passHref>
        <Button
          className="btn-tertiary self-start ml-2 my-2"
          buttonSize="small"
          tag="a"
          rightIcon={<ArrowIcon className="icon transform rotate-90" />}
          onClick={onShowMore}
          onMouseUp={(event) => event.button === 1 && onShowMore()}
        >
          Show more
        </Button>
      </Link>
    </section>
  );
}
