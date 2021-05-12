import React, {
  FormEvent,
  ReactElement,
  ReactNode,
  useContext,
  useRef,
  useState,
} from 'react';
import {
  CommentContainer,
  CommentContent,
  commentInfoClass,
  EmptyMessage,
} from './common';
import { ownershipGuide } from '@dailydotdev/shared/src/lib/constants';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import ActivitySection from './ActivitySection';
import Link from 'next/link';
import { smallPostImage } from '@dailydotdev/shared/src/lib/image';
import EyeIcon from '@dailydotdev/shared/icons/eye.svg';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import UpvoteIcon from '@dailydotdev/shared/icons/upvote.svg';
import CommentIcon from '@dailydotdev/shared/icons/comment.svg';
import { useInfiniteQuery } from 'react-query';
import { AUTHOR_FEED_QUERY, FeedData } from '../../graphql/posts';
import request from 'graphql-request';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import styled from '@emotion/styled';
import sizeN from '@dailydotdev/shared/macros/sizeN.macro';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import { tablet } from '../../styles/media';
import { typoCallout } from '../../styles/typography';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import {
  loggedUserToProfile,
  updateProfile,
  UserProfile,
} from '@dailydotdev/shared/src/lib/user';
import ProgressiveEnhancementContext from '../../../shared/src/contexts/ProgressiveEnhancementContext';
import AuthContext from '../../../shared/src/contexts/AuthContext';
import { formToJson } from '@dailydotdev/shared/src/lib/form';
import dynamic from 'next/dynamic';

const AccountDetailsModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "accountDetailsModal"*/ '../modals/AccountDetailsModal'
    ),
);

const PostContainer = styled(CommentContainer)`
  padding-left: ${sizeN(3)};
  text-decoration: none;
`;

const PostImageContainer = styled.div`
  position: relative;
`;

const PostImage = styled(LazyImage)`
  width: ${sizeN(18)};
  height: ${sizeN(18)};
  border-radius: ${sizeN(4)};

  ${tablet} {
    width: ${sizeN(24)};
    height: ${sizeN(16)};
  }
`;

const SourceImage = styled(LazyImage)`
  position: absolute;
  top: 50%;
  left: 0;
  width: ${sizeN(8)};
  height: ${sizeN(8)};
  background: var(--theme-background-primary);
  border-radius: 100%;
  transform: translate(-50%, -50%);

  img {
    width: ${sizeN(6)};
    height: ${sizeN(6)};
    border-radius: 100%;
  }
`;

const PostStats = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  grid-column-gap: ${sizeN(4)};
  margin-top: ${sizeN(3)};

  ${tablet} {
    margin-top: 0;
    margin-left: auto;
  }
`;

const PostStat = styled.div`
  display: flex;
  align-items: center;
  color: var(--theme-label-tertiary);
  font-weight: bold;
  ${typoCallout}

  .icon {
    font-size: ${sizeN(5)};
    margin-right: ${sizeN(1)};
  }
`;

const PostContent = styled(CommentContent)`
  ${tablet} {
    max-width: ${sizeN(70)};
  }
`;

const TwitterForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: ${sizeN(6)};

  button {
    width: ${sizeN(30)};
  }
`;

const FormField = styled(TextField)`
  max-width: ${sizeN(78)};
  align-self: stretch;
  margin-bottom: ${sizeN(4)};
`;

const CompleteProfileButton = styled(Button)`
  margin-top: ${sizeN(4)};
  align-self: flex-start;
`;

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
          href="mailto:hi@daily.dev?subject=Add my articles retroactively"
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
          <TwitterForm ref={formRef} onSubmit={onSubmit}>
            <FormField
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
            />
            <Button
              className="btn-primary"
              type="submit"
              disabled={disableSubmit}
            >
              Save
            </Button>
          </TwitterForm>
        ) : (
          <>
            <CompleteProfileButton
              className="btn-primary"
              onClick={() => setShowAccountDetails(true)}
            >
              Complete your profile
            </CompleteProfileButton>
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
          <PostContainer as="a" aria-label={post.title}>
            <PostImageContainer>
              <PostImage
                imgSrc={smallPostImage(post.image)}
                imgAlt="Post cover image"
              />
              <SourceImage
                imgSrc={post.source.image}
                imgAlt={post.source.name}
                ratio="100%"
              />
            </PostImageContainer>
            <div className={commentInfoClass}>
              <PostContent>{post.title}</PostContent>
              <PostStats>
                {post.views !== null && (
                  <PostStat>
                    <EyeIcon />
                    {largeNumberFormat(post.views)}
                  </PostStat>
                )}
                <PostStat>
                  <UpvoteIcon />
                  {largeNumberFormat(post.numUpvotes)}
                </PostStat>
                <PostStat>
                  <CommentIcon />
                  {largeNumberFormat(post.numComments)}
                </PostStat>
              </PostStats>
            </div>
          </PostContainer>
        </Link>
      )}
    />
  );
}
