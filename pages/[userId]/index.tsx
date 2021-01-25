import React, {
  FormEvent,
  ReactElement,
  ReactNode,
  useContext,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { useInfiniteQuery, useQuery } from 'react-query';
import {
  getLayout as getProfileLayout,
  getStaticProps as getProfileStaticProps,
  getStaticPaths as getProfileStaticPaths,
  ProfileLayoutProps,
} from '../../components/layouts/ProfileLayout';
import { USER_COMMENTS_QUERY, UserCommentsData } from '../../graphql/comments';
import styled from '@emotion/styled';
import {
  size1,
  size2,
  size3,
  size4,
  size5,
  size6,
  size8,
  sizeN,
} from '../../styles/sizes';
import UpvoteIcon from '../../icons/upvote.svg';
import CommentIcon from '../../icons/comment.svg';
import EyeIcon from '../../icons/eye.svg';
import { typoBody, typoCallout, typoSubhead } from '../../styles/typography';
import { format } from 'date-fns';
import request from 'graphql-request';
import { apiUrl } from '../../lib/config';
import { USER_STATS_QUERY, UserStatsData } from '../../graphql/users';
import { multilineTextOverflow } from '../../styles/helpers';
import ActivitySection, {
  ActivityContainer,
  ActivitySectionTitle,
} from '../../components/profile/ActivitySection';
import { AUTHOR_FEED_QUERY, FeedData } from '../../graphql/posts';
import LazyImage from '../../components/LazyImage';
import { largeNumberFormat } from '../../lib/numberFormat';
import AuthContext from '../../components/AuthContext';
import { tablet } from '../../styles/media';
import {
  loggedUserToProfile,
  updateProfile,
  UserProfile,
} from '../../lib/user';
import { formToJson } from '../../lib/form';
import TextField from '../../components/TextField';
import { useHideOnModal } from '../../lib/useHideOnModal';
import { ownershipGuide } from '../../lib/constants';
import dynamicPageLoad from '../../lib/dynamicPageLoad';
import { smallPostImage } from '../../lib/image';
import PrimaryButton from '../../components/buttons/PrimaryButton';

const AccountDetailsModal = dynamicPageLoad(
  () =>
    import(
      /* webpackChunkName: "accountDetailsModal"*/ '../../components/modals/AccountDetailsModal'
    ),
);

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0;
`;

const CommentContainer = styled.article`
  display: flex;
  flex-direction: row;
  padding: ${size3} 0;
  align-items: flex-start;

  ${tablet} {
    align-items: center;
  }
`;

const CommentUpvotes = styled.div`
  display: flex;
  width: ${sizeN(12)};
  flex-direction: column;
  align-items: center;
  padding: ${size2} 0;
  background: var(--theme-background-secondary);
  border-radius: ${size3};
  font-weight: bold;
  ${typoCallout}

  .icon {
    font-size: ${size6};
    margin-bottom: ${size1};
  }

  ${tablet} {
    width: ${sizeN(20)};
    justify-content: center;
    flex-direction: row;

    .icon {
      margin-bottom: 0;
      margin-right: ${size1};
    }
  }
`;

const CommentInfo = styled.a`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: ${size4};
  text-decoration: none;

  ${tablet} {
    flex-direction: row;
    align-items: center;
  }
`;

const CommentContent = styled.p`
  max-height: ${sizeN(15)};
  padding: 0;
  margin: 0;
  color: var(--theme-label-primary);
  word-break: break-word;
  white-space: pre-wrap;
  ${typoCallout}
  ${multilineTextOverflow}
  -webkit-line-clamp: 3;

  ${tablet} {
    flex: 1;
    margin-right: ${size6};
    max-width: ${sizeN(77)};
  }
`;

const CommentTime = styled.time`
  margin-top: ${size2};
  color: var(--theme-label-tertiary);
  ${typoSubhead}

  ${tablet} {
    margin-top: 0;
  }
`;

const EmptyMessage = styled.span`
  color: var(--theme-label-tertiary);
  ${typoCallout}

  a {
    color: var(--theme-label-link);
    text-decoration: none;
  }
`;

const PostContainer = styled(CommentContainer)`
  padding-left: ${size3};
  text-decoration: none;
`;

const PostImageContainer = styled.div`
  position: relative;
`;

const PostImage = styled(LazyImage)`
  width: ${sizeN(18)};
  height: ${sizeN(18)};
  border-radius: ${size4};

  ${tablet} {
    width: ${sizeN(24)};
    height: ${sizeN(16)};
  }
`;

const SourceImage = styled(LazyImage)`
  position: absolute;
  top: 50%;
  left: 0;
  width: ${size8};
  height: ${size8};
  background: var(--theme-background-primary);
  border-radius: 100%;
  transform: translate(-50%, -50%);

  img {
    width: ${size6};
    height: ${size6};
    border-radius: 100%;
  }
`;

const PostStats = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  grid-column-gap: ${size4};
  margin-top: ${size3};

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
    font-size: ${size5};
    margin-right: ${size1};
  }
`;

const PostContent = styled(CommentContent)`
  ${tablet} {
    max-width: ${sizeN(70)};
  }
`;

const OverallStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, ${sizeN(36)});
  grid-column-gap: ${size6};
`;

const OverallStatContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${size3};
  background: var(--theme-background-secondary);
  border-radius: ${size3};
`;

const OverallStatData = styled.div`
  color: var(--theme-label-primary);
  font-weight: bold;
  ${typoBody}
`;

const OverallStatDescription = styled.div`
  color: var(--theme-label-tertiary);
  ${typoSubhead}
`;

const TwitterForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: ${size6};

  button {
    width: ${sizeN(30)};
  }
`;

const FormField = styled(TextField)`
  max-width: ${sizeN(78)};
  align-self: stretch;
  margin-bottom: ${size4};
`;

const CompleteProfileButton = styled(PrimaryButton)`
  margin-top: ${size4};
  align-self: flex-start;
`;

const ProfilePage = ({ profile }: ProfileLayoutProps): ReactElement => {
  const { user, updateUser, tokenRefreshed } = useContext(AuthContext);

  const { data: userStats } = useQuery<UserStatsData>(
    ['user_stats', profile?.id],
    () =>
      request(`${apiUrl}/graphql`, USER_STATS_QUERY, {
        id: profile?.id,
      }),
    {
      enabled: !!profile && tokenRefreshed,
    },
  );

  const comments = useInfiniteQuery<UserCommentsData>(
    ['user_comments', profile?.id],
    ({ pageParam }) =>
      request(`${apiUrl}/graphql`, USER_COMMENTS_QUERY, {
        userId: profile?.id,
        first: 3,
        after: pageParam,
      }),
    {
      enabled: !!profile && tokenRefreshed,
      getNextPageParam: (lastPage) =>
        lastPage.page.pageInfo.hasNextPage && lastPage.page.pageInfo.endCursor,
    },
  );

  const posts = useInfiniteQuery<FeedData>(
    ['user_posts', profile?.id],
    ({ pageParam }) =>
      request(`${apiUrl}/graphql`, AUTHOR_FEED_QUERY, {
        userId: profile?.id,
        first: 3,
        after: pageParam,
      }),
    {
      enabled: !!profile && tokenRefreshed,
      getNextPageParam: (lastPage) =>
        lastPage.page.pageInfo.hasNextPage && lastPage.page.pageInfo.endCursor,
    },
  );

  const formRef = useRef<HTMLFormElement>(null);
  const [disableSubmit, setDisableSubmit] = useState<boolean>(true);
  const [twitterHint, setTwitterHint] = useState<string>();
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  useHideOnModal(() => !!showAccountDetails, [showAccountDetails]);

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

  const isSameUser = profile?.id === user?.id;

  const commentsSection = (
    <ActivitySection
      title={`${isSameUser ? 'Your ' : ''}Comments`}
      query={comments}
      count={userStats?.userStats?.numComments}
      emptyScreen={
        <EmptyMessage data-testid="emptyComments">
          {isSameUser ? `You didn't comment yet.` : 'No comments yet.'}
        </EmptyMessage>
      }
      elementToNode={(comment) => (
        <CommentContainer key={comment.id}>
          <CommentUpvotes>
            <UpvoteIcon />
            {largeNumberFormat(comment.numUpvotes)}
          </CommentUpvotes>
          <Link href={comment.permalink} passHref prefetch={false}>
            <CommentInfo aria-label={comment.content}>
              <CommentContent>{comment.content}</CommentContent>
              <CommentTime dateTime={comment.createdAt}>
                {format(new Date(comment.createdAt), 'MMM d, y')}
              </CommentTime>
            </CommentInfo>
          </Link>
        </CommentContainer>
      )}
    />
  );

  let postsEmptyScreen: ReactNode = null;
  if (!isSameUser) {
    postsEmptyScreen = (
      <EmptyMessage data-testid="emptyPosts">No articles yet.</EmptyMessage>
    );
  } else if (user.twitter) {
    postsEmptyScreen = (
      <EmptyMessage data-testid="emptyPosts" as="p">
        No articles yet.
        <br />
        <br />
        <a href={ownershipGuide} target="_blank" rel="noopener">
          How daily.dev picks up new articles
        </a>
        <br />
        <br />
        Do you have articles you wrote that got picked up by daily.dev in the
        past?
        <br />
        <br />
        <a
          href="mailto:hi@daily.dev?subject=Add my articles retroactively"
          target="_blank"
          rel="noopener"
        >
          Add my articles retroactively
        </a>
      </EmptyMessage>
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
            <PrimaryButton type="submit" disabled={disableSubmit}>
              Save
            </PrimaryButton>
          </TwitterForm>
        ) : (
          <>
            <CompleteProfileButton onClick={() => setShowAccountDetails(true)}>
              Complete your profile
            </CompleteProfileButton>
            <AccountDetailsModal
              isOpen={showAccountDetails}
              onRequestClose={() => setShowAccountDetails(false)}
            />
          </>
        )}
      </>
    );
  }

  const postsSection = (
    <ActivitySection
      title={`${isSameUser ? 'Your ' : ''}Articles`}
      query={posts}
      count={userStats?.userStats?.numPosts}
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
            <CommentInfo as="div">
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
            </CommentInfo>
          </PostContainer>
        </Link>
      )}
    />
  );

  return (
    <Container>
      {userStats?.userStats && (
        <>
          {userStats.userStats?.numPostViews !== null && (
            <ActivityContainer>
              <ActivitySectionTitle>Stats</ActivitySectionTitle>
              <OverallStats>
                <OverallStatContainer>
                  <OverallStatData>
                    {userStats.userStats.numPostViews.toLocaleString()}
                  </OverallStatData>
                  <OverallStatDescription>Article views</OverallStatDescription>
                </OverallStatContainer>
                <OverallStatContainer>
                  <OverallStatData>
                    {(
                      userStats.userStats.numPostUpvotes +
                      userStats.userStats.numCommentUpvotes
                    ).toLocaleString()}
                  </OverallStatData>
                  <OverallStatDescription>
                    Upvotes earned
                  </OverallStatDescription>
                </OverallStatContainer>
              </OverallStats>
            </ActivityContainer>
          )}
          {postsSection}
          {commentsSection}
        </>
      )}
    </Container>
  );
};

ProfilePage.getLayout = getProfileLayout;

export default ProfilePage;
