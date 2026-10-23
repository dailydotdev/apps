import { gql } from 'graphql-request';
import { gqlClient } from '../../graphql/common';
import type { Connection } from '../../graphql/common';
import { gqlBatchRequest } from '../../graphql/batch';
import { withLapsedLfgStatus } from './lib/status';
import type { DirectMessageConversation } from '../messages/graphql';
import type {
  LfgBoardFacets,
  LfgBoardFilters,
  LfgHelper,
  LfgKind,
  LfgPerson,
  LfgPost,
  LfgPostInput,
  LfgReachOut,
  LfgReachOutInput,
} from './types';

export const LFG_BOARD_PAGE_SIZE = 20;
// A post pauses at ten waiting reach-outs and a person has one post open at a
// time, so one page covers the inbox.
export const LFG_INBOX_PAGE_SIZE = 50;

const LFG_PERSON_FRAGMENT = gql`
  fragment LfgPerson on User {
    id
    name
    username
    image
    permalink
    reputation
    bio
    title
    createdAt
    companies {
      name
      image
    }
    verifiedGithub
    experienceYears
    lfgKind
  }
`;

const LFG_POST_FRAGMENT = gql`
  fragment LfgPostFragment on LfgPost {
    id
    kind
    commitment
    showCountry
    country
    utcOffset
    title
    body
    tags
    asks {
      id
      label
      type
    }
    status
    isPaused
    pendingCount
    acceptedCount
    createdAt
    updatedAt
    expiresAt
    author {
      ...LfgPerson
    }
    myReachOut {
      id
      status
      createdAt
    }
  }
  ${LFG_PERSON_FRAGMENT}
`;

const LFG_REACH_OUT_FRAGMENT = gql`
  fragment LfgReachOutFragment on LfgReachOut {
    id
    utcOffset
    pitch
    status
    filtered
    createdAt
    answers {
      askId
      value
      verified
    }
    post {
      id
      title
      kind
      asks {
        id
        label
        type
      }
    }
    sender {
      ...LfgPerson
    }
  }
  ${LFG_PERSON_FRAGMENT}
`;

const LFG_HELPER_FRAGMENT = gql`
  fragment LfgHelperFragment on LfgHelper {
    tags
    perMonth
    timezones
    minReputation
  }
`;

const LFG_BOARD_QUERY = gql`
  query LfgBoard(
    $kind: LfgKind
    $tags: [String!]
    $timezones: [Float!]
    $minReputation: Int
    $first: Int
    $after: String
  ) {
    lfgBoard(
      kind: $kind
      tags: $tags
      timezones: $timezones
      minReputation: $minReputation
      first: $first
      after: $after
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...LfgPostFragment
        }
      }
    }
  }
  ${LFG_POST_FRAGMENT}
`;

const LFG_BOARD_FACETS_QUERY = gql`
  query LfgBoardFacets($kind: LfgKind) {
    lfgBoardFacets(kind: $kind) {
      timezones
      tags
    }
  }
`;

const LFG_POST_QUERY = gql`
  query LfgPost($id: ID!) {
    lfgPost(id: $id) {
      ...LfgPostFragment
      hasReachOuts
    }
  }
  ${LFG_POST_FRAGMENT}
`;

const LFG_REACH_OUT_WAITING_COUNT_QUERY = gql`
  query LfgReachOutWaitingCount {
    lfgReachOutWaitingCount
  }
`;

const MY_LFG_POSTS_QUERY = gql`
  query MyLfgPosts($first: Int) {
    myLfgPosts(first: $first) {
      edges {
        node {
          id
          title
          status
          expiresAt
        }
      }
    }
  }
`;

export type LfgPastPost = Pick<
  LfgPost,
  'id' | 'title' | 'status' | 'expiresAt'
>;

const MY_LFG_POST_QUERY = gql`
  query MyLfgPost {
    myLfgPost {
      ...LfgPostFragment
    }
  }
  ${LFG_POST_FRAGMENT}
`;

// The badge only knows the kind; the strip under a hover card and the
// profile section need the post itself.
const USER_LFG_POST_QUERY = gql`
  query UserLfgPost($userId: ID!) {
    userLfgPost(userId: $userId) {
      ...LfgPostFragment
    }
  }
  ${LFG_POST_FRAGMENT}
`;

const LFG_PERSON_QUERY = gql`
  query LfgPerson($id: ID!) {
    user(id: $id) {
      ...LfgPerson
    }
  }
  ${LFG_PERSON_FRAGMENT}
`;

// Respects the person's opt-out: no streak comes back for them.
const LFG_STREAK_QUERY = gql`
  query LfgStreak($id: ID!) {
    userStreakProfile(id: $id) {
      current
    }
  }
`;

const LFG_ACCEPTED_REACH_OUTS_QUERY = gql`
  query LfgAcceptedReachOuts($id: ID!) {
    lfgPost(id: $id) {
      id
      acceptedReachOuts {
        id
        sender {
          id
          name
          username
          image
          permalink
        }
      }
    }
  }
`;

const CREATE_LFG_POST_MUTATION = gql`
  mutation CreateLfgPost($input: LfgPostInput!, $pledge: Boolean) {
    createLfgPost(input: $input, pledge: $pledge) {
      ...LfgPostFragment
    }
  }
  ${LFG_POST_FRAGMENT}
`;

const EDIT_LFG_POST_MUTATION = gql`
  mutation EditLfgPost($id: ID!, $input: LfgPostInput!) {
    editLfgPost(id: $id, input: $input) {
      ...LfgPostFragment
    }
  }
  ${LFG_POST_FRAGMENT}
`;

const DELETE_LFG_POST_MUTATION = gql`
  mutation DeleteLfgPost($id: ID!) {
    deleteLfgPost(id: $id) {
      _
    }
  }
`;

const RENEW_LFG_POST_MUTATION = gql`
  mutation RenewLfgPost($id: ID!) {
    renewLfgPost(id: $id) {
      ...LfgPostFragment
    }
  }
  ${LFG_POST_FRAGMENT}
`;

const MARK_LFG_POST_FOUND_MUTATION = gql`
  mutation MarkLfgPostFound($id: ID!, $reachOutId: ID) {
    markLfgPostFound(id: $id, reachOutId: $reachOutId) {
      ...LfgPostFragment
    }
  }
  ${LFG_POST_FRAGMENT}
`;

const LFG_REACH_OUTS_LEFT_QUERY = gql`
  query LfgReachOutsLeft {
    lfgReachOutsLeft
  }
`;

const LFG_REACH_OUT_INBOX_QUERY = gql`
  query LfgReachOutInbox($filtered: Boolean, $first: Int) {
    lfgReachOutInbox(filtered: $filtered, first: $first) {
      edges {
        node {
          ...LfgReachOutFragment
        }
      }
    }
  }
  ${LFG_REACH_OUT_FRAGMENT}
`;

const LFG_REACH_OUT_QUERY = gql`
  query LfgReachOut($id: ID!) {
    lfgReachOut(id: $id) {
      ...LfgReachOutFragment
    }
  }
  ${LFG_REACH_OUT_FRAGMENT}
`;

const SEND_LFG_REACH_OUT_MUTATION = gql`
  mutation SendLfgReachOut(
    $postId: ID!
    $pitch: String!
    $answers: [LfgReachOutAnswerInput!]!
  ) {
    sendLfgReachOut(postId: $postId, pitch: $pitch, answers: $answers) {
      id
      status
      createdAt
    }
  }
`;

const ACCEPT_LFG_REACH_OUT_MUTATION = gql`
  mutation AcceptLfgReachOut($id: ID!) {
    acceptLfgReachOut(id: $id) {
      id
      peer {
        id
      }
    }
  }
`;

const DECLINE_LFG_REACH_OUT_MUTATION = gql`
  mutation DeclineLfgReachOut($id: ID!) {
    declineLfgReachOut(id: $id) {
      _
    }
  }
`;

const RESTORE_LFG_REACH_OUT_MUTATION = gql`
  mutation RestoreLfgReachOut($id: ID!) {
    restoreLfgReachOut(id: $id) {
      _
    }
  }
`;

const REPORT_LFG_REACH_OUT_MUTATION = gql`
  mutation ReportLfgReachOut(
    $id: ID!
    $reason: ReportReason!
    $comment: String
  ) {
    reportLfgReachOut(id: $id, reason: $reason, comment: $comment) {
      _
    }
  }
`;

const REPORT_LFG_POST_MUTATION = gql`
  mutation ReportLfgPost($id: ID!, $reason: ReportReason!, $comment: String) {
    reportLfgPost(id: $id, reason: $reason, comment: $comment) {
      _
    }
  }
`;

const LFG_HELPER_QUERY = gql`
  query LfgHelper {
    lfgHelper {
      ...LfgHelperFragment
    }
  }
  ${LFG_HELPER_FRAGMENT}
`;

const SET_LFG_HELPER_MUTATION = gql`
  mutation SetLfgHelper($input: LfgHelperInput!) {
    setLfgHelper(input: $input) {
      ...LfgHelperFragment
    }
  }
  ${LFG_HELPER_FRAGMENT}
`;

const DELETE_LFG_HELPER_MUTATION = gql`
  mutation DeleteLfgHelper {
    deleteLfgHelper {
      _
    }
  }
`;

const LFG_CONVERSATION_QUERY = gql`
  query LfgConversation($userId: ID!) {
    directMessageConversation(userId: $userId) {
      id
      lfgPost {
        id
        title
        author {
          id
        }
      }
      lfgReachOuts {
        id
        pitch
        createdAt
        sender {
          id
        }
      }
    }
  }
`;

export type LfgConversationPost = Pick<LfgPost, 'id' | 'title'> & {
  author: Pick<LfgPost['author'], 'id'>;
};

export type LfgConversationReachOut = Pick<
  LfgReachOut,
  'id' | 'pitch' | 'createdAt'
> & {
  sender: Pick<LfgReachOut['sender'], 'id'>;
};

export type LfgConversation = {
  post: LfgConversationPost | null;
  reachOuts: LfgConversationReachOut[];
};

export type LfgAcceptedReachOut = Pick<LfgReachOut, 'id'> & {
  sender: Pick<
    LfgReachOut['sender'],
    'id' | 'name' | 'username' | 'image' | 'permalink'
  >;
};

// The list the reader asked for paints the page, so it never waits on a
// batch.
export const getLfgBoard = async ({
  filters,
  after,
}: {
  filters: LfgBoardFilters;
  after?: string;
}): Promise<Connection<LfgPost>> => {
  const res = await gqlClient.request<{ lfgBoard: Connection<LfgPost> }>(
    LFG_BOARD_QUERY,
    {
      kind: filters.kind,
      tags: filters.tags.length ? filters.tags : undefined,
      timezones: filters.timezones.length ? filters.timezones : undefined,
      minReputation: filters.minReputation || undefined,
      first: LFG_BOARD_PAGE_SIZE,
      after,
    },
  );

  return res.lfgBoard;
};

export const getLfgBoardFacets = async (
  kind?: LfgKind,
): Promise<LfgBoardFacets> => {
  const res = await gqlBatchRequest<{ lfgBoardFacets: LfgBoardFacets }>(
    LFG_BOARD_FACETS_QUERY,
    { kind },
  );

  return res.lfgBoardFacets;
};

export const getLfgPost = async (id: string): Promise<LfgPost | null> => {
  const res = await gqlClient.request<{ lfgPost: LfgPost | null }>(
    LFG_POST_QUERY,
    { id },
  );

  return res.lfgPost && withLapsedLfgStatus(res.lfgPost);
};

// The shell state query seeds it; this is the fallback.
export const getLfgReachOutWaitingCount = async (): Promise<number> => {
  const res = await gqlBatchRequest<{ lfgReachOutWaitingCount: number }>(
    LFG_REACH_OUT_WAITING_COUNT_QUERY,
  );

  return res.lfgReachOutWaitingCount;
};

export const getMyLfgPosts = async (first: number): Promise<LfgPastPost[]> => {
  const res = await gqlBatchRequest<{ myLfgPosts: Connection<LfgPastPost> }>(
    MY_LFG_POSTS_QUERY,
    { first },
  );

  return res.myLfgPosts.edges.map(({ node }) => withLapsedLfgStatus(node));
};

export const getMyLfgPost = async (): Promise<LfgPost | null> => {
  const res = await gqlBatchRequest<{ myLfgPost: LfgPost | null }>(
    MY_LFG_POST_QUERY,
  );

  return res.myLfgPost;
};

export const getUserLfgPost = async (
  userId: string,
): Promise<LfgPost | null> => {
  const res = await gqlBatchRequest<{ userLfgPost: LfgPost | null }>(
    USER_LFG_POST_QUERY,
    { userId },
  );

  return res.userLfgPost;
};

export const getLfgPerson = async (id: string): Promise<LfgPerson | null> => {
  const res = await gqlBatchRequest<{ user: LfgPerson | null }>(
    LFG_PERSON_QUERY,
    { id },
  );

  return res.user;
};

export const getLfgStreak = async (id: string): Promise<number | null> => {
  const res = await gqlBatchRequest<{
    userStreakProfile: { current: number | null } | null;
  }>(LFG_STREAK_QUERY, { id });

  return res.userStreakProfile?.current ?? null;
};

export const getLfgAcceptedReachOuts = async (
  id: string,
): Promise<LfgAcceptedReachOut[]> => {
  const res = await gqlBatchRequest<{
    lfgPost: { acceptedReachOuts: LfgAcceptedReachOut[] | null } | null;
  }>(LFG_ACCEPTED_REACH_OUTS_QUERY, { id });

  return res.lfgPost?.acceptedReachOuts ?? [];
};

export const createLfgPost = async ({
  input,
  pledge,
}: {
  input: LfgPostInput;
  pledge?: boolean;
}): Promise<LfgPost> => {
  const res = await gqlClient.request<{ createLfgPost: LfgPost }>(
    CREATE_LFG_POST_MUTATION,
    { input, pledge },
  );

  return res.createLfgPost;
};

export const editLfgPost = async ({
  id,
  input,
}: {
  id: string;
  input: LfgPostInput;
}): Promise<LfgPost> => {
  const res = await gqlClient.request<{ editLfgPost: LfgPost }>(
    EDIT_LFG_POST_MUTATION,
    { id, input },
  );

  return res.editLfgPost;
};

export const deleteLfgPost = async (id: string): Promise<void> => {
  await gqlClient.request(DELETE_LFG_POST_MUTATION, { id });
};

export const renewLfgPost = async (id: string): Promise<LfgPost> => {
  const res = await gqlClient.request<{ renewLfgPost: LfgPost }>(
    RENEW_LFG_POST_MUTATION,
    { id },
  );

  return res.renewLfgPost;
};

export const markLfgPostFound = async ({
  id,
  reachOutId,
}: {
  id: string;
  reachOutId?: string;
}): Promise<LfgPost> => {
  const res = await gqlClient.request<{ markLfgPostFound: LfgPost }>(
    MARK_LFG_POST_FOUND_MUTATION,
    { id, reachOutId },
  );

  return res.markLfgPostFound;
};

export const getLfgReachOutsLeft = async (): Promise<number> => {
  const res = await gqlBatchRequest<{ lfgReachOutsLeft: number }>(
    LFG_REACH_OUTS_LEFT_QUERY,
  );

  return res.lfgReachOutsLeft;
};

export const getLfgReachOutInbox = async (
  filtered: boolean,
): Promise<LfgReachOut[]> => {
  const res = await gqlBatchRequest<{
    lfgReachOutInbox: Connection<LfgReachOut>;
  }>(LFG_REACH_OUT_INBOX_QUERY, { filtered, first: LFG_INBOX_PAGE_SIZE });

  return res.lfgReachOutInbox.edges.map(({ node }) => node);
};

export const getLfgReachOut = async (
  id: string,
): Promise<LfgReachOut | null> => {
  const res = await gqlClient.request<{ lfgReachOut: LfgReachOut | null }>(
    LFG_REACH_OUT_QUERY,
    { id },
  );

  return res.lfgReachOut;
};

export const sendLfgReachOut = async (
  input: LfgReachOutInput,
): Promise<LfgPost['myReachOut']> => {
  const res = await gqlClient.request<{
    sendLfgReachOut: LfgPost['myReachOut'];
  }>(SEND_LFG_REACH_OUT_MUTATION, input);

  return res.sendLfgReachOut;
};

export const acceptLfgReachOut = async (
  id: string,
): Promise<Pick<DirectMessageConversation, 'id' | 'peer'>> => {
  const res = await gqlClient.request<{
    acceptLfgReachOut: Pick<DirectMessageConversation, 'id' | 'peer'>;
  }>(ACCEPT_LFG_REACH_OUT_MUTATION, { id });

  return res.acceptLfgReachOut;
};

export const declineLfgReachOut = async (id: string): Promise<void> => {
  await gqlClient.request(DECLINE_LFG_REACH_OUT_MUTATION, { id });
};

export const restoreLfgReachOut = async (id: string): Promise<void> => {
  await gqlClient.request(RESTORE_LFG_REACH_OUT_MUTATION, { id });
};

export const reportLfgReachOut = async ({
  id,
  reason,
  comment,
}: {
  id: string;
  reason: string;
  comment?: string;
}): Promise<void> => {
  await gqlClient.request(REPORT_LFG_REACH_OUT_MUTATION, {
    id,
    reason,
    comment,
  });
};

export const reportLfgPost = async ({
  id,
  reason,
  comment,
}: {
  id: string;
  reason: string;
  comment?: string;
}): Promise<void> => {
  await gqlClient.request(REPORT_LFG_POST_MUTATION, { id, reason, comment });
};

export const getLfgHelper = async (): Promise<LfgHelper | null> => {
  const res = await gqlBatchRequest<{ lfgHelper: LfgHelper | null }>(
    LFG_HELPER_QUERY,
  );

  return res.lfgHelper;
};

export const setLfgHelper = async (input: LfgHelper): Promise<LfgHelper> => {
  const res = await gqlClient.request<{ setLfgHelper: LfgHelper }>(
    SET_LFG_HELPER_MUTATION,
    { input },
  );

  return res.setLfgHelper;
};

export const deleteLfgHelper = async (): Promise<void> => {
  await gqlClient.request(DELETE_LFG_HELPER_MUTATION);
};

export const getLfgConversation = async (
  userId: string,
): Promise<LfgConversation> => {
  const res = await gqlBatchRequest<{
    directMessageConversation: {
      lfgPost: LfgConversationPost | null;
      lfgReachOuts: LfgConversationReachOut[];
    } | null;
  }>(LFG_CONVERSATION_QUERY, { userId });

  return {
    post: res.directMessageConversation?.lfgPost ?? null,
    reachOuts: res.directMessageConversation?.lfgReachOuts ?? [],
  };
};
