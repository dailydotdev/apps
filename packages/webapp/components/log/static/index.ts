// Static Log card components for share image generation
// No animations - these render the final state for screenshots

export { default as LogImageWrapper } from './LogImageWrapper';
export { default as StaticCardTotalImpact } from './StaticCardTotalImpact';
export { default as StaticCardWhenYouRead } from './StaticCardWhenYouRead';
export { default as StaticCardTopicEvolution } from './StaticCardTopicEvolution';
export { default as StaticCardFavoriteSources } from './StaticCardFavoriteSources';
export { default as StaticCardCommunityEngagement } from './StaticCardCommunityEngagement';
export { default as StaticCardContributions } from './StaticCardContributions';
export { default as StaticCardRecords } from './StaticCardRecords';
export { default as StaticCardArchetypeReveal } from './StaticCardArchetypeReveal';
export { default as StaticCardShare } from './StaticCardShare';

// Card type mapping for dynamic rendering
export const CARD_COMPONENTS = {
  'total-impact': 'StaticCardTotalImpact',
  'when-you-read': 'StaticCardWhenYouRead',
  'topic-evolution': 'StaticCardTopicEvolution',
  'favorite-sources': 'StaticCardFavoriteSources',
  community: 'StaticCardCommunityEngagement',
  contributions: 'StaticCardContributions',
  records: 'StaticCardRecords',
  archetype: 'StaticCardArchetypeReveal',
  share: 'StaticCardShare',
} as const;

export type CardType = keyof typeof CARD_COMPONENTS;
