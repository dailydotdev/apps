import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import ArrowIcon from '@dailydotdev/shared/icons/arrow.svg';
import BookmarkIcon from '@dailydotdev/shared/icons/bookmark.svg';
import Link from 'next/link';
import { Post } from '@dailydotdev/shared/src/graphql/posts';
import styles from '@dailydotdev/shared/src/components/cards/Card.module.css';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import { CardLink } from '@dailydotdev/shared/src/components/cards/Card';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import { logReadArticle } from '@dailydotdev/shared/src/lib/analytics';
import classed from '@dailydotdev/shared/src/lib/classed';
import { postAnalyticsEvent } from '@dailydotdev/shared/src/lib/feed';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { SimpleTooltip } from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';

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
            <div className="py-px px-2 font-bold uppercase rounded typo-caption2 bg-theme-status-error text-theme-label-primary">
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
    <SimpleTooltip content={post.bookmarked ? 'Remove bookmark' : 'Bookmark'}>
      <Button
        className="group-hover:visible mouse:invisible mt-1 btn-tertiary-bun"
        pressed={post.bookmarked}
        buttonSize="small"
        icon={<BookmarkIcon />}
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
    await logReadArticle('recommendation');
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
          rightIcon={<ArrowIcon className="transform rotate-90 icon" />}
        >
          Show more
        </Button>
      </Link>
    </section>
  );
}
