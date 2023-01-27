import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { Modal, ModalProps, modalSizeToClassName } from './common/Modal';
import PostNavigation, { PostNavigationProps } from '../post/PostNavigation';
import { postDateFormat } from '../../lib/dateFormat';
import BasePostModal from './BasePostModal';
import PostContentContainer from '../post/PostContentContainer';
import PostEngagements from '../post/PostEngagements';
import { Origin } from '../../lib/analytics';
import usePostContent from '../../hooks/usePostContent';
import usePostById from '../../hooks/usePostById';
import usePostNavigationPosition from '../../hooks/usePostNavigationPosition';
import { ModalSize } from './common/types';
import FixedPostNavigation from '../post/FixedPostNavigation';
import SourceButton from '../cards/SourceButton';
import { Separator } from '../cards/common';
import { UserShortInfo } from '../profile/UserShortInfo';
import PostSummary from '../cards/PostSummary';
import { LazyImage } from '../LazyImage';
import { Source } from '../../graphql/sources';
import { ProfileImageSize } from '../ProfilePicture';
import { ReadArticleButton } from '../cards/ReadArticleButton';
import ArrowIcon from '../icons/Arrow';

const SharePostModal = dynamic(
  () => import(/* webpackChunkName: "shareModal" */ './ShareModal'),
);

interface PostModalProps
  extends ModalProps,
    Pick<PostNavigationProps, 'onPreviousPost' | 'onNextPost'> {
  id: string;
  isFetchingNextPage?: boolean;
}

interface SourceInfoProps {
  source: Source;
  date?: string;
  size?: ProfileImageSize;
  typo?: string;
}

const SourceInfo = ({
  date,
  source,
  size = 'medium',
  typo = 'typo-callout',
}: SourceInfoProps) => {
  return (
    <span
      className={classNames(
        'flex flex-row items-center text-theme-label-tertiary',
        typo,
      )}
    >
      <SourceButton source={source} size={size} />
      <h3 className="ml-3">{source.handle}</h3>
      <Separator />
      <time dateTime={date}>{date}</time>
    </span>
  );
};

export default function PostModal({
  id,
  className,
  isFetchingNextPage,
  onRequestClose,
  onPreviousPost,
  onNextPost,
  ...props
}: PostModalProps): ReactElement {
  const hasNavigation = !!onPreviousPost || !!onNextPost;
  const [height, setHeight] = useState<number>(null);
  const [shoudShowSumamry, setShouldShowSummary] = useState(true);
  const { post, isLoading } = usePostById({ id, isFetchingNextPage });
  const position = usePostNavigationPosition({
    isLoading,
    isDisplayed: props.isOpen,
  });
  const { onCloseShare, onReadArticle, onShare, onToggleBookmark, sharePost } =
    usePostContent({
      origin: Origin.ArticleModal,
      post,
    });

  if (!post) return <></>;

  const navigationProps: PostNavigationProps = {
    post,
    onBookmark: onToggleBookmark,
    onPreviousPost,
    onNextPost,
    onReadArticle,
    onClose: onRequestClose,
    onShare,
    inlineActions: true,
  };

  const postLinkProps = {
    href: post.sharedPost.permalink,
    title: 'Go to article',
    target: '_blank',
    rel: 'noopener',
    onClick: onReadArticle,
    onMouseUp: (event: React.MouseEvent) =>
      event.button === 1 && onReadArticle(),
  };

  const getHeight = () => {
    if (height === null) return 'auto';

    return shoudShowSumamry ? height : 0;
  };

  return (
    <BasePostModal
      {...props}
      size={Modal.Size.Large}
      onRequestClose={onRequestClose}
    >
      {position === 'fixed' && (
        <FixedPostNavigation
          {...navigationProps}
          className={{
            container: modalSizeToClassName[ModalSize.Large],
          }}
        />
      )}
      <PostContentContainer
        className="relative py-4 px-6 post-content"
        hasNavigation={hasNavigation}
      >
        <PostNavigation
          {...navigationProps}
          onReadArticle={null}
          className={{ actions: 'ml-auto', container: 'mb-6' }}
        />
        <SourceInfo
          date={postDateFormat(post.createdAt)}
          source={post.source}
        />
        <UserShortInfo
          className="items-center pt-3"
          imageSize="xxlarge"
          user={post.author}
        />
        <p className="mt-6 typo-title3">
          They breezed through simple tasks. I threw more complex tasks at them
          — tasks for those who had a year of experience. What did I get?
        </p>
        <div className="flex flex-col mt-8 rounded-16 border border-theme-divider-tertiary">
          <span className="flex flex-row p-4 max-w-full">
            <div className="flex flex-col flex-1">
              <h2 className="flex flex-wrap mb-4 font-bold line-clamp-2 typo-body">
                {post.sharedPost.title}
              </h2>
              <SourceInfo
                date={`${post.sharedPost.readTime}m read time`}
                source={post.source}
                typo="typo-footnote"
                size="small"
              />
              <ReadArticleButton
                buttonSize="medium"
                className="mt-5 btn-secondary w-fit"
                href={post.sharedPost.permalink}
              />
            </div>
            <a
              {...postLinkProps}
              className="block overflow-hidden w-70 rounded-2xl cursor-pointer"
            >
              <LazyImage
                imgSrc={post.image}
                imgAlt="Post cover image"
                ratio="52%"
                eager
                fallbackSrc="https://res.cloudinary.com/daily-now/image/upload/f_auto/v1/placeholders/1"
              />
            </a>
          </span>
          {post.summary && (
            <PostSummary
              ref={(el) => {
                if (!el?.offsetHeight || height !== null) return;

                setHeight(el.offsetHeight);
              }}
              style={{ height: getHeight() }}
              className="m-4 mt-0 transition-all duration-150 ease-in-out"
              summary="The awesome-pages plugin allows you to customize how your pages show up the navigation of your MkDocs. It gives you detailed control using a small configuration file directly placed in the relevant directory of your documentation. This package requires Python >=3.5 and Mk Docs version 1.0 or higher."
            />
          )}
          <button
            type="button"
            className="flex flex-row justify-center py-2 w-full font-bold hover:underline border-t border-theme-divider-tertiary typo-callout"
            onClick={() => setShouldShowSummary(!shoudShowSumamry)}
          >
            {shoudShowSumamry ? 'Hide' : 'Show'} TLDR{' '}
            <ArrowIcon
              className={classNames('ml-2', !shoudShowSumamry && 'rotate-180')}
            />
          </button>
        </div>
        {post && (
          <PostEngagements
            onShare={onShare}
            onBookmark={onToggleBookmark}
            post={post}
            analyticsOrigin={Origin.ArticleModal}
          />
        )}
      </PostContentContainer>
      {sharePost && (
        <SharePostModal
          isOpen={!!sharePost}
          post={post}
          origin={Origin.ArticleModal}
          onRequestClose={onCloseShare}
        />
      )}
    </BasePostModal>
  );
}
