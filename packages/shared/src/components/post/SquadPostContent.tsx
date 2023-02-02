import React, {
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useMutation } from 'react-query';
import classNames from 'classnames';
import { modalSizeToClassName } from '../modals/common/Modal';
import { PostNavigationProps } from './PostNavigation';
import { postDateFormat } from '../../lib/dateFormat';
import PostContentContainer from './PostContentContainer';
import usePostContent from '../../hooks/usePostContent';
import { ModalSize } from '../modals/common/types';
import FixedPostNavigation from './FixedPostNavigation';
import PostSummary from '../cards/PostSummary';
import { LazyImage } from '../LazyImage';
import { ReadArticleButton } from '../cards/ReadArticleButton';
import ArrowIcon from '../icons/Arrow';
import PostSourceInfo from './PostSourceInfo';
import { PostContentProps } from './PostContent';
import { BasePostContent } from './BasePostContent';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import { cloudinary } from '../../lib/image';
import SettingsContext from '../../contexts/SettingsContext';
import { ProfilePicture } from '../ProfilePicture';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import { PostLoadingPlaceholder } from './PostLoadingPlaceholder';
import { sendViewPost } from '../../graphql/posts';

function SquadPostContent({
  post,
  isFallback,
  shouldOnboardAuthor,
  enableShowShareNewComment,
  isLoading,
  origin,
  position,
  inlineActions,
  className,
  customNavigation,
  onPreviousPost,
  onNextPost,
  onClose,
}: PostContentProps): ReactElement {
  if (isLoading)
    return (
      <PostContentContainer hasNavigation>
        <PostLoadingPlaceholder shouldShowWidgets={false} />
      </PostContentContainer>
    );

  const { mutateAsync: onSendViewPost } = useMutation(sendViewPost);
  const { openNewTab } = useContext(SettingsContext);
  const hasNavigation = !!onPreviousPost || !!onNextPost;
  const [height, setHeight] = useState<number>(null);
  const { sidebarRendered } = useSidebarRendered();
  const [shoudShowSummary, setShouldShowSummary] = useState(true);
  const engagementActions = usePostContent({ origin, post });
  const { onReadArticle, onSharePost, onToggleBookmark } = engagementActions;

  const navigationProps: PostNavigationProps = {
    post,
    onBookmark: onToggleBookmark,
    onPreviousPost,
    onNextPost,
    onShare: onSharePost,
    onClose,
    inlineActions,
  };

  const tldrHeight = useMemo(() => {
    if (height === null) return 'auto';

    return shoudShowSummary ? height : 0;
  }, [shoudShowSummary, height]);

  useEffect(() => {
    onSendViewPost(post.id);
  }, [post.id]);

  const containerClass =
    sidebarRendered && modalSizeToClassName[ModalSize.Large];

  return (
    <>
      {position === 'fixed' && (
        <FixedPostNavigation
          {...navigationProps}
          onReadArticle={onReadArticle}
          className={className?.fixedNavigation}
        />
      )}
      <PostContentContainer
        className={classNames(
          'relative py-8 px-6 post-content',
          containerClass,
          className?.container,
        )}
        hasNavigation={hasNavigation}
      >
        <BasePostContent
          className={{
            ...className,
            onboarding: 'mb-6',
            navigation: { actions: 'ml-auto', container: 'mb-6' },
          }}
          isLoading={isLoading}
          isFallback={isFallback}
          customNavigation={customNavigation}
          enableShowShareNewComment={enableShowShareNewComment}
          shouldOnboardAuthor={shouldOnboardAuthor}
          navigationProps={navigationProps}
          engagementProps={engagementActions}
          origin={origin}
          post={post}
        >
          <PostSourceInfo
            date={postDateFormat(post.createdAt)}
            source={post.source}
          />
          <span className="flex flex-row items-center mt-3">
            <ProfileTooltip user={post.author}>
              <ProfilePicture
                user={post.author}
                size="xxlarge"
                nativeLazyLoading
              />
            </ProfileTooltip>
            <ProfileTooltip
              user={post.author}
              link={{ href: post.author.permalink }}
            >
              <a className="flex flex-col ml-4">
                <span className="font-bold">{post.author.name}</span>
                <span className="text-theme-label-tertiary">
                  @{post.author.username}
                </span>
              </a>
            </ProfileTooltip>
          </span>
          <p className="mt-6 typo-title3">{post.title}</p>
          <div className="flex flex-col mt-8 rounded-16 border border-theme-divider-tertiary hover:border-theme-divider-secondary">
            <a
              href={post.sharedPost.commentsPermalink}
              title="Go to article"
              rel="noopener"
              className="flex flex-col-reverse laptop:flex-row p-4 max-w-full"
              onClick={onReadArticle}
            >
              <div className="flex flex-col flex-1">
                <h2 className="flex flex-wrap mt-4 laptop:mt-0 mb-4 font-bold typo-body">
                  {post.sharedPost.title}
                </h2>
                <PostSourceInfo
                  date={`${post.sharedPost.readTime}m read time`}
                  source={post.source}
                  typo="typo-footnote"
                  size="small"
                />
                <ReadArticleButton
                  buttonSize="medium"
                  className="mt-5 btn-secondary w-fit"
                  href={post.sharedPost.permalink}
                  openNewTab={openNewTab}
                />
              </div>
              <div className="block overflow-hidden w-70 rounded-2xl cursor-pointer h-fit">
                <LazyImage
                  imgSrc={post.sharedPost.image}
                  imgAlt="Post cover image"
                  ratio="52%"
                  eager
                  fallbackSrc={cloudinary.post.imageCoverPlaceholder}
                />
              </div>
            </a>
            {post.sharedPost.summary && (
              <>
                <PostSummary
                  ref={(el) => {
                    if (!el?.offsetHeight || height !== null) return;

                    setHeight(el.offsetHeight);
                  }}
                  style={{ height: tldrHeight }}
                  className={classNames(
                    'mx-4 transition-all duration-300 ease-in-out',
                    shoudShowSummary && 'mb-4',
                  )}
                  summary={post.sharedPost.summary}
                />
                <button
                  type="button"
                  className="flex flex-row justify-center py-2 w-full font-bold hover:underline border-t border-theme-divider-tertiary typo-callout"
                  onClick={() => setShouldShowSummary(!shoudShowSummary)}
                >
                  {shoudShowSummary ? 'Hide' : 'Show'} TLDR{' '}
                  <ArrowIcon
                    className={classNames(
                      'ml-2 transition-transform ease-in-out duration-300',
                      !shoudShowSummary && 'rotate-180',
                    )}
                  />
                </button>
              </>
            )}
          </div>
        </BasePostContent>
      </PostContentContainer>
    </>
  );
}

export default SquadPostContent;
