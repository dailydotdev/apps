import classNames from 'classnames';
import Link from 'next/link';
import React, { ReactElement, useEffect } from 'react';

import { useAuthContext } from '../../../contexts/AuthContext';
import { ToastSubject, useToastNotification } from '../../../hooks';
import { useViewPost } from '../../../hooks/post/useViewPost';
import usePostContent from '../../../hooks/usePostContent';
import { webappUrl } from '../../../lib/constants';
import { TimeFormatType } from '../../../lib/dateFormat';
import { cloudinary } from '../../../lib/image';
import { Separator } from '../../cards/common';
import { LazyImage } from '../../LazyImage';
import Markdown from '../../Markdown';
import { Pill } from '../../Pill';
import { TagLinks } from '../../TagLinks';
import { DateFormat } from '../../utilities';
import { BasePostContent } from '../BasePostContent';
import {
  PostContainer,
  PostContentProps,
  PostNavigationProps,
} from '../common';
import PostContentContainer from '../PostContentContainer';
import { CollectionsIntro } from '../widgets';
import { CollectionPostWidgets } from './CollectionPostWidgets';

export const CollectionPostContent = ({
  post,
  className = {},
  shouldOnboardAuthor,
  origin,
  position,
  inlineActions,
  onPreviousPost,
  onNextPost,
  onClose,
  postPosition,
  isFallback,
  customNavigation,
  onRemovePost,
  backToSquad,
  isBannerVisible,
  isPostPage,
}: PostContentProps): ReactElement => {
  const { user } = useAuthContext();
  const { subject } = useToastNotification();
  const engagementActions = usePostContent({
    origin,
    post,
  });
  const { updatedAt, contentHtml, image } = post;
  const { onCopyPostLink, onReadArticle } = engagementActions;

  const hasNavigation = !!onPreviousPost || !!onNextPost;
  const containerClass = classNames(
    'laptop:flex-row laptop:pb-0',
    className?.container,
  );

  const navigationProps: PostNavigationProps = {
    postPosition,
    onPreviousPost,
    onNextPost,
    post,
    onReadArticle,
    onClose,
    inlineActions,
    onRemovePost,
  };

  const onSendViewPost = useViewPost(post);

  useEffect(() => {
    if (!post?.id || !user?.id) {
      return;
    }

    onSendViewPost(post.id);
  }, [post?.id, onSendViewPost, user?.id]);

  return (
    <PostContentContainer
      hasNavigation={hasNavigation}
      className={containerClass}
      aria-live={subject === ToastSubject.PostContent ? 'polite' : 'off'}
      navigationProps={
        position === 'fixed'
          ? {
              ...navigationProps,
              isBannerVisible,
              className: className?.fixedNavigation,
            }
          : null
      }
    >
      <PostContainer
        className={classNames('relative', className?.content)}
        data-testid="postContainer"
      >
        <BasePostContent
          className={{
            ...className,
            onboarding: classNames(
              className?.onboarding,
              backToSquad && 'mb-6',
            ),
            navigation: {
              actions: className?.navigation?.actions,
              container: classNames('pt-6', className?.navigation?.container),
            },
          }}
          isPostPage={isPostPage}
          isFallback={isFallback}
          customNavigation={customNavigation}
          shouldOnboardAuthor={shouldOnboardAuthor}
          navigationProps={navigationProps}
          engagementProps={engagementActions}
          origin={origin}
          post={post}
        >
          <div
            className={classNames(
              'mb-6 flex flex-col gap-6',
              hasNavigation || customNavigation ? 'mt-6' : 'mt-6 laptop:mt-0',
            )}
          >
            <CollectionsIntro className="laptop:hidden" />
            <Link href={`${webappUrl}sources/collections`} passHref>
              <Pill
                tag="a"
                label="Collection"
                className="bg-theme-overlay-float-cabbage text-brand-default"
              />
            </Link>
            <h1
              className="break-words font-bold typo-large-title"
              data-testid="post-modal-title"
            >
              {post.title}
            </h1>
            <TagLinks tags={post.tags || []} />
            {!!updatedAt && (
              <div className="flex items-center text-text-tertiary typo-footnote">
                <span>Last updated</span> <Separator />
                <DateFormat date={updatedAt} type={TimeFormatType.Post} />
              </div>
            )}
            {image && (
              <div className="block h-auto w-full overflow-hidden rounded-12">
                <LazyImage
                  imgSrc={image}
                  imgAlt="Post cover image"
                  ratio="52%"
                  eager
                  fallbackSrc={cloudinary.post.imageCoverPlaceholder}
                />
              </div>
            )}
            <Markdown content={contentHtml} />
          </div>
        </BasePostContent>
      </PostContainer>
      <CollectionPostWidgets
        onCopyPostLink={onCopyPostLink}
        post={post}
        className="pb-8"
        onClose={onClose}
        origin={origin}
      />
    </PostContentContainer>
  );
};
