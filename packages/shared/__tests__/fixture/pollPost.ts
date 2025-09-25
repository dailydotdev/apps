import type { Post } from '../../src/graphql/posts';
import { PostType, UserVote } from '../../src/graphql/posts';
import { author } from './loggedUser';

export const pollPost: Post = {
  id: 'poll-test-id',
  title: 'What is your favorite programming language?',
  summary: 'A poll about programming languages',
  permalink: 'https://api.daily.dev/r/poll-test-id',
  createdAt: '2024-01-15T10:30:00.000Z',
  source: {
    id: 'dev-poll',
    handle: 'dev-poll',
    name: 'Dev Poll Community',
    permalink: 'permalink/dev-poll',
    image:
      'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/dev-poll',
    type: 'squad',
  },
  readTime: null,
  image:
    'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/poll-image',
  placeholder: 'data:image/jpeg;base64,test-placeholder',
  commentsPermalink: 'https://daily.dev/poll-test-id',
  author,
  tags: ['poll', 'programming'],
  type: PostType.Poll,
  pollOptions: [
    {
      id: 'option-1',
      text: 'JavaScript',
      order: 1,
      numVotes: 45,
    },
    {
      id: 'option-2',
      text: 'Python',
      order: 2,
      numVotes: 32,
    },
    {
      id: 'option-3',
      text: 'TypeScript',
      order: 3,
      numVotes: 28,
    },
    {
      id: 'option-4',
      text: 'Rust',
      order: 4,
      numVotes: 15,
    },
  ],
  endsAt: '2026-01-22T10:30:00.000Z',
  numPollVotes: 120,
  userState: {
    vote: UserVote.Up,
    flags: {
      feedbackDismiss: false,
    },
  },
};

export const pollPostWithUserVote: Post = {
  ...pollPost,
  id: 'poll-with-vote-id',
  userState: {
    ...pollPost.userState,
    pollOption: { id: 'option-1' },
  },
};

export const expiredPollPost: Post = {
  ...pollPost,
  id: 'expired-poll-id',
  endsAt: '2023-01-10T10:30:00.000Z',
};
