import type { Post } from '../graphql/posts';
import { PostType, UserVote } from '../graphql/posts';
import { SourceType } from '../graphql/sources';
import { SYNTAX_LIVE_VIDEO_ID } from './youtubeLive';

/** The daily.dev Show squad source for livestream experiment mocks. */
export const syntaxSquadSource = {
  handle: 'dailydevshow',
  name: 'The daily.dev Show',
  permalink: 'https://app.daily.dev/squads/dailydevshow',
  id: '9836af88-07c6-41e0-a18d-f434aa64895c',
  image:
    'https://media.daily.dev/image/upload/s--4GpvCvpD--/f_auto/v1777382360/squads/9836af88-07c6-41e0-a18d-f434aa64895c',
  type: SourceType.Squad,
  active: true,
  public: true,
  membersCount: 1000,
};

/** YouTube video post pointing at the Syntax.fm test live `videoId` (feed + modal QA). */
export const syntaxLiveMockPost: Post = {
  id: 'syntax-live-mock',
  title: 'The roundup you actually need. S1E1: Goodbye Tim Apple.',
  type: PostType.VideoYouTube,
  videoId: SYNTAX_LIVE_VIDEO_ID,
  createdAt: new Date().toISOString(),
  image:
    'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/youtube-placeholder',
  commentsPermalink: 'https://daily.dev/posts/syntax-live-mock',
  permalink: `https://www.youtube.com/watch?v=${SYNTAX_LIVE_VIDEO_ID}`,
  source: syntaxSquadSource,
  author: {
    id: 'joao-graca',
    name: 'Joao Graca',
    username: 'joaograca',
    permalink: 'https://app.daily.dev/joaograca',
    image: 'https://i.pravatar.cc/64?img=12',
  },
  tags: ['javascript'],
  readTime: 0,
  numComments: 0,
  numUpvotes: 0,
  bookmarked: false,
  read: false,
  upvoted: false,
  commented: false,
  userState: {
    vote: UserVote.None,
    flags: { feedbackDismiss: false },
  },
} as Post;
