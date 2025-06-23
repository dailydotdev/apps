import { startOfDay } from 'date-fns';
import type { differenceInDays } from 'date-fns';
import type { Post } from '../../graphql/posts';

export const getAbsoluteDifferenceInDays: typeof differenceInDays = (
  date1,
  date2,
) => {
  const day1 = startOfDay(date1);
  const day2 = startOfDay(date2);

  const timeDiff = Math.abs(day1.getTime() - day2.getTime());
  const diffInDays = timeDiff / (1000 * 60 * 60 * 24);

  // Round down to the nearest whole number since we want full days
  return Math.floor(diffInDays);
};

// TODO: delete once integration comes in
export const dummyAdBoostedPost = {
  id: '6jpiRprsv',
  title: "DevSecOps Isn't Optional Anymore",
  image:
    'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/7a96d7c6f453a82cddae62402ceb7a9b',
  readTime: 4,
  permalink: 'https://api.local.fylla.dev/r/6jpiRprsv',
  commentsPermalink:
    'https://app.local.fylla.dev:5002/posts/devsecops-isn-t-optional-anymore-6jpirprsv',
  createdAt: '2021-06-15T00:18:04.000Z',
  commented: false,
  bookmarked: false,
  views: null,
  numUpvotes: 0,
  numComments: 0,
  numAwards: 0,
  summary: null,
  bookmark: null,
  author: null,
  type: 'article',
  tags: ['security', 'testing', 'devops'],
  source: {
    id: 'cshub',
    handle: 'cshub',
    name: 'Cyber Security Hub',
    permalink: 'https://app.local.fylla.dev:5002/sources/cshub',
    image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/cshub',
    type: 'machine',
    membersCount: 0,
    description: null,
    flags: {
      totalUpvotes: 0,
    },
    currentMember: null,
  },
  userState: {
    vote: 0,
    flags: {
      feedbackDismiss: null,
    },
    awarded: false,
  },
  slug: 'devsecops-isn-t-optional-anymore-6jpirprsv',
  clickbaitTitleDetected: false,
  language: 'en',
  translation: {
    title: null,
    titleHtml: null,
    smartTitle: null,
    summary: null,
  },
  sharedPost: null,
  trending: null,
  feedMeta: null,
  collectionSources: [],
  numCollectionSources: 0,
  updatedAt: '2022-04-18T13:56:02.186Z',
  contentHtml: null,
  read: false,
  upvoted: false,
  downvoted: false,
} as unknown as Post;
