import type { Post } from '../../graphql/posts';
import type { ArticleChatter } from './types';
import { ChatterPlatform } from './types';

// POC: hard-coded chatter so the feature can be demoed end-to-end without a
// backend. Replace `getMockChatter` with a real query keyed off the post's
// permalink / yggdrasilId when the data source is ready.
export const getMockChatter = (post: Post): ArticleChatter => ({
  pulse: {
    verdict:
      'The room is split — impressive results, nobody’s sold on the reason.',
    stance: 'divided',
    controversyLevel: 'heated',
    totalVoices: 1240,
    momentum: 'rising',
    overallSplit: { agree: 44, mixed: 18, disagree: 38 },
    perPlatform: [
      {
        platform: ChatterPlatform.X,
        read: 'Polarized & loud',
        split: { agree: 52, mixed: 8, disagree: 40 },
      },
      {
        platform: ChatterPlatform.HackerNews,
        read: 'Skeptical',
        split: { agree: 34, mixed: 26, disagree: 40 },
      },
    ],
    consensus: [
      'The p99 latency win (340ms → 12ms) is real and impressive.',
      'The biggest gain came from consolidating 12 services down to 4.',
    ],
    contention: [
      'Language vs. architecture',
      'Hiring & retention',
      'Was the timeline worth it?',
      'ROI not shown',
    ],
    bottomLine:
      'Read it for the consolidation strategy, not as a language endorsement — the performance win is credible, but the ROI and hiring case is left unmade.',
    counterpoint: {
      text: 'You had a people problem, not a language problem — the same team would have hit these numbers just cleaning up the original codebase.',
      attribution: 'the most-upvoted take on both X and Hacker News',
    },
  },
  sources: [
    {
      platform: ChatterPlatform.X,
      heading: 'X · 3 posts trending',
      subtitle: 'from devs you follow & large accounts',
      stats: [
        { label: 'reposts', value: '2.4K' },
        { label: 'likes', value: '18K' },
      ],
      mood: 'X is on fire.',
      moodTone: 'hot',
      summary:
        'Big accounts are dunking on the piece as premature optimization, while the people who actually shipped it are defending the numbers. The most-quoted take: “you had a people problem, not a language problem.”',
      sourceUrl: post.permalink ?? 'https://x.com',
      sourceLabel: 'Open thread on X',
      defaultOpen: true,
      comments: [
        {
          id: 'x1',
          author: 'Theo',
          handle: '@t3dotgg',
          avatar: 'linear-gradient(135deg,#1d9bf0,#0f6fb8)',
          timeAgo: '6h',
          text: 'rewriting to fix a p99 you caused with bad queries is such a 2026 move. the benchmarks are real but so is the 8-month timeline nobody is tweeting about 👀',
          upvotes: 4100,
          replies: 312,
        },
        {
          id: 'x2',
          author: 'Dax',
          handle: '@thdxr',
          avatar: 'linear-gradient(135deg,#f2542d,#b8341a)',
          timeAgo: '4h',
          text: 'the actual win here is they deleted 40% of the codebase during the rewrite. that is the story. the tech is downstream of finally being allowed to refactor.',
          upvotes: 2800,
          replies: 96,
        },
        {
          id: 'x3',
          author: 'Jane M.',
          handle: '@janedev',
          avatar: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
          timeAgo: '2h',
          text: 'p99 340ms → 12ms is not “premature optimization” when you pay per request at this scale. do the napkin math before the dunk.',
          upvotes: 1900,
          replies: 141,
        },
      ],
    },
    {
      platform: ChatterPlatform.HackerNews,
      heading: 'Hacker News · front page',
      subtitle: 'exact URL match · 3 hrs ago',
      stats: [
        { label: 'points', value: '842' },
        { label: 'comments', value: '396' },
      ],
      mood: 'HN is skeptical of the numbers.',
      moodTone: 'split',
      summary:
        'The top thread argues the gains came from the architecture cleanup, not the tool itself — and that most stacks would land similar numbers after a second attempt. A counter-thread defends the compile-time guarantees for the on-call burden.',
      sourceUrl: 'https://news.ycombinator.com',
      sourceLabel: 'Open discussion on Hacker News',
      defaultOpen: true,
      comments: [
        {
          id: 'hn1',
          author: 'tptacek',
          avatar: '#ff6600',
          timeAgo: '2h ago',
          text: 'The interesting number isn’t the p99, it’s that they went from 12 services to 4. You can get most of this in any stack once you’re allowed to consolidate.',
          upvotes: 284,
        },
        {
          id: 'hn2',
          author: 'steveklabnik',
          avatar: '#ff8a3d',
          timeAgo: '1h ago',
          text: 'Every “rewrite” post is really a “we finally understood the problem domain” post. The second implementation of anything is faster.',
          upvotes: 176,
        },
        {
          id: 'hn3',
          author: 'throwaway_9f2',
          avatar: '#9a5a2a',
          timeAgo: '44m ago',
          text: 'Nobody’s asking about hiring. We tried this and spent a year unable to backfill. The maintenance cost never shows up in these posts.',
          upvotes: 143,
        },
      ],
    },
  ],
});
