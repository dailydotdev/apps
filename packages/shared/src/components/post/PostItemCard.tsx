import React, { MouseEvent, ReactElement } from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { HidePostItemCardProps } from '../../graphql/users';
import { PostItem } from '../../graphql/posts';
import XIcon from '../icons/Close';
import MenuIcon from '../icons/Menu';
import classed from '../../lib/classed';
import { Button, ButtonSize } from '../buttons/Button';
import PostMetadata from '../cards/PostMetadata';
import { ProfilePicture } from '../ProfilePicture';
import { Image } from '../image/Image';
import ConditionalWrapper from '../ConditionalWrapper';
import { cloudinary } from '../../lib/image';

interface PostItemCardProps {
  className?: string;
  postItem: PostItem;
  showButtons?: boolean;
  clickable?: boolean;
  onHide?: (params: HidePostItemCardProps) => Promise<unknown>;
  onContextMenu?: (event: React.MouseEvent, post: PostItem) => void;
}

const SourceShadow = classed(
  'div',
  'absolute left-5 -my-1 w-8 h-8 rounded-full bg-theme-bg-primary',
);

export default function PostItemCard({
  postItem,
  showButtons = true,
  clickable = true,
  onHide,
  className,
  onContextMenu,
}: PostItemCardProps): ReactElement {
  const { timestampDb, post } = postItem;
  const onHideClick = (e: MouseEvent) => {
    e.stopPropagation();
    onHide({ postId: post.id, timestamp: timestampDb });
  };
  const article = post?.sharedPost ?? post;

  return (
    <ConditionalWrapper
      condition={clickable}
      wrapper={(children) => (
        <Link href={post.commentsPermalink}>{children}</Link>
      )}
    >
      <article
        className={classNames(
          'flex relative flex-row items-center py-3 pr-5 pl-9',
          clickable && 'hover:bg-theme-hover hover:cursor-pointer',
          className,
        )}
      >
        <Image
          src={article.image}
          alt={post.title}
          className="object-cover w-16 laptop:w-24 h-16 rounded-16"
          loading="lazy"
          fallbackSrc={cloudinary.post.imageCoverPlaceholder}
        />
        <SourceShadow />
        <ProfilePicture
          size="small"
          rounded="full"
          className="absolute left-6"
          user={{
            image: post.source.image,
            username: `source of ${post.title}`,
          }}
          nativeLazyLoading
        />
        <div className="flex flex-col flex-1 ml-4">
          <h3 className="flex flex-1 mr-6 text-left break-words line-clamp-2 typo-callout">
            {post.title}
          </h3>
          <PostMetadata readTime={post.readTime} numUpvotes={post.numUpvotes} />
        </div>
        {showButtons && onHide && (
          <Button
            buttonSize={ButtonSize.Small}
            className="hidden laptop:flex btn-tertiary"
            icon={<XIcon />}
            onClick={onHideClick}
          />
        )}
        {showButtons && (
          <Button
            className="btn-tertiary"
            data-testId={`post-item-${post.id}`}
            icon={<MenuIcon />}
            onClick={(event) => {
              event.stopPropagation();
              onContextMenu(event, postItem);
            }}
            buttonSize={ButtonSize.Small}
          />
        )}
      </article>
    </ConditionalWrapper>
  );
}
