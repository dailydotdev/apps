export type LeafPageDimension =
  | 'language'
  | 'usecase'
  | 'audience'
  | 'technique'
  | 'goal';

export type PromptTool = 'cursor' | 'claude-code' | 'generic';

export type ResourceType = 'video' | 'article' | 'course' | 'docs';

export type CommunityPlatform = 'dailydev' | 'reddit' | 'discord' | 'other';

export type PromptDifficulty = 'beginner' | 'intermediate' | 'stretch';

export type IconKey =
  | 'sparkle'
  | 'magic'
  | 'graduation'
  | 'hammer'
  | 'star'
  | 'trending'
  | 'terminal'
  | 'alert'
  | 'share'
  | 'upvote';

export interface Prompt {
  step: number;
  title: string;
  body: string;
  tools: PromptTool[];
  difficulty?: PromptDifficulty;
  timeEstimate?: string;
  stuckTip?: string;
  expectedOutput?: string;
  comprehensionPrompt?: string;
  challenge?: string;
}

export interface Concept {
  name: string;
  explanation: string;
}

export interface Resource {
  title: string;
  url: string;
  type: ResourceType;
  free: boolean;
}

export interface Tool {
  name: string;
  url: string;
  description: string;
}

export interface Community {
  name: string;
  url: string;
  platform: CommunityPlatform;
}

export interface RecommendedPath {
  slug: string;
  title: string;
  reason: string;
}

export interface HowItWorksStep {
  title: string;
  subtitle: string;
}

export interface TroubleshootingItem {
  problem: string;
  fix: string;
}

export interface LeafPageData {
  slug: string;
  title: string;
  description: string;
  dimension: LeafPageDimension;
  tags: string[];
  outcomes?: string[];
  aiTips?: string[];
  projectDescription?: string;
  recommendedPaths?: RecommendedPath[];
  prompts?: Prompt[];
  concepts: Concept[];
  resources: Resource[];
  tools: Tool[];
  communities: Community[];
  relatedSlugs: string[];
  lastUpdated: string;
  howItWorks?: HowItWorksStep[];
  prerequisites?: string[];
  troubleshooting?: TroubleshootingItem[];
  learningRule?: string;
  shipCta?: {
    title: string;
    body: string;
  };
}

export interface ManifestEntry {
  slug: string;
  title: string;
  dimension: LeafPageDimension;
  lastUpdated: string;
}

export interface Manifest {
  pages: ManifestEntry[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PopularPath {
  title: string;
  slug: string;
  subtitle: string;
  gradient: string;
  accentColor: string;
  iconKey: IconKey;
}

export interface HubData {
  seo: {
    title: string;
    description: string;
  };
  hero: {
    heading: string;
    subtitle: string;
  };
  popularPaths: PopularPath[];
  dimensions: {
    order: LeafPageDimension[];
    titles: Record<string, string>;
    icons: Record<string, IconKey>;
  };
  faq: FaqItem[];
}
