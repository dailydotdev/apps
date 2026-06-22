import type { ReactElement } from 'react';
import React from 'react';
import { GoogleCloudAnnouncementBar } from './GoogleCloudAnnouncementBar';
import { GoogleCloudHeadAd } from './GoogleCloudHeadAd';
import { GoogleCloudBlogCard } from './GoogleCloudBlogCard';
import { GoogleCloudStrip } from './GoogleCloudStrip';
import type { MockPost } from './MockFeedCard';
import { MockFeedCard } from './MockFeedCard';

const topPosts: MockPost[] = [
  {
    source: 'The Pragmatic Engineer',
    title:
      'How staff engineers actually spend their time (and why it surprised us)',
    tag: '#career',
    meta: 'Jun 21 · 9 min read',
    avatar: 'bg-accent-cabbage-default',
    cover:
      'bg-gradient-to-br from-accent-blueCheese-default to-accent-cabbage-default',
    upvotes: '1.4K',
    comments: '212',
  },
  {
    source: 'CSS-Tricks',
    title:
      'Container queries are finally everywhere — here is the mental model that clicks',
    tag: '#webdev',
    meta: 'Jun 21 · 7 min read',
    avatar: 'bg-accent-bun-default',
    cover: 'bg-gradient-to-br from-accent-bun-default to-accent-cheese-default',
    upvotes: '983',
    comments: '64',
  },
  {
    source: 'GitHub Blog',
    title: 'Shipping faster with merge queues: what we learned at scale',
    tag: '#devops',
    meta: 'Jun 20 · 5 min read',
    avatar: 'bg-accent-water-default',
    cover:
      'bg-gradient-to-br from-accent-water-default to-accent-cabbage-default',
    upvotes: '1.1K',
    comments: '88',
  },
  {
    source: 'OpenAI',
    title: 'Designing reliable agent loops: retries, guards, and evals',
    tag: '#ai',
    meta: 'Jun 19 · 10 min read',
    avatar: 'bg-accent-cheese-default',
    cover:
      'bg-gradient-to-br from-accent-cheese-default to-accent-ketchup-default',
    upvotes: '3.2K',
    comments: '417',
  },
];

const bottomPosts: MockPost[] = [
  {
    source: 'Rust Blog',
    title:
      'Async traits land in stable Rust — what changes for library authors',
    tag: '#rust',
    meta: 'Jun 20 · 11 min read',
    avatar: 'bg-accent-ketchup-default',
    cover:
      'bg-gradient-to-br from-accent-ketchup-default to-accent-bun-default',
    upvotes: '2.1K',
    comments: '348',
  },
  {
    source: 'Vercel',
    title: 'Edge rendering at scale: lessons from a year of streaming React',
    tag: '#nextjs',
    meta: 'Jun 20 · 6 min read',
    avatar: 'bg-accent-onion-default',
    cover:
      'bg-gradient-to-br from-accent-onion-default to-accent-blueCheese-default',
    upvotes: '1.7K',
    comments: '129',
  },
  {
    source: 'Smashing Magazine',
    title: 'Designing accessible color systems without a contrast spreadsheet',
    tag: '#design',
    meta: 'Jun 19 · 8 min read',
    avatar: 'bg-accent-lettuce-default',
    cover:
      'bg-gradient-to-br from-accent-lettuce-default to-accent-water-default',
    upvotes: '742',
    comments: '51',
  },
];

// The full Google Cloud advertiser takeover laid out as a first-time-user
// feed: announcement bar on top, then a feed grid whose first two cards are
// the sponsored blog card and the head ad slot, with the branded strip
// breaking the feed in the middle.
export const GoogleCloudTakeover = (): ReactElement => (
  <div className="mx-auto flex w-full max-w-screen-laptop flex-col gap-4 px-4 py-4">
    <GoogleCloudAnnouncementBar />
    <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
      <GoogleCloudBlogCard />
      {topPosts.map((post, index) => (
        <React.Fragment key={post.title}>
          <MockFeedCard post={post} />
          {index === 0 && <GoogleCloudHeadAd />}
        </React.Fragment>
      ))}
      <GoogleCloudStrip className="col-span-full" />
      {bottomPosts.map((post) => (
        <MockFeedCard key={post.title} post={post} />
      ))}
    </div>
  </div>
);
