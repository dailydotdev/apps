import React, {
  FormEvent,
  ReactElement,
  ReactNode,
  useContext,
  useRef,
} from 'react';
import Link from 'next/link';
import { useInfiniteQuery } from 'react-query';
import request from 'graphql-request';
import classNames from 'classnames';
import {
  commentContainerClass,
  CommentContent,
  commentInfoClass,
  EmptyMessage,
} from './common';
import { ownershipGuide } from '../../lib/constants';
import { Button } from '../buttons/Button';
import ActivitySection from './ActivitySection';
import { smallPostImage } from '../../lib/image';
import EyeIcon from '../icons/Eye';
import { largeNumberFormat } from '../../lib/numberFormat';
import UpvoteIcon from '../icons/Upvote';
import CommentIcon from '../icons/Discuss';
import { AUTHOR_FEED_QUERY, FeedData, Post } from '../../graphql/posts';
import { apiUrl } from '../../lib/config';
import { LazyImage } from '../LazyImage';
import { UserProfile } from '../../lib/user';
import AuthContext from '../../contexts/AuthContext';
import { formToJson } from '../../lib/form';
import styles from './PostsSection.module.css';
import classed from '../../lib/classed';
import FeatherIcon from '../icons/Feather';
import ScoutIcon from '../icons/Scout';
import useProfileForm from '../../hooks/useProfileForm';
import TwitterIcon from '../icons/Twitter';
import { TextField } from '../fields/TextField';

const PostStat = classed(
  'div',
  'flex items-center text-theme-label-tertiary font-bold typo-callout',
);
const postStatIconClass = 'icon mr-1 text-xl';

const iconImageClass =
  'top-1/2 left-0 w-8 h-8 bg-theme-bg-primary rounded-full -translate-x-1/2 -translate-y-1/2';

const iconImage = (post: Post) => {
  if (post.isAuthor || post.isScout) {
    return (
      <div
        className={classNames(
          iconImageClass,
          'absolute flex items-center justify-center',
        )}
      >
        {post.isAuthor ? (
          <FeatherIcon
            secondary
            data-testid="post-author-badge"
            className="text-xl text-theme-color-cheese"
          />
        ) : (
          <ScoutIcon
            secondary
            data-testid="post-scout-badge"
            className="text-xl text-theme-color-bun"
          />
        )}
      </div>
    );
  }

  return (
    <LazyImage
      imgSrc={post.source.image}
      imgAlt={post.source.name}
      className={classNames(iconImageClass, styles.sourceImage)}
      absolute
    />
  );
};

export type PostsSectionProps = {
  userId: string;
  isSameUser: boolean;
  numPosts: number;
};

export default function PostsSection({
  userId,
  isSameUser,
  numPosts,
}: PostsSectionProps): ReactElement {
  const { user, tokenRefreshed } = useContext(AuthContext);
  const { updateUserProfile, isLoading, hint } = useProfileForm();

  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();

    const values = formToJson<UserProfile>(formRef.current);
    const params = {
      twitter: values.twitter,
    };
    updateUserProfile(params);
  };

  const posts = useInfiniteQuery<FeedData>(
    ['user_posts', userId],
    ({ pageParam }) =>
      request(`${apiUrl}/graphql`, AUTHOR_FEED_QUERY, {
        userId,
        first: 3,
        after: pageParam,
      }),
    {
      enabled: !!userId && tokenRefreshed,
      getNextPageParam: (lastPage) =>
        lastPage.page.pageInfo.hasNextPage && lastPage.page.pageInfo.endCursor,
    },
  );

  let postsEmptyScreen: ReactNode;
  if (!isSameUser) {
    postsEmptyScreen = (
      <EmptyMessage data-testid="emptyPosts">No articles yet.</EmptyMessage>
    );
  } else if (user.twitter) {
    postsEmptyScreen = (
      <p
        className="typo-callout text-theme-label-tertiary"
        data-testid="emptyPosts"
      >
        No articles yet.
        <br />
        <br />
        <a
          className="no-underline text-theme-label-link"
          href={ownershipGuide}
          target="_blank"
          rel="noopener"
        >
          How daily.dev picks up new articles
        </a>
        <br />
        <br />
        Do you have articles you wrote that got picked up by daily.dev in the
        past?
        <br />
        <br />
        <a
          className="no-underline text-theme-label-link"
          href="mailto:support@daily.dev?subject=Add my articles retroactively&body=README: To add your articles retroactively, please reply with your username or a link to your profile on daily.dev. Keep in mind that we can only add articles that we're already picked up by daily.dev. Not sure if your article appeared in our feed? Try searching its headline here: https://app.daily.dev/search"
          target="_blank"
          rel="noopener"
        >
          Email us to add your articles retroactively
        </a>
      </p>
    );
  } else {
    postsEmptyScreen = (
      <>
        <EmptyMessage data-testid="emptyPosts">
          {`Track when articles you published are getting picked by
          daily.dev. Set up your Twitter handle and we'll do the rest 🙌`}
        </EmptyMessage>
        <form
          className="flex flex-col items-stretch mt-6 max-w-sm"
          ref={formRef}
          onSubmit={onSubmit}
        >
          <TextField
            leftIcon={<TwitterIcon />}
            label="Twitter"
            inputId="twitter"
            hint={hint.twitter}
            name="twitter"
            value={user.twitter}
          />
          <Button
            className="mt-4 w-28 btn-primary"
            type="submit"
            disabled={isLoading}
          >
            Save
          </Button>
        </form>
      </>
    );
  }

  return (
    <ActivitySection
      title={`${isSameUser ? 'Your ' : ''}Articles`}
      query={posts}
      count={numPosts}
      emptyScreen={postsEmptyScreen}
      elementToNode={(post) => (
        <Link
          href={post.commentsPermalink}
          passHref
          key={post.id}
          prefetch={false}
        >
          <a
            className={`${commentContainerClass} pl-3 no-underline`}
            aria-label={post.title}
          >
            <div className="relative">
              <LazyImage
                imgSrc={smallPostImage(post.image)}
                imgAlt="Post cover image"
                className={`rounded-2xl ${styles.postImage}`}
              />
              {iconImage(post)}
            </div>
            <div className={commentInfoClass}>
              <CommentContent className={styles.postContent}>
                {post.title}
              </CommentContent>
              <div className="grid grid-flow-col auto-cols-max gap-x-4 mt-3 tablet:mt-0 tablet:ml-auto">
                {post.views !== null && (
                  <PostStat>
                    <EyeIcon className={postStatIconClass} />
                    {largeNumberFormat(post.views)}
                  </PostStat>
                )}
                <PostStat>
                  <UpvoteIcon className={postStatIconClass} />
                  {largeNumberFormat(post.numUpvotes)}
                </PostStat>
                <PostStat>
                  <CommentIcon className={postStatIconClass} />
                  {largeNumberFormat(post.numComments)}
                </PostStat>
              </div>
            </div>
          </a>
        </Link>
      )}
    />
  );
}
