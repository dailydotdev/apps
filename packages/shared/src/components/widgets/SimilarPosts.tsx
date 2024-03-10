import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { ArrowIcon, BookmarkIcon } from '../icons';
import { Post, PostType } from '../../graphql/posts';
import styles from '../cards/Card.module.css';
import { LazyImage } from '../LazyImage';
import { CardLink } from '../cards/Card';
import { ElementPlaceholder } from '../ElementPlaceholder';
import classed from '../../lib/classed';
import { postAnalyticsEvent } from '../../lib/feed';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { HotLabel } from '../utilities';
import { combinedClicks } from '../../lib/click';
import {
  Button,
  ButtonColor,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { CardCover } from '../cards/common/CardCover';
import { IconSize } from '../Icon';
import PostReadTime from '../cards/v1/PostReadTime';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { PostPageOnboarding } from '../../lib/featureValues';

export type SimilarPostsProps = {
  posts: Post[] | null;
  isLoading: boolean;
  onBookmark: (post: Post) => unknown;
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

const Separator = <div className="h-px bg-theme-divider-tertiary" />;

type PostProps = {
  post: Post;
  onLinkClick: (post: Post) => unknown;
  onBookmark: (post: Post) => unknown;
};

const imageClassName = 'w-7 h-7 rounded-full mt-1';
const textContainerClassName = 'flex flex-col ml-3 mr-2 flex-1';

const DefaultListItem = ({
  post,
  onLinkClick,
  onBookmark,
}: PostProps): ReactElement => (
  <article
    className={classNames(
      'group relative flex items-start py-2 pl-4 pr-2 hover:bg-theme-hover',
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
          'multi-truncate mb-0.5 text-ellipsis break-words text-theme-label-primary typo-callout',
          styles.title,
        )}
      >
        {post.title}
      </h5>
      <div className="flex items-center text-theme-label-tertiary typo-footnote">
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
        variant={ButtonVariant.Tertiary}
        color={ButtonColor.Bun}
        className="mt-1 group-hover:visible mouse:invisible"
        pressed={post.bookmarked}
        size={ButtonSize.Small}
        icon={<BookmarkIcon secondary={post.bookmarked} />}
        onClick={() => onBookmark(post)}
      />
    </SimpleTooltip>
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

interface SidePostProps {
  post: Post;
  onLinkClick: () => void;
}

const SidePost = ({ post, onLinkClick }: SidePostProps) => {
  const isVideoType = post.type === PostType.VideoYouTube;

  return (
    <div className="grid grid-cols-2 gap-4">
      <Link href={post.commentsPermalink} passHref>
        <a
          className="flex flex-col gap-3 text-text-quaternary typo-footnote"
          href={post.commentsPermalink}
          onClick={onLinkClick}
        >
          <CardCover
            isVideoType={isVideoType}
            imageProps={{
              loading: 'lazy',
              alt: `Cover preview of: ${post.title}`,
              src: post.image,
              className: 'w-full !h-24 !rounded-8',
            }}
            videoProps={{ size: IconSize.Large }}
          />
          <h3 className="line-clamp-3 font-bold typo-subhead">{post.title}</h3>
          <span className="typo-footnote">A{Separator}B</span>
          <PostReadTime readTime={post.readTime} isVideoType={isVideoType} />
        </a>
      </Link>
    </div>
  );
};

export default function SimilarPosts({
  posts,
  isLoading,
  onBookmark,
  className,
  title = 'You might like',
  moreButtonProps,
  ListItem = DefaultListItem,
}: SimilarPostsProps): ReactElement {
  const postPageOnboarding = useFeature(feature.postPageOnboarding);
  const { trackEvent } = useContext(AnalyticsContext);
  const moreButtonHref =
    moreButtonProps?.href || process.env.NEXT_PUBLIC_WEBAPP_URL;
  const moreButtonText = moreButtonProps?.text || 'View all';

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
        'flex flex-col rounded-16 border border-theme-divider-tertiary',
        className,
      )}
    >
      <h4 className="py-3 pl-6 pr-4 text-theme-label-tertiary typo-body">
        {title}
      </h4>
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
            <SidePost
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
