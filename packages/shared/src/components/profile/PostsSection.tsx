import React, {
  FormEvent,
  ReactElement,
  ReactNode,
  useContext,
  useRef,
  useState,
} from 'react';
import {
  commentContainerClass,
  CommentContent,
  commentInfoClass,
  EmptyMessage,
} from './common';
import { ownershipGuide } from '../../lib/constants';
import { Button } from '../buttons/Button';
import ActivitySection from './ActivitySection';
import Link from 'next/link';
import { smallPostImage } from '../../lib/image';
import EyeIcon from '../../../icons/eye.svg';
import { largeNumberFormat } from '../../lib/numberFormat';
import UpvoteIcon from '../../../icons/upvote.svg';
import CommentIcon from '../../../icons/comment.svg';
import { useInfiniteQuery } from 'react-query';
import { AUTHOR_FEED_QUERY, FeedData } from '../../graphql/posts';
import request from 'graphql-request';
import { apiUrl } from '../../lib/config';
import { LazyImage } from '../LazyImage';
import { TextField } from '../fields/TextField';
import {
  loggedUserToProfile,
  updateProfile,
  UserProfile,
} from '../../lib/user';
import ProgressiveEnhancementContext from '../../contexts/ProgressiveEnhancementContext';
import AuthContext from '../../contexts/AuthContext';
import { formToJson } from '../../lib/form';
import dynamic from 'next/dynamic';
import styles from './PostsSection.module.css';
import classed from '../../lib/classed';
import sizeN from '../../../macros/sizeN.macro';

const AccountDetailsModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "accountDetailsModal"*/ '../modals/AccountDetailsModal'
    ),
);

const PostStat = classed(
  'div',
  'flex items-center text-theme-label-tertiary font-bold typo-callout',
);
const postStatIconClass = 'icon mr-1 text-xl';

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
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const { user, updateUser, tokenRefreshed } = useContext(AuthContext);

  const formRef = useRef<HTMLFormElement>(null);
  const [disableSubmit, setDisableSubmit] = useState<boolean>(true);
  const [twitterHint, setTwitterHint] = useState<string>();
  const [showAccountDetails, setShowAccountDetails] = useState(false);

  const updateDisableSubmit = () => {
    if (formRef.current) {
      setDisableSubmit(!formRef.current.checkValidity());
    }
  };

  const onSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setDisableSubmit(true);
    const data = formToJson<UserProfile>(
      formRef.current,
      loggedUserToProfile(user),
    );

    const res = await updateProfile(data);
    if ('error' in res) {
      if ('code' in res && res.code === 1) {
        if (res.field === 'twitter') {
          setTwitterHint('This Twitter handle is already used');
        } else {
          setTwitterHint('Please contact us hi@daily.dev');
        }
      }
    } else {
      await updateUser({ ...user, ...res });
      setDisableSubmit(false);
    }
  };

  const posts = useInfiniteQuery<FeedData>(
    ['user_posts', userId],
    ({ pageParam }) =>
      request(`${apiUrl}/graphql`, AUTHOR_FEED_QUERY, {
        userId: userId,
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
          href="mailto:hi@daily.dev?subject=Email us to add your articles retroactively"
          target="_blank"
          rel="noopener"
        >
          Add my articles retroactively
        </a>
      </p>
    );
  } else {
    postsEmptyScreen = (
      <>
        <EmptyMessage data-testid="emptyPosts">
          {`Track when articles you publish around the web got picked up by
          daily.dev. Set up your Twitter handle and we'll do the rest 🙌`}
        </EmptyMessage>
        {user.email && user.username ? (
          <form
            className="flex flex-col items-start mt-6"
            ref={formRef}
            onSubmit={onSubmit}
          >
            <TextField
              inputId="twitter"
              name="twitter"
              label="Twitter"
              value={user.twitter}
              hint={twitterHint}
              valid={!twitterHint}
              placeholder="handle"
              pattern="(\w){1,15}"
              maxLength={15}
              validityChanged={updateDisableSubmit}
              valueChanged={() => twitterHint && setTwitterHint(null)}
              className="self-stretch mb-4"
              style={{ maxWidth: sizeN(78) }}
            />
            <Button
              className="btn-primary"
              type="submit"
              disabled={disableSubmit}
              style={{ width: sizeN(30) }}
            >
              Save
            </Button>
          </form>
        ) : (
          <>
            <button
              className="btn-primary mt-4 self-start"
              onClick={() => setShowAccountDetails(true)}
            >
              Complete your profile
            </button>
            {(windowLoaded || showAccountDetails) && (
              <AccountDetailsModal
                isOpen={showAccountDetails}
                onRequestClose={() => setShowAccountDetails(false)}
              />
            )}
          </>
        )}
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
              <LazyImage
                imgSrc={post.source.image}
                imgAlt={post.source.name}
                className={`top-1/2 left-0 w-8 h-8 bg-theme-bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2 ${styles.sourceImage}`}
                absolute
              />
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
