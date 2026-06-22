// Hardcoded content for the Google Cloud advertiser-takeover demo.
// The blog post is the most recent post on the Google Cloud blog
// (sourced 2026-06-20). The shared message copy is reused by both the
// announcement bar and the in-feed strip.

import type { Ad, Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import { googleCloudLogoDataUri } from './GoogleCloudLogo';

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
  permalink: googleCloudBlogUrl,
  commentsPermalink: googleCloudBlogUrl,
  createdAt: '2026-06-20T09:00:00.000Z',
  readTime: 6,
  image: googleCloudBlogImage,
  source: {
    id: 'google-cloud-blog',
    handle: 'google-cloud-blog',
    name: 'Google Cloud Blog',
    permalink: 'https://cloud.google.com/blog',
    image: googleCloudLogoDataUri,
  } as unknown as Post['source'],
  tags: ['cloud', 'ai', 'devops'],
  numUpvotes: 312,
  numComments: 48,
  numAwards: 0,
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
};

// Shared messaging for the announcement bar + in-feed strip.
export const googleCloudMessage = {
  title: 'Google Cloud supports developers',
  body: 'Get $300 in free credits to build, test, and ship your next project on Google Cloud, on us.',
  cta: 'Claim credits',
  ctaUrl: 'https://cloud.google.com/free',
};
