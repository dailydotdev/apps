import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import ArrowIcon from '@dailydotdev/shared/icons/arrow.svg';
import Link from 'next/link';
import { Post } from '@dailydotdev/shared/src/graphql/posts';
import styles from '@dailydotdev/shared/src/components/cards/Card.module.css';
import { CardLink } from '@dailydotdev/shared/src/components/cards/Card';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import classed from '@dailydotdev/shared/src/lib/classed';
import { postAnalyticsEvent } from '@dailydotdev/shared/src/lib/feed';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { ProfilePicture } from '@dailydotdev/shared/src/components/ProfilePicture';

export type BestDiscussionsProps = {
  posts: Post[] | null;
  isLoading: boolean;
  className?: string;
};

const Separator = <div className="h-px bg-theme-divider-tertiary" />;

type PostProps = {
  post: Post;
  onLinkClick: (post: Post) => unknown;
};

const ListItem = ({ post, onLinkClick }: PostProps): ReactElement => (
  <article
    className={classNames(
      'relative flex flex-col py-3 px-4 group items-start hover:bg-theme-hover',
      styles.card,
    )}
  >
    <Link href={post.commentsPermalink} prefetch={false} passHref>
      <CardLink
        title={post.title}
        onClick={() => onLinkClick(post)}
        onMouseUp={(event) => event.button === 1 && onLinkClick(post)}
      />
    </Link>
    <h5
      className={classNames(
        'typo-callout text-theme-label-primary mb-2 multi-truncate',
        styles.title,
      )}
    >
      {post.title}
    </h5>
    <div className="flex items-center typo-footnote text-theme-label-tertiary">
      {post.featuredComments?.length > 0 && (
        <div
          className="relative mr-2 h-6"
          style={{ width: `${post.featuredComments.length + 0.5}rem` }}
        >
          {post.featuredComments.map((comment, index) => (
            <ProfilePicture
              key={comment.author.username}
              user={comment.author}
              size="small"
              style={{ left: `${index}rem` }}
            />
          ))}
        </div>
      )}
      <div>{post.numComments} Comments</div>
    </div>
  </article>
);

const TextPlaceholder = classed(ElementPlaceholder, 'h-3 rounded-xl my-0.5');

const ListItemPlaceholder = (): ReactElement => (
  <article aria-busy className="flex relative flex-col items-start py-3 px-4">
    <TextPlaceholder style={{ width: '80%' }} />
    <TextPlaceholder style={{ width: '80%' }} />
    <TextPlaceholder style={{ width: '40%' }} />
  </article>
);

export default function BestDiscussions({
  posts,
  isLoading,
  className,
}: BestDiscussionsProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);

  const onLinkClick = (post: Post): void => {
    trackEvent(
      postAnalyticsEvent('click', post, {
        extra: { origin: 'best discussions' },
      }),
    );
  };

  const onLucky = (): void => {
    // trackEvent({
    //   category: 'Best Discussions',
    //   action: 'Lucky',
    // });
  };

  return (
    <section
      className={classNames(
        'flex flex-col rounded-2xl bg-theme-bg-primary border-theme-divider-quaternary border',
        className,
      )}
    >
      <h4 className="py-3 pr-4 pl-6 typo-body text-theme-label-tertiary">
        Best discussions
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
          {posts?.slice(1).map((post) => (
            <ListItem key={post.id} post={post} onLinkClick={onLinkClick} />
          ))}
        </>
      )}

      {Separator}
      <Link
        href={posts?.[0]?.commentsPermalink ?? '/'}
        prefetch={false}
        passHref
      >
        <Button
          className="self-start my-2 ml-2 btn-tertiary"
          buttonSize="small"
          tag="a"
          rightIcon={<ArrowIcon className="transform rotate-90 icon" />}
          onClick={onLucky}
          onMouseUp={(event) => event.button === 1 && onLucky()}
        >
          I&apos;m feeling lucky
        </Button>
      </Link>
    </section>
  );
}
