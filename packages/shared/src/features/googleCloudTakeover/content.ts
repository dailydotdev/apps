// Hardcoded content for the Google Cloud advertiser-takeover demo.
// The blog post is the most recent post on the Google Cloud blog
// (sourced 2026-06-20). The shared message copy is reused by both the
// announcement bar and the in-feed strip.

import type { Ad, Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import { googleCloudLogoDataUri } from './GoogleCloudLogo';
import { hoursAgo } from './relativeTime';
import { googleCloudDiscussionCount } from './fakeDiscussion';

const googleCloudBlogUrl =
  'https://cloud.google.com/blog/topics/inside-google-cloud/whats-new-google-cloud';
const googleCloudBlogImage =
  'https://storage.googleapis.com/gweb-cloudblog-publish/images/whats_new_2026_CfhxFWX.max-2500x2500.jpg';
// A different Google Cloud blog cover for the ad slot, so it doesn't repeat
// the sponsored blog card's image.
const googleCloudAdImage =
  'https://storage.googleapis.com/gweb-cloudblog-publish/images/1148-GC-IO-Header-GC-43-0519.max-2500x2500.jpg';

// Rendered through the real ArticleGrid/ArticleList so the sponsored post
// looks identical to an organic feed card. The Google Cloud logo is supplied
// as the source avatar via a data URI.
export const googleCloudBlogPost: Post = {
  id: 'gcp-blog-demo',
  title: "What's new with Google Cloud",
  summary:
    'A roundup of the latest launches, updates, and resources from Google Cloud: agentic AI, Gemini Enterprise, Spot VM optimization, and more.',
  permalink: googleCloudBlogUrl,
  commentsPermalink: googleCloudBlogUrl,
  createdAt: hoursAgo(5),
  readTime: 6,
  image: googleCloudBlogImage,
  // `domain` drives the reader header favicon when opened in the in-app reader.
  domain: 'cloud.google.com',
  source: {
    id: 'google-cloud-blog',
    handle: 'google-cloud-blog',
    name: 'Google Cloud Blog',
    permalink: 'https://cloud.google.com/blog',
    image: googleCloudLogoDataUri,
  } as unknown as Post['source'],
  tags: ['cloud', 'ai', 'devops'],
  numUpvotes: 312,
  numComments: googleCloudDiscussionCount,
  numAwards: 0,
  // Article so "Read post" can open the real URL inside the daily.dev in-app
  // reader/browser (READER_GATE_ELIGIBLE_TYPES). The card mounts the reader
  // explicitly on read; see GoogleCloudBlogCard.
  type: PostType.Article,
};

// Rendered through the real AdGrid/AdList so it matches the live ad slot.
// `companyLogo` drives the favicon; `image` drives the cover.
export const googleCloudAd: Ad = {
  company: 'Google Cloud',
  description: 'Build what’s next on Google Cloud',
  link: 'https://cloud.google.com/free',
  source: 'Google Cloud',
  image: googleCloudAdImage,
  companyLogo: googleCloudLogoDataUri,
  callToAction: 'Start building free',
  // Advertiser cards carry tags like organic cards; these drive the chips on
  // the ad card (and the AdList/list path via `matchingTags`).
  matchingTags: ['cloud', 'ai', 'devops', 'kubernetes', 'serverless', 'gemini'],
};

// Shared messaging for the announcement bar + in-feed strip. The bar uses a
// short body so the centered logo/text/CTA group stays compact and the CTA
// sits centrally, clear of the close button.
export const googleCloudMessage = {
  title: 'Google Cloud supports developers',
  barBody: 'Get $300 in free credits, on us.',
  body: 'Get $300 in free credits to build, test, and ship your next project on Google Cloud, on us.',
  cta: 'Claim credits',
  ctaUrl: 'https://cloud.google.com/free',
};
