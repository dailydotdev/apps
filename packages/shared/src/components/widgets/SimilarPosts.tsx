import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { Button } from '../buttons/Button';
import ArrowIcon from '../icons/Arrow';
import BookmarkIcon from '../icons/Bookmark';
import { Post } from '../../graphql/posts';
import styles from '../cards/Card.module.css';
import { LazyImage } from '../LazyImage';
import { CardLink } from '../cards/Card';
import { ElementPlaceholder } from '../ElementPlaceholder';
import classed from '../../lib/classed';
import { postAnalyticsEvent } from '../../lib/feed';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { HotLabel } from '../utilities';

export type SimilarPostsProps = {
  posts: Post[] | null;
  isLoading: boolean;
  onBookmark: (post: Post) => unknown;
  className?: string;
};

const Separator = <div className="h-px bg-theme-divider-tertiary" />;

type PostProps = {
  post: Post;
  onLinkClick: (post: Post) => unknown;
  onBookmark: (post: Post) => unknown;
};

const imageClassName = 'w-7 h-7 rounded-full mt-1';
const textContainerClassName = 'flex flex-col ml-3 mr-2 flex-1';

const ListItem = ({
  post,
  onLinkClick,
  onBookmark,
}: PostProps): ReactElement => (
  <article
    className={classNames(
      'relative flex py-2 pl-4 pr-2 group items-start hover:bg-theme-hover',
      styles.card,
    )}
  >
    <CardLink
      href={post.commentsPermalink}
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
          'typo-callout text-theme-label-primary mb-0.5 multi-truncate break-words text-ellipsis',
          styles.title,
        )}
      >
        {post.title}
      </h5>
      <div className="flex items-center typo-footnote text-theme-label-tertiary">
        {post.trending ? (
          <>
            <HotLabel />
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
    <SimpleTooltip content={post.bookmarked ? 'Remove bookmark' : 'Bookmark'}>
      <Button
        className="group-hover:visible mouse:invisible mt-1 btn-tertiary-bun"
        pressed={post.bookmarked}
        buttonSize="small"
        icon={<BookmarkIcon secondary={post.bookmarked} />}
        onClick={() => onBookmark(post)}
      />
    </SimpleTooltip>
  </article>
);

const TextPlaceholder = classed(ElementPlaceholder, 'h-3 rounded-xl my-0.5');

const ListItemPlaceholder = (): ReactElement => (
  <article aria-busy className="flex relative items-start py-2 pr-2 pl-4">
    <ElementPlaceholder className={imageClassName} />
    <div className={textContainerClassName}>
      <TextPlaceholder style={{ width: '80%' }} />
      <TextPlaceholder style={{ width: '80%' }} />
      <TextPlaceholder style={{ width: '40%' }} />
    </div>
  </article>
);

export default function SimilarPosts({
  posts,
  isLoading,
  onBookmark,
  className,
}: SimilarPostsProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);

  const onLinkClick = async (post: Post): Promise<void> => {
    trackEvent(
      postAnalyticsEvent('click', post, {
        extra: { origin: 'recommendation' },
      }),
    );
  };

  return (
    <section
      className={classNames(
        'flex flex-col rounded-2xl bg-theme-bg-primary border-theme-divider-quaternary border',
        className,
      )}
    >
      <h4 className="py-3 pr-4 pl-6 typo-body text-theme-label-tertiary">
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
          {posts.map((post) => (
            <ListItem
              key={post.id}
              post={post}
              onLinkClick={onLinkClick}
              onBookmark={onBookmark}
            />
          ))}
        </>
      )}

      {Separator}
      <Link href="/" passHref>
        <Button
          className="self-start my-2 ml-2 btn-tertiary"
          buttonSize="small"
          tag="a"
          rightIcon={<ArrowIcon className="rotate-90" />}
        >
          View all
        </Button>
      </Link>
    </section>
  );
}
