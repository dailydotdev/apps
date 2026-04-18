const AGENTIC_HIGHLIGHTS_CHANNEL = 'vibes';
const AGENTIC_HIGHLIGHTS_SLUG = 'agentic';

export const getHighlightsChannelSlug = (channel: string): string =>
  channel === AGENTIC_HIGHLIGHTS_CHANNEL ? AGENTIC_HIGHLIGHTS_SLUG : channel;

export const resolveHighlightsChannelSlug = (slug: string): string =>
  slug === AGENTIC_HIGHLIGHTS_SLUG ? AGENTIC_HIGHLIGHTS_CHANNEL : slug;
