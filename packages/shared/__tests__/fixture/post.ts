import type { Post } from '../../src/graphql/posts';
import { PostType } from '../../src/graphql/posts';
import { SourceMemberRole, SourceType } from '../../src/graphql/sources';
import { author } from './loggedUser';

const post: Post = {
  id: 'e3fd75b62cadd02073a31ee3444975cc',
  title: 'The Prosecutor’s Fallacy',
  summary: '',
  permalink: 'https://api.daily.dev/r/e3fd75b62cadd02073a31ee3444975cc',
  createdAt: '2018-06-13T01:20:42.000Z',
  source: {
    id: 'tds',
    handle: 'tds',
    name: 'Towards Data Science',
    permalink: 'permalink/tds',
    image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/tds',
  } as unknown as Post['source'],
  readTime: 8,
  image:
    'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/1f76bef532ec04b262c93b31de84abaa',
  commentsPermalink: 'https://daily.dev',
  author,
  tags: ['webdev', 'javascript'],
  type: PostType.Article,
};

export const sharePost: Post = {
  id: '5nLQHVNHi',
  title: 'Good read about react-query',
  createdAt: '2023-02-09T03:35:33.898Z',
  image: 'https://media.daily.dev/image/upload/f_auto/v1/placeholders/6',
  readTime: null,
  source: {
    id: 'c0457b66-e89b-4fc0-b06d-48f920c7caa2',
    handle: 'avengers',
    name: 'Avengers',
    permalink: 'https://app.daily.dev/squads/avengers',
    description: "Earth's mightiest developers ",
    image:
      'https://media.daily.dev/image/upload/v1675852969/squads/c0457b66-e89b-4fc0-b06d-48f920c7caa2.jpg',
    type: SourceType.Squad,
    active: true,
    public: true,
    membersCount: 1,
    memberPostingRole: SourceMemberRole.Member,
    memberInviteRole: SourceMemberRole.Member,
    moderationRequired: false,
    moderationPostCount: 0,
  },
  sharedPost: {
    id: 'pzSLBZHa1',
    title: 'Type-safe React Query',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/4c37589089ac21e7631b7e9d22cd2c54',
    readTime: 11,
    permalink: 'https://api.daily.dev/r/pzSLBZHa1',
    commentsPermalink: 'https://app.daily.dev/posts/pzSLBZHa1',
    summary:
      'The level of type-safety can drastically vary from project to project. Every valid JavaScript code can be valid TypeScript code - depending on the TS settings. To truly leverage the power of TypeScript, there is one thing that you need above all: Trust our type definitions.',
    createdAt: '2023-01-07T19:26:43.146Z',
    private: false,
    scout: null,
    author: {
      id: 'oHt34Q_Zn',
      name: 'TkDodo',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1656338366/logos/tkdodo',
      permalink: 'https://app.daily.dev/tkdodo',
      username: 'tkdodo',
    },
    type: PostType.Article,
    tags: ['backend', 'typescript', 'react-query'],
    source: {
      id: 'tkdodo',
      handle: 'tkdodo',
      name: 'TkDodo',
      permalink: 'https://app.daily.dev/sources/tkdodo',
      description: null,
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1656338366/logos/tkdodo',
      type: SourceType.Machine,
      public: true,
    },
  },
  permalink: 'https://api.daily.dev/r/5nLQHVNHi',
  numComments: 0,
  numUpvotes: 1,
  commentsPermalink: 'https://app.daily.dev/posts/5nLQHVNHi',
  scout: null,
  author: {
    id: 'ab02e61b958d49d88c8420b431a4d91c',
    name: 'Lee Hansel Solevilla Jr',
    image:
      'https://media.daily.dev/image/upload/f_auto/v1664618465/avatars/ab02e61b958d49d88c8420b431a4d91c',
    permalink: 'https://app.daily.dev/sshanzel',
    username: 'sshanzel',
    bio: 'Software Engineer @daily.dev 👨‍💻  yes! here! 🥳',
  },
  trending: null,
  tags: [],
  type: PostType.Share,
  private: true,
  read: true,
  upvoted: false,
  commented: false,
  bookmarked: false,
};

export default post;
