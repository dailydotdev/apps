export type PostHighlightSignificance =
  | 'breaking'
  | 'major'
  | 'notable'
  | 'routine';

export type PostHeroSignificance =
  | PostHighlightSignificance
  | 'breakout'
  | 'evergreen';

export interface PostHero {
  id: string;
  headline: string;
  significance: PostHeroSignificance;
  size: number;
  highlightedAt: string;
}
