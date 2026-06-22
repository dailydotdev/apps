// Hardcoded content for the Google Cloud advertiser-takeover demo.
// The blog post is the most recent post on the Google Cloud blog
// (sourced 2026-06-20). The shared message copy is reused by both the
// announcement bar and the in-feed strip.

export const googleCloudLatestPost = {
  source: 'Google Cloud Blog',
  title: "What's new with Google Cloud",
  excerpt:
    'The latest launches, updates, and resources from Google Cloud — agentic AI, Gemini Enterprise, Spot VM optimization, and more.',
  url: 'https://cloud.google.com/blog/topics/inside-google-cloud/whats-new-google-cloud',
  image:
    'https://storage.googleapis.com/gweb-cloudblog-publish/images/whats_new_2026_CfhxFWX.max-2500x2500.jpg',
  date: 'Jun 20, 2026',
  readTime: 6,
};

// Shared messaging for the announcement bar + in-feed strip.
export const googleCloudMessage = {
  eyebrow: 'Sponsored by Google Cloud',
  title: 'Google Cloud supports developers',
  body: 'Get $300 in free credits to build, test, and ship your next project on Google Cloud — on us.',
  cta: 'Claim credits',
  ctaUrl: 'https://cloud.google.com/free',
};

// Head ad-slot content.
export const googleCloudAd = {
  company: 'Google Cloud',
  description:
    'Build what’s next. Ship faster with serverless, AI, and data tools trusted by developers worldwide.',
  cta: 'Start building free',
  url: 'https://cloud.google.com/free',
};
