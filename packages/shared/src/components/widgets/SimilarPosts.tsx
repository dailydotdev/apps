import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import { ArrowIcon } from '../icons';
import type { Post } from '../../graphql/posts';
import styles from '../cards/common/Card.module.css';
import { LazyImage } from '../LazyImage';
import { CardLink } from '../cards/common/Card';
import { ElementPlaceholder } from '../ElementPlaceholder';
import classed from '../../lib/classed';
import { postLogEvent } from '../../lib/feed';
import LogContext from '../../contexts/LogContext';
import { HotLabel } from '../utilities';
import { combinedClicks } from '../../lib/click';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { PostEngagementCounts } from '../cards/SimilarPosts';

export type SimilarPostsProps = {
  posts: Post[] | null;
  isLoading: boolean;
  className?: string;
  title?: string;
  moreButtonProps?: {
    href?: string;
    text?: string;
  };
  ListItem?: React.ComponentType<PostProps> & {
    Placeholder: () => ReactElement;
  };
};

const Separator = <div className="h-px bg-border-subtlest-tertiary" />;

type PostProps = {
  post: Post;
  onLinkClick: (post: Post) => unknown;
};

const imageClassName = 'w-7 h-7 rounded-full mt-1';
const textContainerClassName = 'flex flex-col ml-3 mr-2 flex-1';

const DefaultListItem = ({ post, onLinkClick }: PostProps): ReactElement => (
  <article
    className={classNames(
      'group relative flex items-start py-2 pl-4 pr-2 hover:bg-surface-hover',
      styles.card,
    )}
  >
    <CardLink
      href={post.commentsPermalink}
      title={post.title}
      {...combinedClicks(() => onLinkClick(post))}
    />
    <LazyImage
      imgSrc={post.source.image}
      imgAlt={post.source.name}
      className={imageClassName}
    />
    <div className={textContainerClassName}>
      <h5
        className={classNames(
          'multi-truncate mb-0.5 text-ellipsis break-words text-text-primary typo-callout',
          styles.title,
        )}
      >
        {post.title}
      </h5>
      {post.trending ? (
        <div className="flex items-center text-text-tertiary typo-footnote">
          <HotLabel />
          <div className="ml-2">{post.trending} devs read it last hour</div>
        </div>
      ) : (
        <PostEngagementCounts
          upvotes={post.numUpvotes}
          comments={post.numComments}
          className="text-text-tertiary"
        />
      )}
    </div>
  </article>
);

const TextPlaceholder = classed(ElementPlaceholder, 'h-3 rounded-12 my-0.5');

const DefaultListItemPlaceholder = (): ReactElement => (
  <article aria-busy className="relative flex items-start py-2 pl-4 pr-2">
    <ElementPlaceholder className={imageClassName} />
    <div className={textContainerClassName}>
      <TextPlaceholder style={{ width: '80%' }} />
      <TextPlaceholder style={{ width: '80%' }} />
      <TextPlaceholder style={{ width: '40%' }} />
    </div>
  </article>
);
DefaultListItem.Placeholder = DefaultListItemPlaceholder;

export default function SimilarPosts({
  posts,
  isLoading,
  className,
  title = 'You might like',
  moreButtonProps,
  ListItem = DefaultListItem,
}: SimilarPostsProps): ReactElement {
  const { logEvent } = useContext(LogContext);
  const moreButtonHref =
    moreButtonProps?.href || process.env.NEXT_PUBLIC_WEBAPP_URL;
  const moreButtonText = moreButtonProps?.text || 'View all';

  const onLinkClick = async (post: Post): Promise<void> => {
    logEvent(
      postLogEvent('click', post, {
        extra: { origin: 'recommendation' },
      }),
    );
  };

  return (
    <section
      className={classNames(
        'flex flex-col rounded-16 border border-border-subtlest-tertiary',
        className,
      )}
    >
      <h4 className="my-0.5 px-4 py-3 text-text-tertiary typo-body">{title}</h4>
      {Separator}
      {isLoading ? (
        <>
          <ListItem.Placeholder />
          <ListItem.Placeholder />
          <ListItem.Placeholder />
        </>
      ) : (
        <>
          {posts.map((post) => (
            <ListItem
              key={post.id}
              post={post}
              onLinkClick={() => onLinkClick(post)}
            />
          ))}
        </>
      )}

      {Separator}
      <Link href={moreButtonHref} passHref>
        <Button
          variant={ButtonVariant.Tertiary}
          className="my-2 ml-2 self-start"
          size={ButtonSize.Small}
          tag="a"
          icon={<ArrowIcon className="rotate-90" />}
          iconPosition={ButtonIconPosition.Right}
        >
          {moreButtonText}
        </Button>
      </Link>
    </section>
  );
}
