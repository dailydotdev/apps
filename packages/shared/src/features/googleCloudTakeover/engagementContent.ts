// Content for the second feed card in the Google Cloud takeover: a hardcoded
// popular explore-style post that Google Cloud "promotes engagement" on via the
// real Engagement Ads system (branded upvote animation + sponsored tag).

import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import { googleCloudLogoDataUri } from './GoogleCloudLogo';
import { hoursAgo } from './relativeTime';
import { googleCloudDiscussionCount } from './fakeDiscussion';

const engagementPostUrl =
  'https://huggingface.co/blog/building-production-ai-agents';
const engagementPostImage =
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1080&q=80';

// The tag Google Cloud sponsors. Must appear in the post's tags so the
// engagement system can match and brand it.
export const googleCloudSponsoredTag = 'ai';

// A realistic, popular organic post (Share type renders identically to an
// article in ArticleGrid/ArticlePostModal but isn't reader-gated, so "Read
// post" links straight to the source instead of opening the in-app reader).
export const googleCloudEngagementPost: Post = {
  id: 'gcp-engagement-post',
  title: 'Building production-ready AI agents: lessons from a year in prod',
  summary:
    'What actually breaks when you take an AI agent from a demo to real traffic: tool calling, evals, cost control, and the guardrails we wish we had on day one.',
  permalink: engagementPostUrl,
  commentsPermalink: engagementPostUrl,
  createdAt: hoursAgo(28),
  readTime: 9,
  image: engagementPostImage,
  source: {
    id: 'huggingface',
    handle: 'huggingface',
    name: 'Hugging Face',
    permalink: 'https://huggingface.co/blog',
    image: 'https://github.com/huggingface.png',
  } as unknown as Post['source'],
  tags: [googleCloudSponsoredTag, 'machine-learning', 'llm', 'python'],
  numUpvotes: 1843,
  numComments: googleCloudDiscussionCount,
  numAwards: 0,
  type: PostType.Share,
};

// Raw Engagement Ads creative (snake_case, the boot API shape) for Google
// Cloud. Parsed/resolved by the scoped provider. Matched to the post above by
// the `tags` overlap, which drives both the branded tag and the upvote icon
// swap.
export const googleCloudEngagementCreativeRaw = {
  gen_id: 'gcp-engagement-demo',
  promoted_name: 'Google Cloud',
  promoted_body:
    'Build, deploy, and scale AI agents on Google Cloud with Vertex AI and Gemini. Get $300 in free credits to start.',
  promoted_cta: 'Start building free',
  promoted_url: 'https://cloud.google.com/free',
  promoted_logo_img: {
    dark: googleCloudLogoDataUri,
    light: googleCloudLogoDataUri,
  },
  promoted_icon_img: {
    dark: googleCloudLogoDataUri,
    light: googleCloudLogoDataUri,
  },
  promoted_gradient_start: { dark: '#4285F4', light: '#4285F4' },
  promoted_gradient_end: { dark: '#34A853', light: '#34A853' },
  tools: [],
  keywords: [],
  tags: [googleCloudSponsoredTag],
};
